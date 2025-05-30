import axios from "axios";
import jwt from "jsonwebtoken";
import Controller from "../support/Controller";
import { AUTH_ACCESS_TOKEN_HMAC_KID, AUTH_ACCESS_TOKEN_SECRET, AUTH_REFRESH_TOKEN_SECRET, ZISK_COUCHDB_URL } from "../support/env";
import { CouchDBUserDocument, Credentials, RefreshTokenClaims, SessionResponse, UserClaims } from "../support/types";
import UserController from "./UserController";

const JWT_EXPIRATION_SECONDS = 15;
const REFRESH_EXPIRATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

export default class AuthController extends Controller {

  private userController: UserController = new UserController();

  /**
   * Authenticates a user with the provided credentials and returns the session response.
   * 
   * @param credentials The username and password credentials
   * @returns The session response from CouchDB
   * @throws Error if authentication fails
   */
  public async login(credentials: Credentials): Promise<SessionResponse> {
    const { username, password } = credentials;
    const basicCredentialBuffer = Buffer.from(`${username}:${password}`).toString('base64');

    const response = await axios.get<SessionResponse>(`${ZISK_COUCHDB_URL}/_session`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicCredentialBuffer}`
      }
    });

    if (!response.data || !response.data.ok) {
      throw new Error('Authentication failed');
    }

    return response.data;
  }

  /**
   * Searches the _users table for the user record which has a refresh token that matches the given token.
   * @param refreshToken The refresh token to search for
   * @returns The user document if found, or null if not found
   */
  public async findUserByRefreshToken(refreshToken: string): Promise<CouchDBUserDocument | null> {
    const result = await this.couch.db.use('_users').find({
      selector: {
        refreshTokens: {
          $elemMatch: {
            $eq: refreshToken
          }
        }
      }
    });

    return result.docs.length > 0 ? result.docs[0] as CouchDBUserDocument : null;
  }

  /**
   * Finds the user who owns the given token, then removes that token from the user's set of refresh tokens.
   * If no user is found, then nothing happens
   * 
   * @param refreshToken The refresh token to invalidate
   * @returns A promise that resolves when the token has been invalidated
   */
  public async invalidateRefreshToken(refreshToken: string): Promise<void> {
    const user = await this.findUserByRefreshToken(refreshToken);

    if (!user) {
      return;
    }

    // Filter out the token to be invalidated
    const updatedTokens = (user.refreshTokens || []).filter(token => token !== refreshToken);

    // Update the user document with the new tokens array
    await this.couch.db.use('_users').insert({
      ...user,
      refreshTokens: updatedTokens
    } as CouchDBUserDocument, user._id);
  }

  /**
   * Removes all of the refresh tokens for the given user.
   * 
   * @param name The username of the user whose tokens should be invalidated
   * @returns A promise that resolves when all tokens have been invalidated
   */
  public async invalidateAllRefreshTokensForUser(name: string): Promise<void> {
    try {
      // Get the user document using UserController
      const user = await this.userController.getUserByName(name);

      if (!user) {
        throw new Error(`User ${name} not found`);
      }

      // Update the user document to clear all refresh tokens
      await this.couch.db.use('_users').insert({
        ...user,
        refreshTokens: []
      } as CouchDBUserDocument, user._id);
    } catch (error) {
      console.error(`Failed to invalidate tokens for user ${name}:`, error);
      throw error;
    }
  }

  /**
   * Signs a new refresh token, then adds this to the user's refreshTokens field in the _users table.
   * 
   * @param name The username of the user for whom to create a refresh token
   * @returns The newly signed token
   */
  public async createRefreshTokenForUser(name: string): Promise<string> {
    const refreshClaims: RefreshTokenClaims = { name };

    // Sign the refresh token
    const refreshToken = jwt.sign(
      refreshClaims,
      AUTH_REFRESH_TOKEN_SECRET as jwt.Secret,
      { expiresIn: REFRESH_EXPIRATION_SECONDS }
    );

    try {
      // Get the user document using UserController
      const user = await this.userController.getUserByName(name);

      if (!user) {
        throw new Error(`User ${name} not found`);
      }

      // Add the new refresh token to the user's refreshTokens array
      const refreshTokens = user.refreshTokens || [];
      refreshTokens.push(refreshToken);

      // Update the user document
      await this.couch.db.use('_users').insert({
        ...user,
        refreshTokens: refreshTokens
      } as CouchDBUserDocument, user._id);

      return refreshToken;
    } catch (error) {
      console.error(`Failed to store refresh token for user ${name}:`, error);
      throw error;
    }
  }

  /**
   * Decodes a refresh token and returns its claims.
   * 
   * @param token The refresh token to decode
   * @returns The decoded refresh token claims
   * @throws Error if the token is invalid or expired
   */
  public async decodeRefreshToken(token: string): Promise<RefreshTokenClaims> {
    try {
      const decoded = jwt.verify(token, AUTH_REFRESH_TOKEN_SECRET as jwt.Secret) as jwt.JwtPayload;

      return {
        name: decoded.name
      };
    } catch (error) {
      console.error('Failed to decode refresh token:', error);
      throw error;
    }
  }

  /**
   * Rotates a refresh token by invalidating the old one and creating a new one.
   * This implements a sliding window refresh token strategy with token reuse detection.
   * 
   * @param token The refresh token to rotate
   * @returns A new refresh token if successful, or null if token reuse is detected
   */
  public async rotateRefreshToken(token: string): Promise<string | null> {
    const userForRefreshToken = await this.findUserByRefreshToken(token)
    const refreshTokenClaims = await this.decodeRefreshToken(token);
    if (!userForRefreshToken) {
      // Reuse detected
      this.invalidateAllRefreshTokensForUser(refreshTokenClaims.name)
      return null
    }

    await this.invalidateRefreshToken(token);
    return this.createRefreshTokenForUser(refreshTokenClaims.name)
  }

  /**
   * Creates a new access token based on a valid refresh token.
   * 
   * @param refreshToken The refresh token to use for creating the access token
   * @returns The newly created access token
   * @throws Error if the refresh token is invalid or the user cannot be found
   */
  public async createAccessTokenFromRefreshToken(refreshToken: string): Promise<string> {
    try {
      // Decode the refresh token to get the user's name
      const refreshTokenClaims = await this.decodeRefreshToken(refreshToken);

      // Find the user to get their roles using UserController
      const user = await this.userController.getUserByName(refreshTokenClaims.name);

      if (!user) {
        throw new Error(`User ${refreshTokenClaims.name} not found`);
      }

      // Create user claims for the access token
      const userClaims: UserClaims = {
        name: refreshTokenClaims.name,
        roles: user.roles || []
      };

      // Sign and return the access token
      return jwt.sign(
        userClaims,
        AUTH_ACCESS_TOKEN_SECRET as jwt.Secret,
        {
          expiresIn: JWT_EXPIRATION_SECONDS,
          subject: refreshTokenClaims.name,
          algorithm: 'HS256',
          keyid: AUTH_ACCESS_TOKEN_HMAC_KID
        }
      );
    } catch (error) {
      console.error('Failed to create access token from refresh token:', error);
      throw error;
    }
  }
}

import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { db } from "./db.js";

/**
 * Generates a secure random session token
 * @returns {string} Base32-encoded random token
 */
export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

/**
 * Creates a new session for a user
 * @param {string} token - The session token
 * @param {number} userId - The user ID
 * @returns {Session} The created session object
 */
export function createSession(token: string, userId: number): Session {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  };
  db.execute(
    "INSERT INTO session (id, user_id, expires_at) VALUES (?, ?, ?)",
    session.id,
    session.userId,
    Math.floor(session.expiresAt.getTime() / 1000)
  );
  return session;
}

/**
 * Validates a session token
 * @param {string} token - The session token to validate
 * @returns {SessionValidationResult} Object containing session and user if valid
 */
export function validateSessionToken(token: string): SessionValidationResult {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const row = db.queryOne(
    "SELECT session.id, session.user_id, session.expires_at, user.id FROM session INNER JOIN user ON user.id = session.user_id WHERE session.id = ?",
    sessionId
  );

  if (row === null) {
    return { session: null, user: null };
  }

  const session: Session = {
    id: row.id,
    userId: row.user_id,
    expiresAt: new Date(row.expires_at * 1000)
  };

  const user: User = {
    id: row.user_id
  };

  // Check if session has expired
  if (Date.now() >= session.expiresAt.getTime()) {
    db.execute("DELETE FROM session WHERE id = ?", session.id);
    return { session: null, user: null };
  }

  // Extend session if it's close to expiration (less than 15 days remaining)
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    db.execute(
      "UPDATE session SET expires_at = ? WHERE id = ?",
      Math.floor(session.expiresAt.getTime() / 1000),
      session.id
    );
  }

  return { session, user };
}

/**
 * Invalidates a session by its ID
 * @param {string} sessionId - The session ID to invalidate
 */
export function invalidateSession(sessionId: string): void {
  db.execute("DELETE FROM session WHERE id = ?", sessionId);
}

/**
 * Invalidates all sessions for a user
 * @param {number} userId - The user ID
 * @returns {void}
 */
export function invalidateAllSessions(userId: number): void {
  db.execute("DELETE FROM session WHERE user_id = ?", userId);
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

export interface Session {
  id: string;
  userId: number;
  expiresAt: Date;
}

export interface User {
  id: number;
}

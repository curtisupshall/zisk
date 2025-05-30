import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Request, type RequestHandler, type Response } from 'express'
import { createProxyMiddleware, type Options } from 'http-proxy-middleware'
import jwt from 'jsonwebtoken'
import path from 'path'
import { fileURLToPath } from 'url'
import AuthController from './controllers/AuthController'
import {
  AUTH_ACCESS_TOKEN_HMAC_KID,
  AUTH_ACCESS_TOKEN_SECRET,
  NODE_ENV,
  PORT,
  SERVER_NAME,
  ZISK_COUCHDB_URL
} from './support/env'
import { UserClaims } from './support/types'

// CORS
const ALLOWED_ORIGINS = ['http://localhost:9475', 'https://app.tryzisk.com', 'http://192.168.68.68:9475'];
const ENABLE_CORS = false

// Token expiration times
const JWT_EXPIRATION_SECONDS = 15;
const REFRESH_EXPIRATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Cookies
const ACCESS_TOKEN_COOKIE = 'AccessToken'
const REFRESH_TOKEN_COOKIE = 'RefreshToken'

// Initialize the AuthController
const authController = new AuthController()

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (ENABLE_CORS) {
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies and other credentials
  }));
}

const isTokenExpired = (token: string, secret: string): boolean => {
  try {
    jwt.verify(token, secret);
    return false;
  } catch (error) {
    return error instanceof jwt.TokenExpiredError;
  }
};

const tokenMiddlewareHandler: RequestHandler = async (req, res, next) => {
  const accessToken = req.cookies[ACCESS_TOKEN_COOKIE];
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];

  if (!refreshToken) {
    return next();
  }

  try {
    // Rotate the refresh token (sliding window)
    const newRefreshToken: string | null = await authController.rotateRefreshToken(refreshToken);

    if (!newRefreshToken) {
      // Token reuse detected, invalidation already happened in rotateRefreshToken
      return next();
    }

    // Set the new refresh token cookie
    res.cookie(REFRESH_TOKEN_COOKIE, newRefreshToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      maxAge: REFRESH_EXPIRATION_SECONDS * 1000,
    });

    // Check if access token is expired or absent
    if (!accessToken || isTokenExpired(accessToken, AUTH_ACCESS_TOKEN_SECRET as string)) {
      // Create new access token using the refresh token
      const newAccessToken = await authController.createAccessTokenFromRefreshToken(newRefreshToken);

      // Store the new token in res.locals for immediate use
      res.locals.authToken = newAccessToken;

      res.cookie(ACCESS_TOKEN_COOKIE, newAccessToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        maxAge: JWT_EXPIRATION_SECONDS * 1000,
      });
    }
  } catch (error) {
    console.error("Error in token middleware:", error);
    // Clear cookies on error
    res.cookie(ACCESS_TOKEN_COOKIE, '', { maxAge: 0 });
    res.cookie(REFRESH_TOKEN_COOKIE, '', { maxAge: 0 });
  }

  next();
};

// Create the proxy middleware with proper typing
const proxyMiddlewareOptions: Options = {
  target: ZISK_COUCHDB_URL, // e.g. 'http://localhost:5984'
  changeOrigin: true,
  pathRewrite: {
    '^/proxy': '', // Remove the 'proxy' prefix when forwarding
  },
  on: {
    proxyReq: (proxyReq, req: Request, res: Response) => {
      // Use the newly generated token if available, otherwise use the cookie
      const authToken = res.locals.authToken ?? req.cookies[ACCESS_TOKEN_COOKIE];

      if (authToken) {
        // Remove existing authorization header if present
        proxyReq.removeHeader('Authorization');

        // Add Bearer token
        proxyReq.setHeader('Authorization', `Bearer ${authToken}`);
      }

      // If it's a POST/PUT/PATCH request with a body, we need to restream the body
      if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    error: (err, req: Request, res: Response) => {
      res.status(500).send('Proxy Error');
    }
  }
};

app.use('/proxy', tokenMiddlewareHandler, createProxyMiddleware(proxyMiddlewareOptions));

// API routes
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/', (req: Request, res: Response) => {
  res.json({
    zisk: 'Welcome',
    version: '0.3.0',
    serverName: SERVER_NAME,
    status: 'ok',
    initialized: true,
  });
});

apiRouter.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    try {
      // Use the AuthController's login method
      const sessionResponse = await authController.login({ username, password });

      // Create user claims for the access token
      const userClaims: UserClaims = {
        name: sessionResponse.userCtx.name,
        roles: [...sessionResponse.userCtx.roles],
      };

      // Create access token
      const accessToken = jwt.sign(
        userClaims,
        AUTH_ACCESS_TOKEN_SECRET as jwt.Secret,
        {
          expiresIn: JWT_EXPIRATION_SECONDS,
          subject: username,
          algorithm: 'HS256',
          keyid: AUTH_ACCESS_TOKEN_HMAC_KID
        }
      );

      // Create refresh token
      const refreshToken = await authController.createRefreshTokenForUser(sessionResponse.userCtx.name);

      // Set cookies
      res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        maxAge: JWT_EXPIRATION_SECONDS * 1000,
      });

      res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        maxAge: REFRESH_EXPIRATION_SECONDS * 1000,
      });

      // Return success response
      res.status(200).json(sessionResponse);
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ error: 'Authentication failed' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

apiRouter.post("/logout", async (req: Request, res: Response, next): Promise<void> => {
  // Clear auth token cookie
  res.cookie(ACCESS_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    maxAge: 0,
  });

  // Clear refresh token cookie
  res.cookie(REFRESH_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    maxAge: 0,
  });

  if (req.cookies[REFRESH_TOKEN_COOKIE]) {
    const user = await authController.findUserByRefreshToken(req.cookies[REFRESH_TOKEN_COOKIE])
    if (user) {
      await authController.invalidateAllRefreshTokensForUser(user.name)
    }
  }

  res.status(200).json({ ok: true });
});

// Mount the API router
app.use('/api', apiRouter);

// Serve static files from the built Vite app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../../app/dist');

// Serve static files from the Vite build output
app.use(express.static(distPath));

// Catch-all route to serve index.html for client-side routing with Tanstack Router
app.get('*', (req: Request, res: Response, next) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

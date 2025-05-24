import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { db } from './db.js';
import { createSession, generateSessionToken, invalidateAllSessions, invalidateSession, Session, User, validateSessionToken } from './session.js';

// Extend Express Request type to include user and session
declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: Session;
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple authentication middleware
const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication token required' });
    return;
  }

  const { session, user } = validateSessionToken(token);

  if (!session || !user) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return;
  }

  // Attach user and session to request object
  req.user = user;
  req.session = session;
  next();
};

// Routes

// Create a test user
app.post('/api/users/test', (req: Request, res: Response): void => {
  try {
    const result = db.execute('INSERT INTO user DEFAULT VALUES');
    const userId = Number(result.lastInsertRowid);
    res.status(201).json({ userId });
  } catch (error) {
    console.error('Error creating test user:', error);
    res.status(500).json({ error: 'Failed to create test user' });
  }
});

// Login route (simplified for demonstration)
app.post('/api/login', (req: Request, res: Response): void => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Check if user exists
    const user = db.queryOne('SELECT id FROM user WHERE id = ?', userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Generate session token and create session
    const token = generateSessionToken();
    const session = createSession(token, userId);

    res.status(200).json({ token, userId, expiresAt: session.expiresAt });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected route example
app.get('/api/protected', authenticate, (req: Request, res: Response): void => {
  res.json({
    message: 'You have access to this protected resource',
    userId: req.user!.id,
    sessionExpiresAt: req.session!.expiresAt
  });
});

// Logout route
app.post('/api/logout', authenticate, (req: Request, res: Response): void => {
  try {
    invalidateSession(req.session!.id);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Logout from all devices
app.post('/api/logout-all', authenticate, (req: Request, res: Response): void => {
  try {
    invalidateAllSessions(req.user!.id);
    res.status(200).json({ message: 'Logged out from all devices' });
  } catch (error) {
    console.error('Error during logout from all devices:', error);
    res.status(500).json({ error: 'Logout from all devices failed' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Session management system initialized`);
  console.log(`Hot reload is working!`);
});

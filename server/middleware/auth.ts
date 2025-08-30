import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/jwt';
import { User } from '../models/user';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      isAuthenticated?: boolean;
    }
  }
}

// Authentication middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from various sources
    const token = getTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    // Verify token
    const decoded = verifyJWT(token);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user is active
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        error: 'Email not verified',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Attach user to request
    req.user = user;
    req.isAuthenticated = true;
    
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Token expired') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      } else if (error.message === 'Invalid token') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          code: 'TOKEN_INVALID'
        });
      }
    }
    
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = getTokenFromRequest(req);
    
    if (token) {
      const decoded = verifyJWT(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isEmailVerified) {
        req.user = user;
        req.isAuthenticated = true;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Role-based access control middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Check if user has required role
    if (!roles.includes(req.user.role || 'user')) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

// Admin-only middleware
export const requireAdmin = requireRole(['admin']);

// Premium user middleware
export const requirePremium = requireRole(['admin', 'premium']);

// Check if user owns the resource
export const requireOwnership = (resourceUserIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (resourceUserId && resourceUserId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this resource',
        code: 'ACCESS_DENIED'
      });
    }

    next();
  };
};

// Rate limiting middleware
export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    const userRequests = requests.get(ip);
    
    if (!userRequests || now > userRequests.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
    } else {
      userRequests.count++;
      
      if (userRequests.count > maxRequests) {
        return res.status(429).json({
          success: false,
          error: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED'
        });
      }
    }
    
    next();
  };
};

// CSRF protection middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token validation failed',
      code: 'CSRF_VALIDATION_FAILED'
    });
  }

  next();
};

// Helper function to extract token from request
function getTokenFromRequest(req: Request): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  if (req.cookies?.authToken) {
    return req.cookies.authToken;
  }

  // Check query parameters
  if (req.query.token) {
    return req.query.token as string;
  }

  // Check body
  if (req.body?.token) {
    return req.body.token;
  }

  return null;
}

// Session validation middleware
export const validateSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.session) {
      return res.status(401).json({
        success: false,
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND'
      });
    }

    // Check if session has user ID
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session',
        code: 'INVALID_SESSION'
      });
    }

    // Validate user exists and is active
    const user = await User.findById(req.session.userId).select('-password');
    
    if (!user || !user.isEmailVerified) {
      // Clear invalid session
      req.session.destroy((err) => {
        if (err) console.error('Session destruction error:', err);
      });
      
      return res.status(401).json({
        success: false,
        error: 'Session expired',
        code: 'SESSION_EXPIRED'
      });
    }

    req.user = user;
    req.isAuthenticated = true;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Session validation failed',
      code: 'SESSION_VALIDATION_FAILED'
    });
  }
};

// Logout middleware
export const logout = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Clear session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) console.error('Session destruction error:', err);
      });
    }

    // Clear cookies
    res.clearCookie('authToken');
    res.clearCookie('connect.sid');

    next();
  } catch (error) {
    next(error);
  }
}; 
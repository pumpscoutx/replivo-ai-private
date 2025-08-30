import jwt from 'jsonwebtoken';
import { IUser } from '../models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface JWTPayload {
  userId: string;
  email: string;
  authProvider: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat: number;
  exp: number;
}

// Generate JWT token for user
export const generateJWT = (user: IUser): string => {
  const payload: JWTPayload = {
    userId: (user._id as any).toString(),
    email: user.email,
    authProvider: user.authProvider,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
    issuer: 'replivo-ai',
    audience: 'replivo-users'
  });
};

// Generate refresh token
export const generateRefreshToken = (userId: string, tokenId: string): string => {
  const payload: RefreshTokenPayload = {
    userId,
    tokenId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN as any,
    issuer: 'replivo-ai',
    audience: 'replivo-refresh'
  });
};

// Verify JWT token
export const verifyJWT = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'replivo-ai',
      audience: 'replivo-users'
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'replivo-ai',
      audience: 'replivo-refresh'
    }) as RefreshTokenPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
};

// Decode JWT token without verification (for debugging)
export const decodeJWT = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error('Failed to decode token');
  }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Get token expiration time
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

// Generate short-lived token for email verification
export const generateEmailVerificationToken = (userId: string, email: string): string => {
  const payload = {
    userId,
    email,
    purpose: 'email-verification',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'replivo-ai',
    audience: 'replivo-email-verification'
  });
};

// Generate password reset token
export const generatePasswordResetToken = (userId: string, email: string): string => {
  const payload = {
    userId,
    email,
    purpose: 'password-reset',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h',
    issuer: 'replivo-ai',
    audience: 'replivo-password-reset'
  });
};

// Verify purpose-specific tokens
export const verifyPurposeToken = (token: string, purpose: string): any => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (decoded.purpose !== purpose) {
      throw new Error(`Invalid token purpose. Expected: ${purpose}, Got: ${decoded.purpose}`);
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw error;
    }
  }
};

// Generate API key for external integrations
export const generateAPIKey = (userId: string, permissions: string[]): string => {
  const payload = {
    userId,
    permissions,
    type: 'api-key',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1y',
    issuer: 'replivo-ai',
    audience: 'replivo-api'
  });
};

// Verify API key
export const verifyAPIKey = (token: string): any => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'replivo-ai',
      audience: 'replivo-api'
    }) as any;
    
    if (decoded.type !== 'api-key') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('API key expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid API key');
    } else {
      throw error;
    }
  }
}; 
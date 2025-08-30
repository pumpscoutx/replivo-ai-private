import express from 'express';
import passport from 'passport';
import { User } from '../models/user';
import { generateJWT, verifyJWT, generateEmailVerificationToken, generatePasswordResetToken } from '../utils/jwt';
import { authenticateToken, optionalAuth, rateLimit } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Rate limiting for auth endpoints
const authRateLimit = rateLimit(5, 15 * 60 * 1000); // 5 requests per 15 minutes

// Google OAuth Routes
router.get('/google', authRateLimit, (req, res, next) => {
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })(req, res, next);
});

router.get('/google/callback', authRateLimit, (req, res, next) => {
  passport.authenticate('google', { 
    failureRedirect: '/login?error=google_auth_failed',
    session: false 
  }, async (err: any, user: any) => {
    if (err) {
      console.error('Google OAuth callback error:', err);
      return res.redirect('/login?error=google_auth_failed');
    }

    if (!user) {
      return res.redirect('/login?error=google_auth_failed');
    }

    try {
      // Generate JWT token
      const token = generateJWT(user);
      
      // Set JWT token in HTTP-only cookie
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Redirect to dashboard with success
      res.redirect('/dashboard?auth=success');
    } catch (error) {
      console.error('JWT generation error:', error);
      res.redirect('/login?error=token_generation_failed');
    }
  })(req, res, next);
});

// Local Authentication Routes
router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { email, name, password } = req.body;

    // Validation
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required',
        code: 'MISSING_FIELDS'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Create new user
    const user = new User({
      email,
      name,
      password,
      authProvider: 'local',
      isEmailVerified: false, // Will be verified via email
      createdAt: new Date()
    });

    await user.save();

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken(user._id.toString(), user.email);

    // TODO: Send verification email
    console.log('Email verification token:', verificationToken);

    // Generate JWT token
    const token = generateJWT(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        authProvider: user.authProvider
      },
      token,
      requiresEmailVerification: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      code: 'REGISTRATION_FAILED'
    });
  }
});

router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if user can use password authentication
    if (!user.canUsePassword()) {
      return res.status(401).json({
        success: false,
        error: 'This account does not support password authentication',
        code: 'PASSWORD_AUTH_NOT_SUPPORTED'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        error: 'Email not verified',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token
    const token = generateJWT(user);

    // Set JWT token in HTTP-only cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        authProvider: user.authProvider,
        avatar: user.avatar
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      code: 'LOGIN_FAILED'
    });
  }
});

// Link Google account to existing local account
router.post('/link-google', authenticateToken, authRateLimit, async (req, res) => {
  try {
    const { googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({
        success: false,
        error: 'Google token is required',
        code: 'MISSING_GOOGLE_TOKEN'
      });
    }

    // Verify Google token and get user info
    // This would typically involve calling Google's API
    // For now, we'll simulate this process
    
    const user = req.user;
    
    // Check if user already has Google linked
    if (user.googleId) {
      return res.status(400).json({
        success: false,
        error: 'Google account already linked',
        code: 'GOOGLE_ALREADY_LINKED'
      });
    }

    // TODO: Verify Google token and get Google profile
    // For now, we'll simulate linking
    
    // Update user to support both auth methods
    user.authProvider = 'both';
    user.isEmailVerified = true; // Google accounts are verified
    await user.save();

    res.json({
      success: true,
      message: 'Google account linked successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Google linking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to link Google account',
      code: 'GOOGLE_LINKING_FAILED'
    });
  }
});

// Unlink Google account
router.post('/unlink-google', authenticateToken, authRateLimit, async (req, res) => {
  try {
    const user = req.user;

    if (!user.googleId) {
      return res.status(400).json({
        success: false,
        error: 'No Google account linked',
        code: 'NO_GOOGLE_ACCOUNT'
      });
    }

    if (user.authProvider === 'google') {
      return res.status(400).json({
        success: false,
        error: 'Cannot unlink Google account if it\'s the only authentication method',
        code: 'GOOGLE_ONLY_AUTH'
      });
    }

    // Unlink Google account
    user.googleId = undefined;
    user.authProvider = 'local';
    await user.save();

    res.json({
      success: true,
      message: 'Google account unlinked successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        authProvider: user.authProvider
      }
    });

  } catch (error) {
    console.error('Google unlinking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unlink Google account',
      code: 'GOOGLE_UNLINKING_FAILED'
    });
  }
});

// Password reset request
router.post('/forgot-password', authRateLimit, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        code: 'MISSING_EMAIL'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent'
      });
    }

    // Generate password reset token
    const resetToken = generatePasswordResetToken(user._id.toString(), user.email);

    // TODO: Send password reset email
    console.log('Password reset token:', resetToken);

    res.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request',
      code: 'PASSWORD_RESET_FAILED'
    });
  }
});

// Reset password with token
router.post('/reset-password', authRateLimit, async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required',
        code: 'MISSING_FIELDS'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    // Verify reset token
    const decoded = verifyJWT(token);
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reset token',
        code: 'INVALID_TOKEN'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password',
      code: 'PASSWORD_RESET_FAILED'
    });
  }
});

// Verify email with token
router.post('/verify-email', authRateLimit, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required',
        code: 'MISSING_TOKEN'
      });
    }

    // Verify email verification token
    const decoded = verifyJWT(token);
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification token',
        code: 'INVALID_TOKEN'
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify email',
      code: 'EMAIL_VERIFICATION_FAILED'
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        authProvider: user.authProvider,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user information',
      code: 'GET_USER_FAILED'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, authRateLimit, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = req.user;

    // Update allowed fields
    if (name !== undefined) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        authProvider: user.authProvider
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      code: 'PROFILE_UPDATE_FAILED'
    });
  }
});

// Change password
router.post('/change-password', authenticateToken, authRateLimit, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current and new passwords are required',
        code: 'MISSING_PASSWORDS'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    const user = req.user;

    // Check if user can use password authentication
    if (!user.canUsePassword()) {
      return res.status(400).json({
        success: false,
        error: 'This account does not support password authentication',
        code: 'PASSWORD_AUTH_NOT_SUPPORTED'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect',
        code: 'INCORRECT_CURRENT_PASSWORD'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password',
      code: 'PASSWORD_CHANGE_FAILED'
    });
  }
});

// Logout
router.post('/logout', authenticateToken, (req, res) => {
  try {
    // Clear the auth cookie
    res.clearCookie('authToken');
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to logout',
      code: 'LOGOUT_FAILED'
    });
  }
});

// Refresh token
router.post('/refresh', optionalAuth, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    // Verify refresh token
    const decoded = verifyJWT(refreshToken);
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid refresh token',
        code: 'INVALID_TOKEN'
      });
    }

    // Generate new access token
    const newToken = generateJWT(user);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token',
      code: 'TOKEN_REFRESH_FAILED'
    });
  }
});

export default router; 
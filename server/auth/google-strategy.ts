import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user';
import { generateJWT } from '../utils/jwt';

// Google OAuth Strategy Configuration
export const configureGoogleStrategy = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_OAUTH_CLIENT_ID || 'your-google-client-id',
        clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || 'your-google-client-secret',
        callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        scope: ['profile', 'email'],
        accessType: 'offline',
        prompt: 'consent'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('Google OAuth callback received:', {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            displayName: profile.displayName
          });

          // Extract user information from Google profile
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value;
          const displayName = profile.displayName;
          const avatar = profile.photos?.[0]?.value;

          if (!email) {
            return done(new Error('Email is required from Google profile'), null);
          }

          // Check if user already exists
          let user = await User.findOne({ 
            $or: [
              { googleId: googleId },
              { email: email }
            ]
          });

          if (user) {
            // User exists - update Google ID if not set
            if (!user.googleId) {
              user.googleId = googleId;
              user.lastLoginAt = new Date();
              await user.save();
            } else {
              // Update last login
              user.lastLoginAt = new Date();
              await user.save();
            }

            console.log('Existing user logged in:', user.email);
            return done(null, user);
          } else {
            // Create new user
            user = new User({
              email: email,
              name: displayName || 'Google User',
              googleId: googleId,
              avatar: avatar,
              isEmailVerified: true, // Google emails are verified
              authProvider: 'google',
              lastLoginAt: new Date(),
              createdAt: new Date()
            });

            await user.save();
            console.log('New user created via Google:', user.email);
            return done(null, user);
          }
        } catch (error) {
          console.error('Google OAuth strategy error:', error);
          return done(error, null);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

// Google OAuth Routes Handler
export const handleGoogleAuth = (req: any, res: any) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
};

// Google OAuth Callback Handler
export const handleGoogleCallback = (req: any, res: any) => {
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
  })(req, res);
};

// Google OAuth Logout Handler
export const handleGoogleLogout = (req: any, res: any) => {
  // Clear the auth cookie
  res.clearCookie('authToken');
  
  // Destroy session if using sessions
  if (req.session) {
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
    });
  }

  // Redirect to login page
  res.redirect('/login?logout=success');
};

// Verify Google Token (for API calls)
export const verifyGoogleToken = async (token: string) => {
  try {
    // Verify the JWT token
    const decoded = generateJWT.verify(token);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw new Error('Invalid token');
  }
}; 
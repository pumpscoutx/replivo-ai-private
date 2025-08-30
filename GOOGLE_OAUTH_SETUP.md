# Google OAuth Setup Guide for Replivo AI

This guide will walk you through setting up Google OAuth authentication for your Replivo AI project.

## Prerequisites

- Google Cloud Console account
- Node.js and npm installed
- MongoDB running locally or cloud instance

## Step 1: Google Cloud Console Setup

### 1.1 Create a New Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `replivo-ai-oauth`
4. Click "Create"

### 1.2 Enable Google+ API
1. In the left sidebar, click "APIs & Services" → "Library"
2. Search for "Google+ API" and click on it
3. Click "Enable"

### 1.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen first:
   - User Type: External
   - App name: Replivo AI
   - User support email: your-email@gmail.com
   - Developer contact information: your-email@gmail.com
   - Save and continue through other sections

### 1.4 Configure OAuth Consent Screen
1. Go to "OAuth consent screen"
2. Add scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
3. Add test users (your email addresses)
4. Save

### 1.5 Create OAuth Client ID
1. Go back to "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: "Web application"
4. Name: "Replivo AI Web Client"
5. Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
6. Click "Create"
7. **Save the Client ID and Client Secret** - you'll need these!

## Step 2: Environment Configuration

### 2.1 Update Environment Variables
Update your `.env` file or `start-server.ps1` with the credentials from Step 1:

```bash
# Google OAuth Configuration
GOOGLE_OAUTH_CLIENT_ID=your-actual-client-id-here
GOOGLE_OAUTH_CLIENT_SECRET=your-actual-client-secret-here
GOOGLE_OAUTH_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Other required variables
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SESSION_SECRET=your-super-secret-session-key-change-in-production
MONGODB_URI=mongodb://localhost:27017/replivo-ai
```

### 2.2 Update start-server.ps1
Replace the placeholder values in `start-server.ps1`:

```powershell
$env:GOOGLE_OAUTH_CLIENT_ID = "your-actual-client-id-here"
$env:GOOGLE_OAUTH_CLIENT_SECRET = "your-actual-client-secret-here"
$env:GOOGLE_OAUTH_CALLBACK_URL = "http://localhost:5000/api/auth/google/callback"
```

## Step 3: Database Setup

### 3.1 Install MongoDB
If you don't have MongoDB installed:

**Windows:**
1. Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Install with default settings
3. Start MongoDB service

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 3.2 Verify MongoDB Connection
The server will automatically connect to MongoDB when it starts. Make sure MongoDB is running before starting the server.

## Step 4: Testing the Setup

### 4.1 Start the Server
```bash
# Using PowerShell
powershell -ExecutionPolicy Bypass -File start-server.ps1

# Or manually
npm run dev:server
```

### 4.2 Start the Client
```bash
npm run dev:client
```

### 4.3 Test Google OAuth
1. Open your browser to `http://localhost:5173`
2. Click "Get Started" → "Sign in with Google"
3. You should be redirected to Google's OAuth consent screen
4. After authorization, you should be redirected back to your dashboard

## Step 5: Troubleshooting

### Common Issues

#### 1. "redirect_uri_mismatch" Error
- Ensure the redirect URI in Google Cloud Console exactly matches your callback URL
- Check for trailing slashes or protocol mismatches

#### 2. "invalid_client" Error
- Verify your Client ID and Client Secret are correct
- Make sure you're using the right credentials for the right environment

#### 3. MongoDB Connection Error
- Ensure MongoDB is running
- Check the connection string in your environment variables
- Verify MongoDB is accessible on the specified port

#### 4. Session/Token Issues
- Check that JWT_SECRET and SESSION_SECRET are set
- Ensure cookies are being set properly
- Check browser console for CORS errors

### Debug Steps
1. Check server console for error messages
2. Verify environment variables are loaded correctly
3. Check MongoDB connection status
4. Test OAuth flow in incognito/private browsing mode
5. Verify redirect URIs in Google Cloud Console

## Step 6: Production Deployment

### 6.1 Update OAuth Consent Screen
1. Go to Google Cloud Console → OAuth consent screen
2. Change User Type from "External" to "Internal" (if using Google Workspace)
3. Add production domain to authorized domains
4. Publish the app

### 6.2 Update Environment Variables
```bash
GOOGLE_OAUTH_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
NODE_ENV=production
SECURE_COOKIES=true
CORS_ORIGIN=https://yourdomain.com
```

### 6.3 Security Considerations
- Use strong, unique secrets for JWT_SECRET and SESSION_SECRET
- Enable HTTPS in production
- Set secure cookie flags
- Implement rate limiting
- Monitor OAuth usage and errors

## API Endpoints

Once configured, these endpoints will be available:

- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/register` - Local user registration
- `POST /api/auth/login` - Local user login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/verify-email` - Verify email with token

## User Flow

1. **New User (Google OAuth):**
   - Clicks "Sign in with Google"
   - Authorizes on Google
   - Account created automatically
   - Redirected to dashboard

2. **Existing User (Google OAuth):**
   - Clicks "Sign in with Google"
   - Authorizes on Google
   - Logged in automatically
   - Redirected to dashboard

3. **Local Registration:**
   - User fills registration form
   - Account created with email verification required
   - Verification email sent (TODO: implement email service)

4. **Local Login:**
   - User enters email/password
   - JWT token generated
   - User logged in

## Next Steps

After successful OAuth setup:

1. Implement email verification service
2. Add password reset functionality
3. Implement user profile management
4. Add role-based access control
5. Set up user analytics and monitoring
6. Implement account linking (Google + Local)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Check MongoDB connection
4. Review Google Cloud Console settings
5. Check server logs for detailed error messages

## Security Notes

- Never commit real OAuth credentials to version control
- Use environment variables for all sensitive data
- Implement proper session management
- Use HTTPS in production
- Regularly rotate secrets and API keys
- Monitor OAuth usage for suspicious activity 
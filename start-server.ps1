# Start server using .env file
Write-Host "Starting Replivo AI Server with .env configuration..." -ForegroundColor Green

# Set environment variables directly
Write-Host "Setting environment variables..." -ForegroundColor Yellow
$env:GROQ_API_KEY1 = "YOUR_GROQ_API_KEY1_HERE"
$env:GROQ_API_KEY2 = "YOUR_GROQ_API_KEY2_HERE"
$env:GROQ_API_KEY3 = "YOUR_GROQ_API_KEY3_HERE"
$env:JWT_SECRET = "your-super-secret-jwt-key-change-in-production"
$env:JWT_EXPIRES_IN = "7d"
$env:JWT_REFRESH_EXPIRES_IN = "30d"
$env:SESSION_SECRET = "your-super-secret-session-key-change-in-production"
$env:MONGODB_URI = "mongodb://localhost:27017/replivo-ai"
$env:GOOGLE_OAUTH_CLIENT_ID = "your-google-oauth-client-id"
$env:GOOGLE_OAUTH_CLIENT_SECRET = "your-google-oauth-client-secret"
$env:GOOGLE_OAUTH_CALLBACK_URL = "http://localhost:5000/api/auth/google/callback"
$env:NODE_ENV = "development"
$env:PORT = "5000"

Write-Host "Set GROQ_API_KEY1" -ForegroundColor Gray
Write-Host "Set GROQ_API_KEY2" -ForegroundColor Gray
Write-Host "Set GROQ_API_KEY3" -ForegroundColor Gray
Write-Host "Set JWT_SECRET" -ForegroundColor Gray
Write-Host "Set JWT_EXPIRES_IN" -ForegroundColor Gray
Write-Host "Set JWT_REFRESH_EXPIRES_IN" -ForegroundColor Gray
Write-Host "Set SESSION_SECRET" -ForegroundColor Gray
Write-Host "Set MONGODB_URI" -ForegroundColor Gray
Write-Host "Set GOOGLE_OAUTH_CLIENT_ID" -ForegroundColor Gray
Write-Host "Set GOOGLE_OAUTH_CLIENT_SECRET" -ForegroundColor Gray
Write-Host "Set GOOGLE_OAUTH_CALLBACK_URL" -ForegroundColor Gray
Write-Host "Set NODE_ENV" -ForegroundColor Gray
Write-Host "Set PORT" -ForegroundColor Gray

# Start the server
Write-Host "Starting server..." -ForegroundColor Green
npx tsx server/index.ts 
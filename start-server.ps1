# Start server using .env file
Write-Host "Starting Replivo AI Server with .env configuration..." -ForegroundColor Green

# Set environment variables directly
Write-Host "Setting environment variables..." -ForegroundColor Yellow
$env:GROQ_API_KEY1 = "YOUR_GROQ_API_KEY1_HERE"
$env:GROQ_API_KEY2 = "YOUR_GROQ_API_KEY2_HERE"
$env:GROQ_API_KEY3 = "YOUR_GROQ_API_KEY3_HERE"
$env:JWT_SECRET = "your-super-secret-jwt-key-change-in-production"
$env:NODE_ENV = "development"
$env:PORT = "5000"

Write-Host "Set GROQ_API_KEY1" -ForegroundColor Gray
Write-Host "Set GROQ_API_KEY2" -ForegroundColor Gray
Write-Host "Set GROQ_API_KEY3" -ForegroundColor Gray
Write-Host "Set JWT_SECRET" -ForegroundColor Gray
Write-Host "Set NODE_ENV" -ForegroundColor Gray
Write-Host "Set PORT" -ForegroundColor Gray

# Start the server
Write-Host "Starting server..." -ForegroundColor Green
npx tsx server/index.ts 
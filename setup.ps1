# Ghana School Management System - Setup Script
# Run this script to set up the project quickly

Write-Host "🏫 Ghana School Management System - Setup" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 16 or higher." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if Firebase CLI is installed
Write-Host "Checking Firebase CLI installation..." -ForegroundColor Cyan
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI installed: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Firebase CLI not found." -ForegroundColor Yellow
    Write-Host "Installing Firebase CLI globally..." -ForegroundColor Cyan
    npm install -g firebase-tools
    Write-Host "✅ Firebase CLI installed" -ForegroundColor Green
}

Write-Host ""

# Install project dependencies
Write-Host "Installing project dependencies..." -ForegroundColor Cyan
Write-Host "This may take a few minutes..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check Firebase login
Write-Host "Checking Firebase authentication..." -ForegroundColor Cyan
$firebaseProjects = firebase projects:list 2>&1

if ($firebaseProjects -match "school-management-system-afc40") {
    Write-Host "✅ Connected to Firebase project" -ForegroundColor Green
} else {
    Write-Host "⚠️  Not logged into Firebase" -ForegroundColor Yellow
    Write-Host "Run: firebase login" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Login to Firebase (if needed):" -ForegroundColor White
Write-Host "   firebase login" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Deploy security rules:" -ForegroundColor White
Write-Host "   cd firebase" -ForegroundColor Yellow
Write-Host "   firebase deploy --only database:rules,storage:rules" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Read the quick start guide:" -ForegroundColor White
Write-Host "   QUICK_START.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green

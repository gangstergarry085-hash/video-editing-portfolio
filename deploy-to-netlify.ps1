<#
.SYNOPSIS
    One-click automated deployment to Netlify with full database and admin panel setup.
#>

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Dev Anand Portfolio - Netlify 1-Click Deployment       " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not installed or not in PATH." -ForegroundColor Red
    Exit 1
}

# 2. Authenticate with Netlify
Write-Host "[STEP 1/4] Checking Netlify login..." -ForegroundColor Yellow
$status = npx -y netlify status 2>&1
if ($status -like "*Not logged in*" -or $status -like "*Error*") {
    Write-Host "Please authorize Netlify in the browser window that opens..." -ForegroundColor Cyan
    npx -y netlify login
}

# 3. Link or Create Netlify Site
Write-Host ""
Write-Host "[STEP 2/4] Initializing Netlify site..." -ForegroundColor Yellow
npx -y netlify init

# 4. Set Environment Variables Automatically
Write-Host ""
Write-Host "[STEP 3/4] Configuring Database & Admin Credentials..." -ForegroundColor Yellow
$dbUrl = "postgresql://neondb_owner:npg_Uk1LXvNzhBb6@ep-tiny-block-b3m1908u-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

npx -y netlify env:set NODE_ENV "production"
npx -y netlify env:set DATABASE_URL $dbUrl
npx -y netlify env:set SESSION_SECRET "dev-session-secret-change-in-production"
npx -y netlify env:set ADMIN_EMAIL "admin@devanand.com"
npx -y netlify env:set ADMIN_PASSWORD "garry@2004"

# Optional Cloudinary support if present in server/.env
if (Test-Path "server/.env") {
    $envContent = Get-Content "server/.env" -Raw
    if ($envContent -match "CLOUDINARY_CLOUD_NAME=(.+)") {
        $cName = $Matches[1].Trim()
        if ($cName -and $cName -ne "your_cloud_name") {
            npx -y netlify env:set STORAGE_PROVIDER "cloudinary"
            npx -y netlify env:set CLOUDINARY_CLOUD_NAME $cName
        }
    }
    if ($envContent -match "CLOUDINARY_API_KEY=(.+)") {
        $cKey = $Matches[1].Trim()
        if ($cKey -and $cKey -ne "your_api_key") {
            npx -y netlify env:set CLOUDINARY_API_KEY $cKey
        }
    }
    if ($envContent -match "CLOUDINARY_API_SECRET=(.+)") {
        $cSecret = $Matches[1].Trim()
        if ($cSecret -and $cSecret -ne "your_api_secret") {
            npx -y netlify env:set CLOUDINARY_API_SECRET $cSecret
        }
    }
}

Write-Host "[OK] Environment variables configured successfully." -ForegroundColor Green

# 5. Build and Deploy to Production
Write-Host ""
Write-Host "[STEP 4/4] Building and Deploying to Production CDN & Serverless API..." -ForegroundColor Yellow
npx -y netlify deploy --prod --build

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETE!                                    " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Admin Panel is live at: https://<your-site>.netlify.app/admin" -ForegroundColor Cyan
Write-Host "Login Email:    admin@devanand.com" -ForegroundColor White
Write-Host "Login Password: garry@2004" -ForegroundColor White
Write-Host ""

<#
.SYNOPSIS
    One-click setup and push script for GitHub Pages deployment.
.DESCRIPTION
    Configures git branch, remote repository URL, and pushes your code to GitHub.
#>

param (
    [Parameter(Mandatory=$false)]
    [string]$RepoUrl
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Dev Anand Portfolio - GitHub Setup & Deployment Helper   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Git is not installed or not in PATH." -ForegroundColor Red
    Exit 1
}

# 2. Check current remote
$existingOrigin = git remote get-url origin 2>$null

if (-not [string]::IsNullOrWhiteSpace($existingOrigin)) {
    Write-Host "[INFO] Remote 'origin' is already configured:" -ForegroundColor Green
    Write-Host "       $existingOrigin" -ForegroundColor Yellow
    Write-Host ""
    $useExisting = Read-Host "Do you want to push to this remote? (y/n, default: y)"
    if ($useExisting -eq 'n' -or $useExisting -eq 'N') {
        $RepoUrl = Read-Host "Enter new GitHub Repository URL (e.g., https://github.com/username/repo.git)"
        if (-not [string]::IsNullOrWhiteSpace($RepoUrl)) {
            git remote set-url origin $RepoUrl
            Write-Host "[OK] Remote 'origin' updated to: $RepoUrl" -ForegroundColor Green
        }
    }
} else {
    if ([string]::IsNullOrWhiteSpace($RepoUrl)) {
        Write-Host "Please enter your GitHub repository URL." -ForegroundColor White
        Write-Host "(Create a new empty repository at https://github.com/new if you haven't yet)" -ForegroundColor Gray
        $RepoUrl = Read-Host "GitHub Repo URL (e.g. https://github.com/username/my-portfolio.git)"
    }

    if ([string]::IsNullOrWhiteSpace($RepoUrl)) {
        Write-Host "[ERROR] No repository URL provided. Aborting." -ForegroundColor Red
        Exit 1
    }

    git remote add origin $RepoUrl
    Write-Host "[OK] Added remote origin: $RepoUrl" -ForegroundColor Green
}

# 3. Rename branch to main
git branch -M main
Write-Host "[OK] Branch set to 'main'." -ForegroundColor Green

# 4. Commit any pending changes
$status = git status --porcelain
if (-not [string]::IsNullOrWhiteSpace($status)) {
    Write-Host "[INFO] Staging and committing latest changes..." -ForegroundColor Cyan
    git add .
    git commit -m "feat: complete portfolio improvements, admin fixes, and github pages deployment"
    Write-Host "[OK] Changes committed." -ForegroundColor Green
} else {
    Write-Host "[OK] Working tree clean, everything committed." -ForegroundColor Green
}

# 5. Push to GitHub
Write-Host ""
Write-Host "[INFO] Pushing code to GitHub (branch: main)..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "  SUCCESS! Code pushed to GitHub successfully!            " -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "NEXT STEP TO GO LIVE ON GITHUB PAGES (takes 10 seconds):" -ForegroundColor Yellow
    Write-Host "1. Open your repository on GitHub in your browser"
    Write-Host "2. Go to: Settings -> Pages"
    Write-Host "3. Under 'Build and deployment' -> 'Source', select: GitHub Actions"
    Write-Host "4. Your site will automatically build and publish to your free .github.io domain!"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[WARNING] Push encountered an issue." -ForegroundColor Yellow
    Write-Host "If this is your first push with Git on Windows, GitHub may require a Personal Access Token (PAT) or login." -ForegroundColor Gray
    Write-Host "You can retry pushing anytime with: git push -u origin main" -ForegroundColor White
}

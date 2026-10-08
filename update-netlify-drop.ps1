<#
.SYNOPSIS
    Automates baking your portfolio edits into a new Netlify Drop zip file.
#>

param (
    [string]$BackupFilePath = ""
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Dev Anand Portfolio - Netlify Drop Package Generator   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$downloadsPath = Join-Path ([Environment]::GetFolderPath('UserProfile')) "Downloads"
$targetJson = "client/src/data/portfolioData.json"

$backupFile = $null

if ($BackupFilePath -and (Test-Path $BackupFilePath)) {
    $backupFile = Get-Item $BackupFilePath
} else {
    # Check Downloads folder for recent export
    $recentDownloads = Get-ChildItem -Path $downloadsPath -Filter "*portfolio-backup*.json" -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if ($recentDownloads) {
        $backupFile = $recentDownloads
    }
}

if ($backupFile) {
    Write-Host "[INFO] Detected backup file: $($backupFile.Name)" -ForegroundColor Green
    Write-Host "       Modified at: $($backupFile.LastWriteTime)" -ForegroundColor Gray
    Write-Host "Copying to $targetJson..." -ForegroundColor Cyan
    Copy-Item -Path $backupFile.FullName -Destination $targetJson -Force
    Write-Host "[OK] Portfolio data updated successfully!" -ForegroundColor Green
} else {
    Write-Host "[NOTICE] No 'dev-anand-portfolio-backup-*.json' found in your Downloads." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If you have not exported your data yet:" -ForegroundColor White
    Write-Host "  1. Open your portfolio in the browser where your edits are visible." -ForegroundColor White
    Write-Host "  2. Go to /admin/settings" -ForegroundColor White
    Write-Host "  3. Scroll down to 'Database & Data Backup' and click 'Export Backup (JSON)'." -ForegroundColor Cyan
    Write-Host "  4. Run this script again: .\update-netlify-drop.ps1" -ForegroundColor Yellow
    Write-Host ""
    $proceed = Read-Host "Do you want to package the current data anyway? (y/n)"
    if ($proceed -ne "y" -and $proceed -ne "Y") {
        Write-Host "Aborted. Export your backup first, then run this script." -ForegroundColor Yellow
        Exit 0
    }
}

Write-Host ""
Write-Host "Building frontend and generating netlify-drop-static.zip..." -ForegroundColor Cyan
npm run package:drop

if ($LASTEXITCODE -eq 0 -and (Test-Path "netlify-drop-static.zip")) {
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "  SUCCESS! netlify-drop-static.zip IS READY TO DEPLOY     " -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Step:" -ForegroundColor Yellow
    Write-Host "1. Go to https://app.netlify.com/drop (or your site's 'Deploys' tab in Netlify)" -ForegroundColor White
    Write-Host "2. Drag & drop the newly created 'netlify-drop-static.zip' onto the page." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Once uploaded, your updated portfolio will be live for all viewers on any device/browser!" -ForegroundColor Green
    Write-Host ""
    
    # Highlight the file in Explorer
    explorer.exe /select, "netlify-drop-static.zip"
} else {
    Write-Host "[ERROR] Build failed. Please check errors above." -ForegroundColor Red
}

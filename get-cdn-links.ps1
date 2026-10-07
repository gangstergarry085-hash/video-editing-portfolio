<#
.SYNOPSIS
    Automates uploading images from media/ to GitHub and generates instant jsDelivr CDN links.
#>

$username = "gangstergarry085-hash"
$repo = "video-editing-portfolio"
$branch = "main"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   jsDelivr High-Speed Image CDN Generator                " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$files = Get-ChildItem -Path "media" -File | Where-Object { $_.Name -ne "README.md" }

if ($files.Count -eq 0) {
    Write-Host "[INFO] No images found in the 'media/' folder yet." -ForegroundColor Yellow
    Write-Host "Drop your .jpg, .png, .webp files into the 'media' folder and run this script again!" -ForegroundColor White
    Write-Host ""
    Write-Host "Target URL format will be:" -ForegroundColor Gray
    Write-Host "https://cdn.jsdelivr.net/gh/$username/$repo@$branch/media/<filename>" -ForegroundColor Cyan
    Exit 0
}

Write-Host "Found $($files.Count) file(s) in media/ folder." -ForegroundColor Green

# Stage and commit new media
git add media/
$status = git status --porcelain media/
if ($status) {
    Write-Host "Committing new media..." -ForegroundColor Cyan
    git commit -m "chore: upload images to media CDN"
    Write-Host "Pushing to GitHub ($branch)..." -ForegroundColor Cyan
    git push origin $branch
} else {
    Write-Host "Media already synchronized with GitHub." -ForegroundColor Green
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  READY-TO-USE jsDelivr CDN LINKS:                        " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""

foreach ($file in $files) {
    $cdnUrl = "https://cdn.jsdelivr.net/gh/$username/$repo@$branch/media/$($file.Name)"
    Write-Host "• $($file.Name):" -ForegroundColor White
    Write-Host "  $cdnUrl" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "Paste these links directly into your Admin Panel for project covers, thumbnails, and avatar!" -ForegroundColor Yellow

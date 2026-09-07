param(
    [string]$msg = "update site and features"
)

Write-Host "[1/3] Adding changes..." -ForegroundColor Cyan
git add .

Write-Host "[2/3] Committing: '$msg'..." -ForegroundColor Cyan
git commit -m $msg

Write-Host "[3/3] Pushing to GitHub (Auto-deploys to Vercel)..." -ForegroundColor Cyan
git push origin main

Write-Host "`n======================================================" -ForegroundColor Green
Write-Host "✅ Done! Changes pushed & deploying to Vercel!" -ForegroundColor Green
Write-Host "🌐 Live URL: https://betadock.youmika.site" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Green

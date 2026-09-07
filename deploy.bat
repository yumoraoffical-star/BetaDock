@echo off
set msg=%*
if "%msg%"=="" set msg=update site and features

echo [1/3] Adding changes...
git add .

echo [2/3] Committing with message: "%msg%"...
git commit -m "%msg%"

echo [3/3] Pushing to GitHub main branch (auto-deploys to Vercel)...
git push origin main

echo.
echo ======================================================
echo Done! Changes pushed to GitHub and deploying to Vercel!
echo Live URL: https://betadock.youmika.site
echo ======================================================

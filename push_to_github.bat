@echo off
title RoyalClubBD - Push to GitHub
color 0A
echo ============================================================
echo   ROYALCLUBBD - PUSHING TO GITHUB (MAIN BRANCH)
echo ============================================================
echo.
echo Connecting to GitHub repository:
echo https://github.com/opriad111-kn/RoyalClub-bd.git
echo.
git push origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Congratulations! All code successfully pushed to GitHub!
    echo Your Vercel / Netlify custom domain will update automatically now.
) else (
    echo [NOTICE] If GitHub asked you to sign in, please click "Sign in with browser".
)
echo.
echo ============================================================
pause

@echo off
title Tadiwa "DOC" IT Specialist 3D Website
echo ===================================================
echo   Starting Tadiwa "DOC" IT Specialist 3D Website
echo ===================================================
echo.

where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Node.js detected. Launching server...
    start http://localhost:3000
    node server.js
) else (
    echo [INFO] Opening 3D Website directly in default browser...
    start "" "public\index.html"
)

pause

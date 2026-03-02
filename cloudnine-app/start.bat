@echo off
chcp 65001 >nul
title Cloudnine Insurance Platform
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║           🏥  CLOUDNINE INSURANCE PLATFORM                     ║
echo ║                                                                ║
echo ║           Starting server...                                   ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies for the first time...
    echo This may take a few minutes...
    echo.
    call npm install
    if errorlevel 1 (
        echo ❌ Installation failed. Please check your Node.js installation.
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully!
    echo.
)

echo 🚀 Starting server...
echo.
node server.js

pause

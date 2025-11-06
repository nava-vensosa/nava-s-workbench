@echo off
REM Fibril Algorithm Visualization - Quick Start Script for Windows

echo ========================================
echo Fibril Algorithm Visualization
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo npm version:
npm --version
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Start the server
echo Starting server...
echo Open http://localhost:3000 in your browser
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

npm start

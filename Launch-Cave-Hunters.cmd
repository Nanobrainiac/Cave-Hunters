@echo off
setlocal
title Cave Hunters Launcher
cd /d "%~dp0"
if not exist package.json (
 echo Extract the entire Cave Hunters ZIP before running this launcher.
 goto fail
)
where node >nul 2>&1
if errorlevel 1 goto installnode
node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||(a===22&&b>=12)?0:1)"
if errorlevel 1 goto installnode
goto deps
:installnode
echo Node.js 22.12 or newer is required.
where winget >nul 2>&1
if errorlevel 1 (
 echo Install Node.js LTS from https://nodejs.org/ and launch again.
 goto fail
)
choice /M "Install or upgrade Node.js LTS using Windows Package Manager"
if errorlevel 2 goto fail
winget install --id OpenJS.NodeJS.LTS --exact --source winget --accept-package-agreements --accept-source-agreements
if errorlevel 1 goto fail
set "PATH=%ProgramFiles%\nodejs;%LOCALAPPDATA%\Programs\nodejs;%PATH%"
node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||(a===22&&b>=12)?0:1)"
if errorlevel 1 (
 echo Close this window and launch again after installation.
 goto fail
)
:deps
where npm.cmd >nul 2>&1
if errorlevel 1 goto fail
echo Checking local dependencies...
call npm ls --depth=0 >nul 2>&1
if not errorlevel 1 goto build
if exist package-lock.json (
 call npm ci --no-audit --no-fund
) else (
 call npm install --no-audit --no-fund
)
if errorlevel 1 goto fail
:build
echo Building Cave Hunters locally...
call npm run build
if errorlevel 1 goto fail
echo Starting game. Close this window to stop the server.
call npm run preview -- --host 127.0.0.1 --port 4173 --strictPort --open
if errorlevel 1 goto fail
exit /b 0
:fail
echo Launcher stopped. Review the messages above.
pause
exit /b 1

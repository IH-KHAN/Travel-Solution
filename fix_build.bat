@echo off
title ASP.NET Core Project Build Fixer
echo =======================================================
echo     ASP.NET Core Project Build Fixer (Trailing-Space Fix)
echo =======================================================
echo.

echo [1/5] Force-closing Visual Studio, VS Code, Node.js and compiler processes to release file locks...
taskkill /f /im devenv.exe 2>nul
taskkill /f /im code.exe 2>nul
taskkill /f /im node.exe 2>nul
taskkill /f /im dotnet.exe 2>nul
taskkill /f /im msbuild.exe 2>nul
taskkill /f /im VBCSCompiler.exe 2>nul
echo Done.
echo.

echo [2/5] Force-deleting invalid trailing-space folder...
rd /s /q "\\?\d:\IsDB-67\Final_Project\Travel Solution 17-5-26_v_1.2\Travel Solution 17-5-26_v_1.2\Travel Solution\Images\Hotel Images\Mollika " 2>nul
echo Done.
echo.

echo [3/5] Force-deleting stale bin and obj directories...
rd /s /q "Travel Solution\bin" 2>nul
rd /s /q "Travel Solution\obj" 2>nul
echo Done.
echo.

echo [4/5] Navigating and restoring NuGet dependencies...
cd "Travel Solution"
dotnet restore
echo Done.
echo.

echo [5/5] Rebuilding backend project...
dotnet build
echo.

echo =======================================================
echo  Process completed! Check the logs above for build success.
echo =======================================================
pause

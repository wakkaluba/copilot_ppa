@echo off
echo Copilot PPA - Project Reorganization
echo ===================================
echo.

echo This script will reorganize the project structure by:
echo 1. Moving files from zzz-prefixed folders to standard named folders
echo 2. Consolidating test files
echo 3. Organizing source code by feature
echo.

echo Creating new directory structure...
if not exist docs mkdir docs
if not exist scripts mkdir scripts
if not exist refactoring mkdir refactoring
if not exist build mkdir build

echo.
echo Moving files from zzzdocs to docs...
xcopy /E /I /Y zzzdocs\* docs\

echo.
echo Moving files from zzzscripts to scripts...
xcopy /E /I /Y zzzscripts\* scripts\

echo.
echo Moving files from zzzrefactoring to refactoring...
xcopy /E /I /Y zzzrefactoring\* refactoring\

echo.
echo Moving files from zzzbuild to build...
xcopy /E /I /Y zzzbuild\* build\

echo.
echo Reorganization completed!
echo Please verify that all files were copied correctly before deleting the original folders.
echo.
echo To delete the original folders after verification, run:
echo reorganize-cleanup.bat
echo.

pause

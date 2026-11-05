@echo off
setlocal
cd /d "%~dp0"

if not exist smart_cafeteria.exe (
    echo smart_cafeteria.exe not found. Building first...
    call build.bat
    if errorlevel 1 exit /b 1
)
if not exist smart_cafeteria.exe (
    echo [FAIL] Build did not create smart_cafeteria.exe.
    exit /b 1
)

smart_cafeteria.exe
exit /b %ERRORLEVEL%

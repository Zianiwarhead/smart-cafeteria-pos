@echo off
setlocal
cd /d "%~dp0"

set "CXX=g++"
where g++ >nul 2>&1
if errorlevel 1 (
    if exist "C:\msys64\mingw64\bin\g++.exe" (
        set "CXX=C:\msys64\mingw64\bin\g++.exe"
    ) else if exist "C:\msys64\ucrt64\bin\g++.exe" (
        set "CXX=C:\msys64\ucrt64\bin\g++.exe"
    ) else (
        echo [FAIL] g++ was not found. Install MinGW-w64/MSYS2 or add g++ to PATH.
        exit /b 1
    )
)

echo ========================================================
echo Compiling Smart Cafeteria C++17 Terminal Application
echo ========================================================
"%CXX%" -std=c++17 -Wall -Wextra -Icpp/include cpp/src/main.cpp -o smart_cafeteria.exe
if errorlevel 1 (
    echo [FAIL] Compilation failed.
    exit /b 1
)

echo [OK] Compilation successful: smart_cafeteria.exe
exit /b 0

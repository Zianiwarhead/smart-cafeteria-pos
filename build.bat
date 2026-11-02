@echo off
echo ========================================================
echo Compiling Smart Cafeteria C++ Core (C++17 OOP System)...
echo ========================================================
g++ -std=c++17 -Wall -Wextra -Icpp/include cpp/src/main.cpp -o smart_cafeteria.exe
if %ERRORLEVEL% EQU 0 (
    echo [OK] Compilation successful: smart_cafeteria.exe
    echo Run with: run.bat or .\smart_cafeteria.exe
) else (
    echo [FAIL] Compilation failed with error code %ERRORLEVEL%
)
pause

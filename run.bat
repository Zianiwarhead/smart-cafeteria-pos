@echo off
cls
if not exist smart_cafeteria.exe (
    echo smart_cafeteria.exe not found! Building first...
    call build.bat
)
smart_cafeteria.exe

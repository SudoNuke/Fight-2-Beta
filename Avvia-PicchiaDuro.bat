@echo off
setlocal
cd /d "%~dp0"
start "PicchiaDuro Server" powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Avvia-PicchiaDuro.ps1"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8765/"
echo Il gioco e' stato aperto nel browser.
echo Non chiudere la finestra PowerShell mentre giochi.
pause

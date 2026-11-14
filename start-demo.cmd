@echo off
rem NamDU portfolio — shu kompyuterni lokal tarmoq uchun server qilib ishga tushiradi.
rem Ikki marta bosing. Oyna ochiq turgan paytda sayt ishlaydi; yopilsa sayt to'xtaydi.
title NamDU portfolio server
cd /d "%~dp0"

if not exist node_modules (
  echo Kutubxonalar o'rnatilmoqda...
  call npm ci || goto :err
)
echo Sayt build qilinmoqda...
call npm run build || goto :err

set API_PORT=8080
set HOST=0.0.0.0
echo.
echo ============================================================
echo  Sayt shu manzillarda ochiladi (tarmoqdagi boshqa kompyuterlardan):
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  for /f "tokens=* delims= " %%b in ("%%a") do echo    http://%%b:8080
)
echo  Shu kompyuterda: http://localhost:8080   Admin: /admin
echo ============================================================
echo.
node server/index.js
goto :eof

:err
echo.
echo XATO: yuqoridagi xabarni ko'ring.
pause

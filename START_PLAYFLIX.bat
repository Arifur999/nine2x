@echo off
set "PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%"
cd /d "C:\Users\arif\Downloads\movies project\playflix-next"
echo ========================================================
echo Starting Playflix Next.js Server...
echo Open your browser at: http://localhost:3000
echo ========================================================
npm run dev
pause

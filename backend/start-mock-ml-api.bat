@echo off
echo Starting Mock ML API for Smart Attendance System...
cd %~dp0
npx ts-node src/scripts/mock-ml-api.ts
pause

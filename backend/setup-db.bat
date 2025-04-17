@echo off
echo Setting up database for Smart Attendance System...
cd %~dp0
npx ts-node src/scripts/db-setup.ts
pause

@echo off
echo Testing MongoDB connection for Smart Attendance System...
cd %~dp0
npx ts-node src/scripts/test-db-connection.ts
pause

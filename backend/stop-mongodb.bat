@echo off
echo Stopping MongoDB for Smart Attendance System...
cd %~dp0
docker-compose -f docker-compose.mongodb.yml down
echo MongoDB stopped
pause

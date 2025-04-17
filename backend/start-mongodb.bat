@echo off
echo Starting MongoDB for Smart Attendance System...
cd %~dp0
docker-compose -f docker-compose.mongodb.yml up -d
echo MongoDB started on port 27017
pause

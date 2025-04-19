@echo off
echo Stopping PostgreSQL database...
cd ..\docker
docker-compose -f docker-compose.postgres.yml down
echo PostgreSQL stopped

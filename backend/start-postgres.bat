@echo off
echo Starting PostgreSQL database with pgvector...
cd ..\docker
docker-compose -f docker-compose.postgres.yml up -d
echo PostgreSQL started on port 5432
echo Username: postgres
echo Password: postgres
echo Database: attendance

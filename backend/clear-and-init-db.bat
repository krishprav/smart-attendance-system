@echo off
echo WARNING: This will clear all data in the database and initialize it with sample data.
echo Are you sure you want to continue? (Y/N)
set /p confirm=

if /i not "%confirm%"=="Y" (
  echo Operation cancelled.
  exit /b
)

echo Running Prisma seed to initialize database...
npx prisma db push --force-reset
npx prisma generate
npx prisma db seed

echo Database initialized with sample data.

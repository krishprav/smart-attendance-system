@echo off
echo Fixing Prisma client generation...

echo 1. Regenerating Prisma client...
call npx prisma generate

echo 2. Testing fixed face recognition script...
call npx ts-node src/scripts/test-face-recognition.ts

echo Done!

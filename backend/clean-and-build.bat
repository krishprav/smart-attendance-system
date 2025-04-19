@echo off
echo Cleaning up dist directory...
rmdir /s /q dist
echo Cleaned.

echo Building with simplified TypeScript configuration...
npx prisma generate
npx tsc --project tsconfig.simplified.json
echo Build completed.

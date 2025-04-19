@echo off
echo Building with simplified TypeScript configuration...
npx prisma generate
npx tsc --project tsconfig.simplified.json
echo Build completed.

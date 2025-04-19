@echo off
echo Initializing Prisma for PostgreSQL...

echo Generating Prisma client...
npx prisma generate

echo Creating database migrations...
npx prisma migrate dev --name init

echo Prisma initialization complete!
echo You can now run 'npm run dev' to start the application.

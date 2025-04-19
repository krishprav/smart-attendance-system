@echo off
echo Applying Prisma schema changes...

echo Generating updated Prisma client...
npx prisma generate

echo Creating migration for schema changes...
npx prisma migrate dev --name update_user_face_encoding_fields

echo Migration complete!
echo You can now run 'npm run dev' to start the application.

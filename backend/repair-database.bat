@echo off
echo Repairing database structure...

echo Generating Prisma client...
npx prisma generate

echo Running DB push to align schema (this won't delete data)...
npx prisma db push

echo Database repair complete. You can now run check-face-data.bat to verify your data.

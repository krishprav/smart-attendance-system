# PostgreSQL with pgvector Setup Guide

This guide explains how to set up and migrate your Smart Attendance System to use PostgreSQL with pgvector for efficient facial recognition.

## Why PostgreSQL with pgvector?

We've upgraded the database to PostgreSQL with pgvector for these benefits:

1. **Efficient Face Embedding Storage**: Store and search facial feature vectors efficiently
2. **Fast Similarity Searches**: Quickly match faces using specialized vector operations
3. **Better Performance**: Improved query performance for large datasets
4. **Transactional Integrity**: Full ACID compliance for reliable attendance data
5. **Advanced Indexing**: Better indexing for facial recognition workloads

## Setup Instructions

### Step 1: Install Dependencies

First, install the required Node.js packages:

```bash
cd backend
npm install
```

This will install PostgreSQL, Prisma, and pgvector dependencies.

### Step 2: Start PostgreSQL with pgvector

Use the provided Docker script to start PostgreSQL with the pgvector extension:

```bash
# Windows
cd backend
start-postgres.bat

# macOS/Linux
cd backend
chmod +x start-postgres.sh
./start-postgres.sh
```

### Step 3: Initialize the Database

Run the initialization script to set up the PostgreSQL schema and tables:

```bash
# Windows
cd backend
init-prisma.bat

# macOS/Linux
cd backend
chmod +x init-prisma.sh
./init-prisma.sh
```

### Step 4: Seed the Database

Populate the database with initial test data:

```bash
cd backend
npm run prisma:seed
```

### Step 5: Test the Connection

Verify that PostgreSQL and pgvector are working correctly:

```bash
cd backend
npm run test-postgres
# or
test-postgres.bat
```

### Step 6: Migrate Existing Data (Optional)

If you have existing data in MongoDB, migrate it to PostgreSQL:

```bash
cd backend
npm run migrate-mongo-to-postgres
# or
migrate-mongo-to-postgres.bat
```

## Using PostgreSQL in Development

The system is now configured to use both MongoDB (legacy) and PostgreSQL (new). PostgreSQL will be used for all face recognition features.

To work with the database directly:

```bash
# Start Prisma Studio (web-based database explorer)
cd backend
npm run prisma:studio
```

This will open a browser at http://localhost:5555 where you can view and edit database records.

## Environment Configuration

The PostgreSQL connection is configured in two places:

1. `.env` file in the backend directory:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/attendance
   ```

2. `prisma/.env` file:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/attendance
   ```

You can modify these URLs if you're using a different PostgreSQL setup.

## Face Recognition Features

With PostgreSQL and pgvector set up, you can now use these face recognition endpoints:

- **Register a Face**: `POST /api/face/register/:userId`
- **Mark Attendance with Face Recognition**: `POST /api/face/attendance/mark`
- **Get Face Registration Status**: `GET /api/face/data/:userId`
- **Remove Face Registration**: `DELETE /api/face/register/:userId`

## Troubleshooting

### Common Issues

1. **PostgreSQL Connection Errors**
   - Ensure Docker is running
   - Check that the PostgreSQL container is active: `docker ps`
   - Verify your PostgreSQL credentials in `.env` files

2. **pgvector Extension Issues**
   - Run `test-postgres.bat` to check if pgvector is properly installed
   - If missing, ensure you're using the correct Docker image (pgvector/pgvector)

3. **Prisma Migration Errors**
   - Run `npx prisma migrate reset --force` to reset the database
   - Check for syntax errors in the schema.prisma file

4. **Face Registration Fails**
   - Ensure the ML API is running: `npm run mock-ml-api`
   - Check that pgvector extension is properly installed

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Face Recognition Guide](./backend/FACE_RECOGNITION.md)
- [PostgreSQL Database Guide](./backend/POSTGRES.md)

## Next Steps

After setup, you can:

1. Register faces for students and faculty
2. Test facial recognition for marking attendance
3. Explore the improved performance for attendance tracking
4. Develop additional features using vector similarity (student grouping, etc.)
# PostgreSQL Setup for Smart Attendance System

This document provides information about the PostgreSQL database setup for the Smart Attendance System.

## Why PostgreSQL with pgvector?

The Smart Attendance System uses PostgreSQL with the pgvector extension for efficient facial recognition:

1. **Efficient Face Encoding Storage**: pgvector allows for storing face embeddings as vectors directly in the database
2. **Fast Similarity Searches**: Perform efficient face matching using vector similarity operations
3. **Transactional Integrity**: Full ACID compliance for reliable attendance data
4. **Scalability**: Designed to handle large numbers of students and attendance records

## Setup Instructions

### Option 1: Using Docker (Recommended)

The easiest way to set up PostgreSQL with pgvector is using the provided Docker Compose file:

#### Using batch scripts (Windows):

```bash
# Start PostgreSQL
start-postgres.bat

# Stop PostgreSQL when finished
stop-postgres.bat

# Complete setup (start + initialize + seed data)
setup-postgres-db.bat
```

#### Using Docker Compose directly:

```bash
cd docker
docker-compose -f docker-compose.postgres.yml up -d
```

This will start a PostgreSQL instance with pgvector on port 5432.

### Option 2: Local Installation

If you prefer to install PostgreSQL locally:

1. Download and install PostgreSQL 15+ from [PostgreSQL Download Center](https://www.postgresql.org/download/)
2. Install the pgvector extension:
   ```sql
   CREATE EXTENSION vector;
   ```
3. Create the attendance database:
   ```sql
   CREATE DATABASE attendance;
   ```
4. Run the setup script:
   ```sql
   \i backend/prisma/setup-postgres.sql
   ```

## Database Initialization

After setting up PostgreSQL, you need to initialize the Prisma schema and seed the database:

### Using batch file (Windows):

```bash
cd backend
setup-postgres-db.bat
```

### Manual initialization:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

## Database Schema

The Smart Attendance System uses the following tables:

1. **users**: Stores information about users (students, faculty, admin)
2. **sessions**: Stores information about class sessions
3. **attendance**: Stores attendance records
4. **compliance**: Stores compliance records (ID card, phone usage)
5. **engagement**: Stores engagement metrics (attention, emotion)
6. **audit_logs**: Stores audit logs for system activities

## Face Recognition Features

The pgvector extension enables the following face recognition capabilities:

1. **Face Encoding Storage**: Each user can register their face, which is stored as a 512-dimensional vector
2. **Face Matching**: When marking attendance, the system compares faces in a class photo with stored face encodings
3. **Similarity Threshold**: Configurable threshold for face matching accuracy

## Default Credentials

After initializing the database, the following default users are created:

### Admin User
- Email: admin@example.com
- Password: admin123

### Faculty Users
- Email: john.smith@example.com
- Password: faculty123

- Email: sarah.johnson@example.com
- Password: faculty123

### Student Users
- Email: alice.brown@example.com
- Password: student123
- Student ID: S001

- Email: bob.wilson@example.com
- Password: student123
- Student ID: S002

- Email: charlie.davis@example.com
- Password: student123
- Student ID: S003

- Email: diana.evans@example.com
- Password: student123
- Student ID: S004

- Email: ethan.foster@example.com
- Password: student123
- Student ID: S005

## Environment Configuration

The PostgreSQL connection string is defined in two places:

1. Backend `.env` file:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/attendance
   ```

2. Prisma `.env` file:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/attendance
   ```

## Troubleshooting

### Connection Issues
- Make sure PostgreSQL is running (`docker ps` to check containers)
- Check if the PostgreSQL port (5432) is not blocked by a firewall
- Verify your connection string is correct

### pgvector Extension Issues
- Ensure you're using the pgvector Docker image or have installed the extension
- Check if the extension is enabled: `SELECT * FROM pg_extension WHERE extname = 'vector';`

### Migration Issues
- If migrations fail, try resetting the database:
  ```bash
  npx prisma migrate reset --force
  ```

## Backup and Restore

### Backup
```bash
pg_dump -U postgres -d attendance -f ./backup/attendance.sql
```

### Restore
```bash
psql -U postgres -d attendance -f ./backup/attendance.sql
```

## Prisma Studio

To view and edit your database with a web interface:

```bash
npx prisma studio
```

This will open a browser window at http://localhost:5555 where you can manage your database.
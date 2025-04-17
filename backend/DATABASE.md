# Database Setup for Smart Attendance System

This document provides information about the database setup for the Smart Attendance System.

## MongoDB Setup

The Smart Attendance System uses MongoDB as its database. Here's how to set it up:

### Option 1: Using Docker (Recommended)

The easiest way to set up MongoDB is using the provided Docker Compose file:

#### Using scripts:

```bash
# On Windows
start-mongodb.bat

# On macOS/Linux
chmod +x start-mongodb.sh
./start-mongodb.sh
```

#### Using Docker Compose directly:

```bash
docker-compose -f docker-compose.mongodb.yml up -d
```

This will start a MongoDB instance on port 27017.

#### To stop MongoDB:

```bash
# On Windows
stop-mongodb.bat

# On macOS/Linux
chmod +x stop-mongodb.sh
./stop-mongodb.sh
```

### Option 2: Local Installation

#### For Windows:
1. Download and install MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Follow the installation instructions
3. Start MongoDB service

#### For macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### For Ubuntu:
```bash
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb
```

## Database Initialization

After setting up MongoDB, you need to initialize the database with seed data:

### Using npm script:

```bash
cd backend
npm run setup-db
```

### Using batch file (Windows):

```bash
cd backend
setup-db.bat
```

### Using shell script (macOS/Linux):

```bash
cd backend
chmod +x setup-db.sh
./setup-db.sh
```

## Database Schema

The Smart Attendance System uses the following collections:

1. **Users**: Stores information about users (students, faculty, admin)
2. **Sessions**: Stores information about class sessions
3. **Attendance**: Stores attendance records
4. **Compliance**: Stores compliance records (ID card, phone usage)
5. **Engagement**: Stores engagement metrics (attention, emotion)
6. **AuditLog**: Stores audit logs for system activities

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

Make sure your `.env` file in the backend directory has the correct MongoDB URI:

```
MONGODB_URI=mongodb://localhost:27017/attendance
```

If you're using Docker with authentication, the URI would be:

```
MONGODB_URI=mongodb://username:password@localhost:27017/attendance?authSource=admin
```

## Troubleshooting

### Connection Issues
- Make sure MongoDB is running
- Check if the MongoDB URI in `.env` is correct
- Check if the MongoDB port (27017) is not blocked by a firewall

### Data Issues
- If you encounter issues with the data, you can reset the database by running the setup script again
- In development mode, the setup script will clear all collections before creating new data

## Backup and Restore

### Backup
```bash
mongodump --uri="mongodb://localhost:27017/attendance" --out=./backup
```

### Restore
```bash
mongorestore --uri="mongodb://localhost:27017/attendance" ./backup/attendance
```

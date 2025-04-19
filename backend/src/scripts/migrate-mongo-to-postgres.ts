import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load User model from MongoDB
import User from '../models/User';
import Session from '../models/Session';
import Attendance from '../models/Attendance';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Migrate data from MongoDB to PostgreSQL
 */
async function migrateData() {
  try {
    console.log('Starting migration from MongoDB to PostgreSQL...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB');
    
    // Connect to PostgreSQL
    await prisma.$connect();
    console.log('Connected to PostgreSQL');
    
    // Clear existing data in PostgreSQL (if needed)
    console.log('Clearing existing data in PostgreSQL...');
    await prisma.attendance.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Existing data cleared');
    
    // Migrate users
    console.log('Migrating users...');
    const mongoUsers = await User.find({}).lean();
    
    for (const mongoUser of mongoUsers) {
      // Convert MongoDB _id to string for PostgreSQL UUID
      const userId = mongoUser._id.toString();
      
      // Handle face encoding conversion if present
      const faceEncoding = mongoUser.faceEncoding ? 
        mongoUser.faceEncoding as any : // pgvector will handle the conversion
        undefined;
      
      try {
        await prisma.user.create({
          data: {
            id: userId,
            name: mongoUser.name,
            email: mongoUser.email,
            password: mongoUser.password,
            role: mongoUser.role as any,
            studentId: mongoUser.studentId,
            isVerified: mongoUser.isVerified,
            verificationToken: mongoUser.verificationToken,
            resetPasswordToken: mongoUser.resetPasswordToken,
            resetPasswordExpire: mongoUser.resetPasswordExpire,
            createdAt: mongoUser.createdAt,
            faceEncoding: faceEncoding,
            faceRegistered: mongoUser.faceRegistered || false,
            faceRegisteredAt: mongoUser.faceRegisteredAt,
          },
        });
      } catch (error) {
        console.error(`Error migrating user ${mongoUser.email}:`, error);
      }
    }
    
    console.log(`Migrated ${mongoUsers.length} users`);
    
    // Migrate sessions
    console.log('Migrating sessions...');
    const mongoSessions = await Session.find({}).lean();
    
    for (const mongoSession of mongoSessions) {
      // Convert MongoDB _id to string for PostgreSQL UUID
      const sessionId = mongoSession._id.toString();
      const facultyId = mongoSession.faculty.toString();
      
      try {
        await prisma.session.create({
          data: {
            id: sessionId,
            title: mongoSession.title,
            courseCode: mongoSession.courseCode,
            facultyId: facultyId,
            startTime: mongoSession.startTime,
            endTime: mongoSession.endTime,
            location: mongoSession.location,
            status: mongoSession.status as any,
            createdAt: mongoSession.createdAt,
            updatedAt: mongoSession.updatedAt || new Date(),
          },
        });
      } catch (error) {
        console.error(`Error migrating session ${mongoSession.title}:`, error);
      }
    }
    
    console.log(`Migrated ${mongoSessions.length} sessions`);
    
    // Migrate attendance records
    console.log('Migrating attendance records...');
    const mongoAttendance = await Attendance.find({}).lean();
    
    for (const mongoAttendanceRecord of mongoAttendance) {
      // Convert MongoDB _id to string for PostgreSQL UUID
      const attendanceId = mongoAttendanceRecord._id.toString();
      const sessionId = mongoAttendanceRecord.session.toString();
      const userId = mongoAttendanceRecord.student.toString();
      
      try {
        await prisma.attendance.create({
          data: {
            id: attendanceId,
            sessionId: sessionId,
            userId: userId,
            status: mongoAttendanceRecord.status as any,
            entryTime: mongoAttendanceRecord.entryTime,
            exitTime: mongoAttendanceRecord.exitTime,
            duration: mongoAttendanceRecord.duration,
            notes: mongoAttendanceRecord.notes,
            verificationMethod: mongoAttendanceRecord.verificationMethod as any || 'manual',
            createdAt: mongoAttendanceRecord.createdAt,
            updatedAt: mongoAttendanceRecord.updatedAt || new Date(),
          },
        });
      } catch (error) {
        console.error(`Error migrating attendance record:`, error);
      }
    }
    
    console.log(`Migrated ${mongoAttendance.length} attendance records`);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    // Disconnect from databases
    await mongoose.disconnect();
    await prisma.$disconnect();
  }
}

// Run the migration
migrateData()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

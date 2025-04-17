import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Session from '../models/Session';
import Attendance from '../models/Attendance';
import Compliance from '../models/Compliance';
import Engagement from '../models/Engagement';
import AuditLog from '../models/AuditLog';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
};

// Clear all collections
const clearDB = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      await User.deleteMany({});
      await Session.deleteMany({});
      await Attendance.deleteMany({});
      await Compliance.deleteMany({});
      await Engagement.deleteMany({});
      await AuditLog.deleteMany({});
      console.log('Database cleared');
    } catch (error) {
      console.error(`Error clearing database: ${error}`);
      process.exit(1);
    }
  } else {
    console.log('Database clear skipped in non-development environment');
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });
    
    console.log(`Admin user created: ${admin.email}`);
  } catch (error) {
    console.error(`Error creating admin user: ${error}`);
    process.exit(1);
  }
};

// Create faculty users
const createFacultyUsers = async () => {
  try {
    const facultyData = [
      {
        name: 'Dr. John Smith',
        email: 'john.smith@example.com',
        password: 'faculty123',
        role: 'faculty'
      },
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@example.com',
        password: 'faculty123',
        role: 'faculty'
      }
    ];
    
    for (const faculty of facultyData) {
      const facultyExists = await User.findOne({ email: faculty.email });
      
      if (facultyExists) {
        console.log(`Faculty user already exists: ${faculty.email}`);
        continue;
      }
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(faculty.password, salt);
      
      await User.create({
        name: faculty.name,
        email: faculty.email,
        password: hashedPassword,
        role: faculty.role,
        isVerified: true
      });
      
      console.log(`Faculty user created: ${faculty.email}`);
    }
  } catch (error) {
    console.error(`Error creating faculty users: ${error}`);
    process.exit(1);
  }
};

// Create student users
const createStudentUsers = async () => {
  try {
    const studentData = [
      {
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        password: 'student123',
        role: 'student',
        studentId: 'S001'
      },
      {
        name: 'Bob Wilson',
        email: 'bob.wilson@example.com',
        password: 'student123',
        role: 'student',
        studentId: 'S002'
      },
      {
        name: 'Charlie Davis',
        email: 'charlie.davis@example.com',
        password: 'student123',
        role: 'student',
        studentId: 'S003'
      },
      {
        name: 'Diana Evans',
        email: 'diana.evans@example.com',
        password: 'student123',
        role: 'student',
        studentId: 'S004'
      },
      {
        name: 'Ethan Foster',
        email: 'ethan.foster@example.com',
        password: 'student123',
        role: 'student',
        studentId: 'S005'
      }
    ];
    
    for (const student of studentData) {
      const studentExists = await User.findOne({ email: student.email });
      
      if (studentExists) {
        console.log(`Student user already exists: ${student.email}`);
        continue;
      }
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(student.password, salt);
      
      await User.create({
        name: student.name,
        email: student.email,
        password: hashedPassword,
        role: student.role,
        studentId: student.studentId,
        isVerified: true
      });
      
      console.log(`Student user created: ${student.email}`);
    }
  } catch (error) {
    console.error(`Error creating student users: ${error}`);
    process.exit(1);
  }
};

// Create sessions
const createSessions = async () => {
  try {
    // Get faculty users
    const faculty = await User.find({ role: 'faculty' });
    
    if (faculty.length === 0) {
      console.log('No faculty users found. Skipping session creation.');
      return;
    }
    
    const sessionData = [
      {
        courseId: 'CS101',
        faculty: faculty[0]._id,
        classType: 'lecture',
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours after start
        duration: 120,
        isActive: false,
        location: 'Room 101',
        totalStudents: 5
      },
      {
        courseId: 'CS102',
        faculty: faculty[0]._id,
        classType: 'lecture',
        startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours after start
        duration: 120,
        isActive: false,
        location: 'Room 102',
        totalStudents: 5
      },
      {
        courseId: 'CS103',
        faculty: faculty[1]._id,
        classType: 'lab',
        startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours after start
        duration: 180,
        isActive: false,
        location: 'Lab 201',
        totalStudents: 5
      },
      {
        courseId: 'CS104',
        faculty: faculty[1]._id,
        classType: 'tutorial',
        startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000), // 1 hour after start
        duration: 60,
        isActive: false,
        location: 'Room 103',
        totalStudents: 5
      },
      {
        courseId: 'CS105',
        faculty: faculty[0]._id,
        classType: 'lecture',
        startTime: new Date(), // Today
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        duration: 120,
        isActive: true,
        location: 'Room 104',
        totalStudents: 5
      }
    ];
    
    for (const session of sessionData) {
      const sessionExists = await Session.findOne({ 
        courseId: session.courseId,
        faculty: session.faculty,
        startTime: session.startTime
      });
      
      if (sessionExists) {
        console.log(`Session already exists: ${session.courseId}`);
        continue;
      }
      
      const newSession = await Session.create(session);
      console.log(`Session created: ${newSession.courseId}`);
    }
  } catch (error) {
    console.error(`Error creating sessions: ${error}`);
    process.exit(1);
  }
};

// Create attendance records
const createAttendanceRecords = async () => {
  try {
    // Get all sessions
    const sessions = await Session.find({});
    
    if (sessions.length === 0) {
      console.log('No sessions found. Skipping attendance record creation.');
      return;
    }
    
    // Get all students
    const students = await User.find({ role: 'student' });
    
    if (students.length === 0) {
      console.log('No student users found. Skipping attendance record creation.');
      return;
    }
    
    // Create attendance records for each session
    for (const session of sessions) {
      // Skip the active session (today's session)
      if (session.isActive) {
        continue;
      }
      
      // Create attendance records for each student
      for (const student of students) {
        const attendanceExists = await Attendance.findOne({
          session: session._id,
          student: student._id
        });
        
        if (attendanceExists) {
          console.log(`Attendance record already exists for student ${student.name} in session ${session.courseId}`);
          continue;
        }
        
        // Randomly mark some students as absent or late
        const statusOptions = ['present', 'absent', 'late'];
        const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        
        const verificationMethods = ['face', 'manual', 'idcard'];
        const randomMethod = verificationMethods[Math.floor(Math.random() * verificationMethods.length)];
        
        await Attendance.create({
          session: session._id,
          student: student._id,
          status: randomStatus,
          markedBy: randomMethod === 'manual' ? 'faculty' : 'system',
          markedAt: new Date(session.startTime.getTime() + Math.random() * 30 * 60 * 1000), // Random time within first 30 minutes
          faceVerified: randomMethod === 'face',
          verificationMethod: randomMethod,
          verificationConfidence: Math.random() * 0.3 + 0.7 // Random confidence between 0.7 and 1.0
        });
        
        console.log(`Attendance record created for student ${student.name} in session ${session.courseId}`);
      }
      
      // Update session attendance count
      const attendanceCount = await Attendance.countDocuments({
        session: session._id,
        status: 'present'
      });
      
      await Session.findByIdAndUpdate(session._id, {
        attendanceCount
      });
      
      console.log(`Session ${session.courseId} attendance count updated: ${attendanceCount}`);
    }
  } catch (error) {
    console.error(`Error creating attendance records: ${error}`);
    process.exit(1);
  }
};

// Create compliance records
const createComplianceRecords = async () => {
  try {
    // Get all sessions
    const sessions = await Session.find({ isActive: false });
    
    if (sessions.length === 0) {
      console.log('No completed sessions found. Skipping compliance record creation.');
      return;
    }
    
    // Get all students
    const students = await User.find({ role: 'student' });
    
    if (students.length === 0) {
      console.log('No student users found. Skipping compliance record creation.');
      return;
    }
    
    // Create compliance records for each session
    for (const session of sessions) {
      // Create compliance records for each student
      for (const student of students) {
        const complianceExists = await Compliance.findOne({
          session: session._id,
          student: student._id
        });
        
        if (complianceExists) {
          console.log(`Compliance record already exists for student ${student.name} in session ${session.courseId}`);
          continue;
        }
        
        // Randomly set ID card visibility
        const idCardVisible = Math.random() > 0.2; // 80% chance of having ID card visible
        
        // Randomly create phone detections
        const phoneDetections = [];
        const phoneDetectionCount = Math.floor(Math.random() * 3); // 0-2 phone detections
        
        for (let i = 0; i < phoneDetectionCount; i++) {
          phoneDetections.push({
            timestamp: new Date(session.startTime.getTime() + Math.random() * session.duration * 60 * 1000),
            confidence: Math.random() * 0.3 + 0.7 // Random confidence between 0.7 and 1.0
          });
        }
        
        const complianceRecord = await Compliance.create({
          session: session._id,
          student: student._id,
          idCardVisible,
          phoneDetections
        });
        
        console.log(`Compliance record created for student ${student.name} in session ${session.courseId}: ${complianceRecord.overallCompliance.toFixed(2)}`);
      }
    }
  } catch (error) {
    console.error(`Error creating compliance records: ${error}`);
    process.exit(1);
  }
};

// Create engagement records
const createEngagementRecords = async () => {
  try {
    // Get all sessions
    const sessions = await Session.find({ isActive: false });
    
    if (sessions.length === 0) {
      console.log('No completed sessions found. Skipping engagement record creation.');
      return;
    }
    
    // Get all students
    const students = await User.find({ role: 'student' });
    
    if (students.length === 0) {
      console.log('No student users found. Skipping engagement record creation.');
      return;
    }
    
    // Emotion options
    const emotions = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'confused', 'bored', 'engaged'];
    
    // Create engagement records for each session
    for (const session of sessions) {
      // Create engagement records for each student
      for (const student of students) {
        const engagementExists = await Engagement.findOne({
          session: session._id,
          student: student._id
        });
        
        if (engagementExists) {
          console.log(`Engagement record already exists for student ${student.name} in session ${session.courseId}`);
          continue;
        }
        
        // Create metrics for the session duration
        const metrics = [];
        const metricsCount = Math.floor(session.duration / 15); // One metric every 15 minutes
        
        for (let i = 0; i < metricsCount; i++) {
          const timestamp = new Date(session.startTime.getTime() + i * 15 * 60 * 1000);
          const attention = Math.random() * 0.4 + 0.6; // Random attention between 0.6 and 1.0
          const engagement = Math.random() * 0.4 + 0.6; // Random engagement between 0.6 and 1.0
          const emotion = emotions[Math.floor(Math.random() * emotions.length)];
          
          metrics.push({
            timestamp,
            attention,
            engagement,
            emotion
          });
        }
        
        await Engagement.create({
          session: session._id,
          student: student._id,
          metrics
        });
        
        console.log(`Engagement record created for student ${student.name} in session ${session.courseId}`);
      }
    }
  } catch (error) {
    console.error(`Error creating engagement records: ${error}`);
    process.exit(1);
  }
};

// Main function to run all setup tasks
const setupDatabase = async () => {
  try {
    // Connect to MongoDB
    const conn = await connectDB();
    
    // Clear database if in development mode
    await clearDB();
    
    // Create users
    await createAdminUser();
    await createFacultyUsers();
    await createStudentUsers();
    
    // Create sessions and related records
    await createSessions();
    await createAttendanceRecords();
    await createComplianceRecords();
    await createEngagementRecords();
    
    console.log('Database setup complete');
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error(`Error setting up database: ${error}`);
    process.exit(1);
  }
};

// Run the setup
setupDatabase();

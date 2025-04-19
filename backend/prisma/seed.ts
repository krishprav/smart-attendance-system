import { PrismaClient, Role, ClassType, AttendanceStatus, MarkedBy, VerificationMethod } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.auditLog.deleteMany({});
  await prisma.engagement.deleteMany({});
  await prisma.compliance.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Existing data cleared');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: Role.admin,
      isVerified: true,
    },
  });
  console.log('Admin user created:', admin.email);

  // Create faculty users
  const facultyPassword = await bcrypt.hash('faculty123', 10);
  const faculty1 = await prisma.user.create({
    data: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      password: facultyPassword,
      role: Role.faculty,
      isVerified: true,
    },
  });

  const faculty2 = await prisma.user.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      password: facultyPassword,
      role: Role.faculty,
      isVerified: true,
    },
  });
  console.log('Faculty users created');

  // Create student users
  const studentPassword = await bcrypt.hash('student123', 10);
  const students = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        password: studentPassword,
        role: Role.student,
        studentId: 'S001',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob Wilson',
        email: 'bob.wilson@example.com',
        password: studentPassword,
        role: Role.student,
        studentId: 'S002',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Charlie Davis',
        email: 'charlie.davis@example.com',
        password: studentPassword,
        role: Role.student,
        studentId: 'S003',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Diana Evans',
        email: 'diana.evans@example.com',
        password: studentPassword,
        role: Role.student,
        studentId: 'S004',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ethan Foster',
        email: 'ethan.foster@example.com',
        password: studentPassword,
        role: Role.student,
        studentId: 'S005',
        isVerified: true,
      },
    }),
  ]);
  console.log('Student users created');

  // Create sessions
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const session1 = await prisma.session.create({
    data: {
      courseId: 'CS101',
      facultyId: faculty1.id,
      classType: ClassType.lecture,
      startTime: yesterday,
      endTime: new Date(yesterday.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
      duration: 120, // 2 hours in minutes
      isActive: false,
      location: 'Room 101',
      totalStudents: 5,
      attendanceCount: 4,
    },
  });

  const session2 = await prisma.session.create({
    data: {
      courseId: 'CS102',
      facultyId: faculty2.id,
      classType: ClassType.lab,
      startTime: now,
      duration: 180, // 3 hours in minutes
      isActive: true,
      location: 'Lab 201',
      totalStudents: 5,
      attendanceCount: 3,
    },
  });

  const session3 = await prisma.session.create({
    data: {
      courseId: 'CS103',
      facultyId: faculty1.id,
      classType: ClassType.tutorial,
      startTime: tomorrow,
      duration: 90, // 1.5 hours in minutes
      isActive: false,
      location: 'Room 105',
      totalStudents: 5,
      attendanceCount: 0,
    },
  });
  console.log('Sessions created');

  // Create attendance records for session1 (completed session)
  await Promise.all([
    prisma.attendance.create({
      data: {
        sessionId: session1.id,
        studentId: students[0].id,
        status: AttendanceStatus.present,
        markedBy: MarkedBy.faculty,
        faceVerified: true,
        verificationMethod: VerificationMethod.face,
        verificationConfidence: 0.95,
      },
    }),
    prisma.attendance.create({
      data: {
        sessionId: session1.id,
        studentId: students[1].id,
        status: AttendanceStatus.present,
        markedBy: MarkedBy.system,
        faceVerified: true,
        verificationMethod: VerificationMethod.face,
        verificationConfidence: 0.92,
      },
    }),
    prisma.attendance.create({
      data: {
        sessionId: session1.id,
        studentId: students[2].id,
        status: AttendanceStatus.late,
        markedBy: MarkedBy.faculty,
        faceVerified: false,
        verificationMethod: VerificationMethod.manual,
      },
    }),
    prisma.attendance.create({
      data: {
        sessionId: session1.id,
        studentId: students[3].id,
        status: AttendanceStatus.present,
        markedBy: MarkedBy.system,
        faceVerified: true,
        verificationMethod: VerificationMethod.face,
        verificationConfidence: 0.88,
      },
    }),
    prisma.attendance.create({
      data: {
        sessionId: session1.id,
        studentId: students[4].id,
        status: AttendanceStatus.absent,
        markedBy: MarkedBy.faculty,
        faceVerified: false,
        verificationMethod: VerificationMethod.manual,
      },
    }),
  ]);

  // Create attendance records for session2 (active session)
  await Promise.all([
    prisma.attendance.create({
      data: {
        sessionId: session2.id,
        studentId: students[0].id,
        status: AttendanceStatus.present,
        markedBy: MarkedBy.system,
        faceVerified: true,
        verificationMethod: VerificationMethod.face,
        verificationConfidence: 0.97,
      },
    }),
    prisma.attendance.create({
      data: {
        sessionId: session2.id,
        studentId: students[1].id,
        status: AttendanceStatus.present,
        markedBy: MarkedBy.system,
        faceVerified: true,
        verificationMethod: VerificationMethod.face,
        verificationConfidence: 0.94,
      },
    }),
    prisma.attendance.create({
      data: {
        sessionId: session2.id,
        studentId: students[2].id,
        status: AttendanceStatus.present,
        markedBy: MarkedBy.faculty,
        faceVerified: false,
        verificationMethod: VerificationMethod.manual,
      },
    }),
  ]);
  console.log('Attendance records created');

  // Create compliance records
  await Promise.all([
    prisma.compliance.create({
      data: {
        sessionId: session1.id,
        studentId: students[0].id,
        idCardVisible: true,
        phoneDetections: [],
        overallCompliance: 1.0,
      },
    }),
    prisma.compliance.create({
      data: {
        sessionId: session1.id,
        studentId: students[1].id,
        idCardVisible: true,
        phoneDetections: [
          {
            timestamp: new Date(yesterday.getTime() + 30 * 60 * 1000),
            confidence: 0.85,
          },
        ],
        overallCompliance: 0.7,
      },
    }),
    prisma.compliance.create({
      data: {
        sessionId: session1.id,
        studentId: students[2].id,
        idCardVisible: false,
        phoneDetections: [],
        overallCompliance: 0.7,
      },
    }),
    prisma.compliance.create({
      data: {
        sessionId: session1.id,
        studentId: students[3].id,
        idCardVisible: true,
        phoneDetections: [],
        overallCompliance: 1.0,
      },
    }),
  ]);
  console.log('Compliance records created');

  // Create engagement records
  await Promise.all([
    prisma.engagement.create({
      data: {
        sessionId: session1.id,
        studentId: students[0].id,
        metrics: [
          {
            timestamp: new Date(yesterday.getTime() + 15 * 60 * 1000),
            attention: 0.9,
            engagement: 0.85,
            emotion: 'engaged',
          },
          {
            timestamp: new Date(yesterday.getTime() + 45 * 60 * 1000),
            attention: 0.8,
            engagement: 0.75,
            emotion: 'neutral',
          },
        ],
        averageAttention: 0.85,
        averageEngagement: 0.8,
        dominantEmotion: 'engaged',
        emotionCounts: {
          neutral: 1,
          engaged: 1,
          happy: 0,
          sad: 0,
          angry: 0,
          surprised: 0,
          confused: 0,
          bored: 0,
        },
      },
    }),
    prisma.engagement.create({
      data: {
        sessionId: session1.id,
        studentId: students[1].id,
        metrics: [
          {
            timestamp: new Date(yesterday.getTime() + 15 * 60 * 1000),
            attention: 0.7,
            engagement: 0.6,
            emotion: 'neutral',
          },
          {
            timestamp: new Date(yesterday.getTime() + 45 * 60 * 1000),
            attention: 0.5,
            engagement: 0.4,
            emotion: 'bored',
          },
        ],
        averageAttention: 0.6,
        averageEngagement: 0.5,
        dominantEmotion: 'neutral',
        emotionCounts: {
          neutral: 1,
          engaged: 0,
          happy: 0,
          sad: 0,
          angry: 0,
          surprised: 0,
          confused: 0,
          bored: 1,
        },
      },
    }),
  ]);
  console.log('Engagement records created');

  // Create audit logs
  await Promise.all([
    prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'create',
        resource: 'user',
        resourceId: faculty1.id,
        details: 'Created faculty user',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: faculty1.id,
        action: 'create',
        resource: 'session',
        resourceId: session1.id,
        details: 'Started new session',
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0',
      },
    }),
  ]);
  console.log('Audit logs created');

  console.log('Database seeding completed');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import prisma from '../utils/prisma';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Helper function to convert regular array to pgvector
const arrayToVector = (array: number[]) => {
  // In PostgreSQL with pgvector, we need to ensure the array is in the right format
  // This is just a pass-through - the Prisma Client will handle conversion
  return array;
};

// Helper function to convert pgvector to regular array
const vectorToArray = (vector: any): number[] => {
  // Handle potential null or undefined
  if (!vector) return [];
  
  // If it's already an array, return it
  if (Array.isArray(vector)) return vector;
  
  // If it's stored as a string, parse it
  if (typeof vector === 'string') {
    try {
      return JSON.parse(vector);
    } catch {
      return [];
    }
  }
  
  // Default case
  return [];
};

export interface UserWithoutPassword extends Omit<User, 'password' | 'faceEncoding'> {
  faceEncoding?: number[];
}

// User services
export const userService = {
  // Create user
  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'faculty' | 'admin';
    studentId?: string;
  }): Promise<UserWithoutPassword> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        studentId: userData.studentId,
      },
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as UserWithoutPassword;
  },

  // Find user by email
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  // Find user by ID
  async findUserById(id: string): Promise<UserWithoutPassword | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as UserWithoutPassword;
  },

  // Register face for user
  async registerFace(userId: string, faceEncoding: number[]): Promise<UserWithoutPassword | null> {
    try {
      // First, use raw SQL via Prisma to ensure vector data is stored correctly
      // This bypasses type issues with pgvector
      await prisma.$executeRaw`UPDATE "User" SET "faceEncoding" = ${JSON.stringify(faceEncoding)}::jsonb, "faceRegistered" = true, "faceRegisteredAt" = ${new Date()} WHERE id = ${userId}`;
      
      // Then fetch the updated user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) return null;

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        faceEncoding: faceEncoding, // Ensure we return the actual face encoding
      } as UserWithoutPassword;
    } catch (error) {
      console.error('Error registering face:', error);
      return null;
    }
  },

  // Get all users with face registrations
  async getAllUsersWithFaces(): Promise<UserWithoutPassword[]> {
    const users = await prisma.user.findMany({
      where: {
        faceRegistered: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        faceEncoding: true,
        faceRegistered: true,
        faceRegisteredAt: true,
      },
    });

    // Convert face encodings to regular arrays
    return users.map(user => ({
      ...user,
      faceEncoding: user.faceEncoding ? vectorToArray(user.faceEncoding) : undefined,
    })) as UserWithoutPassword[];
  },

  // Verify password
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  // Generate JWT token
  generateToken(userId: string): string {
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    const jwtExpire = process.env.JWT_EXPIRE || '30d';
    
    return jwt.sign({ id: userId }, jwtSecret, {
      expiresIn: jwtExpire,
    });
  },

  // Update user
  async updateUser(userId: string, userData: Partial<User>): Promise<UserWithoutPassword | null> {
    // If updating password, hash it
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: userData,
    });

    if (!user) return null;

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as UserWithoutPassword;
  },

  // Delete user
  async deleteUser(userId: string): Promise<boolean> {
    const user = await prisma.user.delete({
      where: { id: userId },
    });

    return !!user;
  }
};

// Session services
export const sessionService = {
  // Create session
  async createSession(sessionData: {
    title: string;
    courseCode: string;
    facultyId: string;
    startTime: Date;
    endTime: Date;
    location?: string;
  }) {
    return prisma.session.create({
      data: sessionData,
    });
  },

  // Find session by ID
  async findSessionById(id: string) {
    return prisma.session.findUnique({
      where: { id },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  // Get sessions by faculty
  async getSessionsByFaculty(facultyId: string) {
    return prisma.session.findMany({
      where: { facultyId },
      orderBy: { startTime: 'desc' },
    });
  },

  // Update session status
  async updateSessionStatus(sessionId: string, status: 'scheduled' | 'inProgress' | 'completed' | 'cancelled') {
    return prisma.session.update({
      where: { id: sessionId },
      data: { status },
    });
  },
};

// Attendance services
export const attendanceService = {
  // Mark attendance via facial recognition
  async markAttendance(sessionId: string, userId: string, status: 'present' | 'absent' | 'late' | 'excused') {
    return prisma.attendance.create({
      data: {
        sessionId,
        userId,
        status,
        entryTime: new Date(),
        verificationMethod: 'facial',
      },
    });
  },

  // Get attendance by session
  async getAttendanceBySession(sessionId: string) {
    return prisma.attendance.findMany({
      where: { sessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
          },
        },
      },
    });
  },

  // Get attendance by user
  async getAttendanceByUser(userId: string) {
    return prisma.attendance.findMany({
      where: { userId },
      include: {
        session: true,
      },
    });
  },
};
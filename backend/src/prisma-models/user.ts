import prisma from '../utils/dbPrisma';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '@prisma/client';

/**
 * Get a signed JWT token for a user
 */
export const getSignedJwtToken = (user: User): string => {
  const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
  const payload = { id: user.id };
  return jwt.sign(payload, jwtSecret);
};

/**
 * Match a password against a user's hashed password
 */
export const matchPassword = async (enteredPassword: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

/**
 * Generate a reset password token
 */
export const getResetPasswordToken = async (userId: string): Promise<string> => {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time (10 minutes)
  const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

  // Update user in database
  await prisma.user.update({
    where: { id: userId },
    data: {
      resetPasswordToken,
      resetPasswordExpire
    }
  });

  return resetToken;
};

/**
 * Hash a password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Create a new user
 */
export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'faculty' | 'admin';
  studentId?: string;
}): Promise<User> => {
  // Hash password
  const hashedPassword = await hashPassword(userData.password);

  // Create verification token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Create user
  return await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
      studentId: userData.studentId,
      verificationToken,
      isVerified: false
    }
  });
};

export default {
  getSignedJwtToken,
  matchPassword,
  getResetPasswordToken,
  hashPassword,
  createUser
};

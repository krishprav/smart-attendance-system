import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import prisma from '../utils/dbPrisma';
import { sendEmail } from '../utils/email';
import crypto from 'crypto';
import { getGoogleAuthURL, getTokens, getGoogleUser, googleConfig } from '../config/googleAuth';
import userModel from '../prisma-models/user';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, role, studentId } = req.body;

    // Check if email is from college domain
    const emailDomain = email.split('@')[1];
    if (!googleConfig.allowedDomains.includes(emailDomain)) {
      return res.status(400).json({
        success: false,
        message: 'Only college email addresses (iiitmanipur.ac.in) are allowed',
      });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        studentId,
        verificationToken,
        isVerified: false
      }
    });

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    const message = `
      <h1>Verify Your Email</h1>
      <p>Please click the link below to verify your email:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification',
        message,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify your email.',
      });
    } catch (err) {
      await prisma.user.update({
        where: { id: user.id },
        data: { verificationToken: null }
      });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent',
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first',
      });
    }

    // Create token
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    const payload = { id: user.id };

    // Use a more basic approach to sign the token
    const token = jwt.sign(payload, jwtSecret);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        faceRegistered: user.faceRegistered || false
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Google OAuth URL
// @route   GET /api/auth/google
// @access  Public
export const googleAuth = (req: Request, res: Response): any => {
  res.redirect(getGoogleAuthURL());
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = async (req: Request, res: Response): Promise<any> => {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required',
      });
    }

    // Get tokens
    const tokens = await getTokens(code);
    if (!tokens || !tokens.id_token) {
      return res.status(400).json({
        success: false,
        message: 'Failed to get tokens from Google',
      });
    }

    // Get user info
    const googleUser = await getGoogleUser(tokens.id_token);
    if (!googleUser || !googleUser.email) {
      return res.status(400).json({
        success: false,
        message: 'Failed to get user info from Google',
      });
    }

    // Check if email domain is from college
    const emailDomain = googleUser.email.split('@')[1];
    if (!googleConfig.allowedDomains.includes(emailDomain)) {
      return res.status(403).json({
        success: false,
        message: 'Only college email addresses (iiitmanipur.ac.in) are allowed',
      });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email: googleUser.email } });

    if (!user) {
      // Generate random password and hash it
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      // Create new user
      user = await prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          password: hashedPassword,
          role: 'student', // Default role, can be updated later
          isVerified: true // Google has already verified the email
        }
      });
    } else if (!user.isVerified) {
      // If user exists but not verified, mark as verified
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true }
      });
    }

    // Create token
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    const payload = { id: user.id };
    const token = jwt.sign(payload, jwtSecret);

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/login/callback?token=${token}`);
  } catch (err: any) {
    console.error('Google OAuth callback error:', err);
    res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(err.message)}`);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await prisma.user.findFirst({
      where: { verificationToken: req.params.token }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token',
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null
      }
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken,
        resetPasswordExpire
      }
    });

    // Create reset url
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const message = `
      <h1>Password Reset Request</h1>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 10 minutes.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message,
      });

      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (err) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: null,
          resetPasswordExpire: null
        }
      });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent',
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken,
        resetPasswordExpire: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null
      }
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Define extended Request type that includes user property
interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        createdAt: user.createdAt,
        faceRegistered: user.faceRegistered || false
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
export const logout = (_req: Request, res: Response): any => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

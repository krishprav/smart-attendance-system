import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../models/User';
import config from '../config/index';

// Interface for decoded user data from JWT
interface DecodedUser {
  id: string;
  [key: string]: any;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Protect routes
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    // Get token from cookie
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const jwtSecret = config.jwtSecret || 'default-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as DecodedUser;

    // Get user from the token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Add user to request
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Grant access to specific roles
export const authorize = (roles: string[]): ((req: Request, res: Response, next: NextFunction) => any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    return next();
  };
};

// Check if user has access to the resource (self, faculty, admin)
export const checkAccess = (req: Request, res: Response, next: NextFunction): any => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  // Allow access if user is admin
  if (req.user.role === 'admin') {
    return next();
  }

  // Allow access if user is faculty
  if (req.user.role === 'faculty') {
    return next();
  }

  // Allow access if user is accessing their own resource
  if (req.user.id.toString() === req.params.id || req.user.studentId === req.params.studentId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Not authorized to access this resource',
  });
};

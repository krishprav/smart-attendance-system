import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Validation middleware for registration
export const validateRegister = [
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid IIIT Manipur email').isEmail().custom((value) => {
  if (!value.endsWith('@iiitmanipur.ac.in')) {
    throw new Error('Email must be a valid @iiitmanipur.ac.in address');
  }
  return true;
}),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  body('role', 'Role is required').isIn(['student', 'faculty', 'admin']),
  body('studentId', 'Student ID is required when role is student').custom((value, { req }) => {
    if (req.body.role === 'student' && !value) {
      throw new Error('Student ID is required');
    }
    return true;
  }),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    return next();
  },
];

// Validation middleware for login
export const validateLogin = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists(),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    return next();
  },
]; 
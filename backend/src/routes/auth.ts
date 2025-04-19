import express from 'express';
import { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  verifyEmail, 
  getMe, 
  logout,
  googleAuth,
  googleCallback
} from '../controllers/auth';
import { validateRegister, validateLogin } from '../middleware/validation';
import { protect } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegister, register);

// @route   POST /api/auth/login
// @desc    Login user and get token
// @access  Public
router.post('/login', validateLogin, login);

// @route   GET /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.get('/google', googleAuth);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', googleCallback);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, getMe);

// @route   GET /api/auth/logout
// @desc    Logout user / clear cookie
// @access  Private
router.get('/logout', protect, logout);

// @route   GET /api/auth/verify-email/:token
// @desc    Verify email
// @access  Public
router.get('/verify-email/:token', verifyEmail);

// @route   POST /api/auth/forgot-password
// @desc    Forgot password
// @access  Public
router.post('/forgot-password', forgotPassword);

// @route   PUT /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', resetPassword);

export default router;
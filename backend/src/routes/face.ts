import express from 'express';
import { registerFace, getFaceRegistrationStatus, verifyFace } from '../controllers/faceRecognition';
import { protect, checkAccess } from '../middleware/auth';

const router = express.Router();

// All routes below this require authentication
router.use(protect);

// @route   POST /api/face/register/:id
// @desc    Register a face for a user
// @access  Private (Self or Admin)
router.post('/register/:id', checkAccess, registerFace);

// @route   GET /api/face/status/:id
// @desc    Get face registration status
// @access  Private (Self or Admin/Faculty)
router.get('/status/:id', checkAccess, getFaceRegistrationStatus);

// @route   POST /api/face/verify
// @desc    Verify a face for attendance
// @access  Private
router.post('/verify', verifyFace);

export default router;

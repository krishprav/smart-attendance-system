import express from 'express';
import { body } from 'express-validator';
import {
  createSession,
  endSession,
  getActiveSessions,
  getSessionDetails,
  markAttendanceManually,
  getStudentStats,
  getAttendanceReport,
  bulkMarkAttendance
} from '../controllers/attendance';
import { markGroupAttendance } from '../controllers/groupAttendance';
import { markAttendanceWithFace } from '../controllers/faceAttendance';
import { protect, authorize, checkAccess } from '../middleware/auth';

const router = express.Router();

// All routes below this require authentication
router.use(protect);

// @route   POST /api/attendance/sessions
// @desc    Start a class session
// @access  Private (Faculty only)
router.post(
  '/sessions',
  authorize(['faculty']),
  [
    body('courseId', 'Course ID is required').not().isEmpty(),
    body('classType', 'Class type is required').isIn(['lecture', 'lab', 'tutorial']),
    body('duration', 'Duration must be a positive number').isNumeric().custom(value => value > 0),
  ],
  createSession
);

// @route   PUT /api/attendance/sessions/:id/end
// @desc    End a class session
// @access  Private (Faculty only)
router.put(
  '/sessions/:id/end',
  authorize(['faculty']),
  endSession
);

// @route   GET /api/attendance/sessions/active
// @desc    Get active sessions
// @access  Private (Faculty/Admin)
router.get(
  '/sessions/active',
  authorize(['faculty', 'admin']),
  getActiveSessions
);

// @route   GET /api/attendance/sessions/:id
// @desc    Get session details
// @access  Private (Faculty/Admin)
router.get(
  '/sessions/:id',
  authorize(['faculty', 'admin']),
  getSessionDetails
);

// @route   POST /api/attendance/face
// @desc    Mark attendance with face recognition (new method)
// @access  Private (Student only)
router.post(
  '/face',
  authorize(['student']),
  [
    body('sessionId', 'Session ID is required').not().isEmpty(),
    body('image', 'Image is required').not().isEmpty(),
  ],
  markAttendanceWithFace
);

// @route   POST /api/attendance/sessions/:id/manual
// @desc    Mark attendance manually
// @access  Private (Faculty only)
router.post(
  '/sessions/:id/manual',
  authorize(['faculty']),
  [
    body('studentId', 'Student ID is required').not().isEmpty(),
    body('status', 'Status is required').isIn(['present', 'absent', 'late']),
  ],
  markAttendanceManually
);

// @route   GET /api/attendance/sessions/:id/attendance
// @desc    Get session attendance
// @access  Private (Faculty/Admin)
router.get(
  '/sessions/:id/attendance',
  authorize(['faculty', 'admin']),
  getSessionDetails
);

// @route   GET /api/attendance/history/:studentId
// @desc    Get student attendance history
// @access  Private (Faculty/Admin/Self)
router.get(
  '/history/:studentId',
  checkAccess,
  getStudentStats
);

// @route   POST /api/attendance/bulk
// @desc    Bulk mark attendance for multiple students
// @access  Private (Faculty only)
router.post(
  '/bulk',
  authorize(['faculty']),
  bulkMarkAttendance
);

// @route   POST /api/attendance/group
// @desc    Mark attendance for multiple students using face recognition
// @access  Private (Faculty only)
router.post(
  '/group',
  authorize(['faculty']),
  [
    body('sessionId', 'Session ID is required').not().isEmpty(),
    body('image', 'Image is required').not().isEmpty(),
  ],
  markGroupAttendance
);

export default router;
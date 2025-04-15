import express from 'express';
import { body } from 'express-validator';
import { getStudents, getStudent, updateStudent, deleteStudent, registerFace, getFaceRegistrationStatus } from '../controllers/students';
import { protect, authorize, checkAccess } from '../middleware/auth';

const router = express.Router();

// All routes below this require authentication
router.use(protect);

// @route   GET /api/students
// @desc    Get all students
// @access  Private (Admin/Faculty only)
router.get(
  '/',
  authorize(['admin', 'faculty']),
  getStudents
);

// @route   GET /api/students/:id
// @desc    Get single student
// @access  Private (Admin/Faculty/Self)
router.get(
  '/:id',
  checkAccess,
  getStudent
);

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (Admin/Self)
router.put(
  '/:id',
  checkAccess,
  updateStudent
);

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private (Admin only)
router.delete(
  '/:id',
  authorize(['admin']),
  deleteStudent
);

// @route   POST /api/students/:id/face
// @desc    Register face
// @access  Private (Self or Admin)
router.post(
  '/:id/face',
  checkAccess,
  registerFace
);

// @route   GET /api/students/:id/face/status
// @desc    Get face registration status
// @access  Private (Self or Admin/Faculty)
router.get(
  '/:id/face/status',
  checkAccess,
  getFaceRegistrationStatus
);

export default router;
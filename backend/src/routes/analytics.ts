import express from 'express';
import { 
  getCourseAttendance, 
  getStudentEngagement, 
  getComplianceReports, 
  getAttendanceTrends,
  getOverviewStats
} from '../controllers/analytics';
import { protect, authorize, checkAccess } from '../middleware/auth';

const router = express.Router();

// All routes below this require authentication
router.use(protect);

// @route   GET /api/analytics/courses/:courseId/attendance
// @desc    Get attendance percentage by course
// @access  Private (Faculty/Admin)
router.get(
  '/courses/:courseId/attendance',
  authorize(['faculty', 'admin']),
  getCourseAttendance
);

// @route   GET /api/analytics/students/:id/engagement
// @desc    Get student engagement data
// @access  Private (Faculty/Admin/Self)
router.get(
  '/students/:id/engagement',
  checkAccess,
  getStudentEngagement
);

// @route   GET /api/analytics/compliance
// @desc    Get compliance reports
// @access  Private (Admin only)
router.get(
  '/compliance',
  authorize(['admin']),
  getComplianceReports
);

// @route   GET /api/analytics/trends
// @desc    Get attendance trends
// @access  Private (Faculty/Admin)
router.get(
  '/trends',
  authorize(['faculty', 'admin']),
  getAttendanceTrends
);

// @route   GET /api/analytics/overview
// @desc    Get overview statistics
// @access  Private (Faculty/Admin)
router.get(
  '/overview',
  authorize(['faculty', 'admin']),
  getOverviewStats
);

export default router;
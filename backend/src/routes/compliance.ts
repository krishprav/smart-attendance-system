import express from 'express';
import { 
  getAuditLogs, 
  createAuditLog, 
  getAuditReport, 
  checkSystemCompliance 
} from '../controllers/compliance';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All routes below this require authentication
router.use(protect);

// @route   GET /api/compliance/logs
// @desc    Get audit logs
// @access  Private (Admin only)
router.get(
  '/logs',
  authorize(['admin']),
  getAuditLogs
);

// @route   POST /api/compliance/logs
// @desc    Create audit log
// @access  Private
router.post(
  '/logs',
  createAuditLog
);

// @route   GET /api/compliance/report
// @desc    Get audit report
// @access  Private (Admin only)
router.get(
  '/report',
  authorize(['admin']),
  getAuditReport
);

// @route   GET /api/compliance/system
// @desc    Check system compliance
// @access  Private (Admin only)
router.get(
  '/system',
  authorize(['admin']),
  checkSystemCompliance
);

export default router;
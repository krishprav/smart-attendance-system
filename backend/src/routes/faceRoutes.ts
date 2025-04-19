import express from 'express';
import { faceController } from '../controllers/faceController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(protect);

// Register face routes
router.post('/register/:userId', faceController.registerFace);
router.get('/data/:userId', faceController.getFaceData);
router.delete('/register/:userId', faceController.removeFaceRegistration);

// Attendance marking routes
router.post('/attendance/mark', authorize(['faculty', 'admin']), faceController.markAttendance);
router.get('/attendance/session/:sessionId', faceController.getAttendanceBySession);

export default router;
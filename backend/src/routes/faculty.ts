import express from 'express';
import { protect, authorize } from '../middleware/auth';
import { 
  getFacultyClasses,
  getFacultyClassById,
  getFacultySessions,
  getFacultySessionById,
  createFacultySession,
  updateFacultySession,
  endFacultySession,
  getFacultyAnalytics,
  getFacultyClassAnalytics,
  getFacultyStudentAnalytics,
  getFacultyReports,
  generateFacultyReport
} from '../controllers/faculty';

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize(['faculty']));

// Classes routes
router.route('/classes')
  .get(getFacultyClasses);

router.route('/classes/:id')
  .get(getFacultyClassById);

// Sessions routes
router.route('/sessions')
  .get(getFacultySessions)
  .post(createFacultySession);

router.route('/sessions/:id')
  .get(getFacultySessionById)
  .put(updateFacultySession);

router.route('/sessions/:id/end')
  .post(endFacultySession);

// Analytics routes
router.route('/analytics')
  .get(getFacultyAnalytics);

router.route('/analytics/class/:id')
  .get(getFacultyClassAnalytics);

router.route('/analytics/student/:id')
  .get(getFacultyStudentAnalytics);

// Reports routes
router.route('/reports')
  .get(getFacultyReports);

router.route('/reports/generate')
  .post(generateFacultyReport);

router.route('/reports/:id/download')
  .get((req, res) => {
    // This is a placeholder - implement actual report download
    res.status(200).json({
      success: true,
      message: 'Report download endpoint',
      reportId: req.params.id
    });
  });

export default router;

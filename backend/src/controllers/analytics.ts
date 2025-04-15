import { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import Session from '../models/Session';
import User from '../models/User';

// Define extended Request type that includes user property
interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get attendance percentage by course
// @route   GET /api/analytics/courses/:courseId/attendance
// @access  Private (Faculty/Admin)
export const getCourseAttendance = async (req: Request, res: Response): Promise<any> => {
  try {
    // Get all sessions for this course
    const sessions = await Session.find({ courseId: req.params.courseId });
    
    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No sessions found for this course'
      });
    }

    const sessionIds = sessions.map(session => session._id);
    
    // Get all students
    const students = await User.find({ role: 'student' });
    
    // Calculate attendance for each student
    const attendanceData = await Promise.all(
      students.map(async (student) => {
        const attendanceRecords = await Attendance.find({
          session: { $in: sessionIds },
          student: student._id
        });
        
        const presentCount = attendanceRecords.filter(
          record => record.status === 'present'
        ).length;
        
        const percentage = (sessions.length > 0) 
          ? (presentCount / sessions.length) * 100 
          : 0;
        
        return {
          student: {
            id: student._id,
            name: student.name,
            studentId: student.studentId
          },
          attendedSessions: presentCount,
          totalSessions: sessions.length,
          percentage: Math.round(percentage * 100) / 100
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: attendanceData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get student engagement data
// @route   GET /api/analytics/students/:id/engagement
// @access  Private (Faculty/Admin/Self)
export const getStudentEngagement = async (req: Request, res: Response): Promise<any> => {
  try {
    // This is a placeholder - would typically analyze engagement data
    res.status(200).json({
      success: true,
      message: 'Student engagement analytics will be implemented later',
      // TODO: Implement actual engagement data once models are in place
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get compliance reports
// @route   GET /api/analytics/compliance
// @access  Private (Admin only)
export const getComplianceReports = async (_req: Request, res: Response): Promise<any> => {
  try {
    // This is a placeholder - would typically generate compliance reports
    res.status(200).json({
      success: true,
      message: 'Compliance reporting will be implemented later',
      // TODO: Implement compliance reports
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get attendance trends
// @route   GET /api/analytics/trends
// @access  Private (Faculty/Admin)
export const getAttendanceTrends = async (_req: Request, res: Response): Promise<any> => {
  try {
    // Get sessions in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sessions = await Session.find({
      startTime: { $gte: thirtyDaysAgo }
    });
    
    // Group by date
    const sessionsByDate = sessions.reduce((acc: {[key: string]: any}, session) => {
      const date = session.startTime.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(session);
      return acc;
    }, {});
    
    // Calculate attendance for each date
    const trends = await Promise.all(
      Object.entries(sessionsByDate).map(async ([date, dateSessions]) => {
        const sessionIds = (dateSessions as any[]).map(session => session._id);
        
        const attendanceRecords = await Attendance.find({
          session: { $in: sessionIds },
          status: 'present'
        });
        
        const totalPossibleAttendance = (dateSessions as any[]).length * (await User.countDocuments({ role: 'student' }));
        const percentage = totalPossibleAttendance > 0 
          ? (attendanceRecords.length / totalPossibleAttendance) * 100 
          : 0;
        
        return {
          date,
          sessionsCount: (dateSessions as any[]).length,
          attendancePercentage: Math.round(percentage * 100) / 100
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get overall attendance statistics
// @route   GET /api/analytics/overview
// @access  Private (Admin/Faculty)
export const getOverviewStats = async (_req: Request, res: Response): Promise<any> => {
  try {
    // Count total students
    const studentCount = await User.countDocuments({ role: 'student' });
    
    // Count total sessions
    const sessionCount = await Session.countDocuments();
    
    // Count total attendance records
    const attendanceCount = await Attendance.countDocuments();
    
    // Calculate attendance percentage
    const presentAttendanceCount = await Attendance.countDocuments({ status: 'present' });
    const totalPossibleAttendance = sessionCount * studentCount;
    
    const overallAttendancePercentage = totalPossibleAttendance > 0
      ? (presentAttendanceCount / totalPossibleAttendance) * 100
      : 0;
    
    // Get attendance by verification method
    const attendanceByMethod = await Attendance.aggregate([
      { $group: { _id: '$verificationMethod', count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        studentCount,
        sessionCount,
        attendanceCount,
        overallAttendancePercentage: Math.round(overallAttendancePercentage * 100) / 100,
        attendanceByMethod: attendanceByMethod.map(item => ({
          method: item._id,
          count: item.count
        }))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
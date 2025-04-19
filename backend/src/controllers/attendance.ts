import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Attendance from '../models/Attendance';
import Session from '../models/Session';
import User from '../models/User';
import axios from 'axios';
import config from '../config';

// Define extended Request type that includes user property
interface AuthRequest extends Request {
  user?: any;
  app?: any;
}

/**
 * @desc    Create a new session
 * @route   POST /api/attendance/session
 * @access  Private (Faculty)
 */
export const createSession = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { courseId, classType, duration, location, totalStudents } = req.body;

    // Validate faculty role
    if (req.user.role !== 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'Only faculty members can create sessions',
      });
    }

    // Create session
    const session = await Session.create({
      courseId,
      faculty: req.user.id,
      classType: classType || 'lecture',
      startTime: new Date(),
      duration: duration || 60, // Default 60 minutes
      location,
      totalStudents: totalStudents || 0,
    });

    // Notify students via WebSocket if available
    const websocketService = req.app.get('websocketService');
    if (websocketService) {
      // No need to await this
      setTimeout(() => {
        websocketService.broadcastSessionUpdate(session._id.toString(), {
          type: 'started',
          courseId,
          faculty: req.user.name,
          location,
          sessionId: session._id.toString(),
        });
      }, 0);
    }

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating session',
      error: error.message,
    });
  }
};

/**
 * @desc    End a session
 * @route   PUT /api/attendance/session/:id/end
 * @access  Private (Faculty)
 */
export const endSession = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Validate faculty ownership
    if (session.faculty.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to end this session',
      });
    }

    // End the session
    session.isActive = false;
    session.endTime = new Date();
    await session.save();

    // Notify students via WebSocket if available
    const websocketService = req.app.get('websocketService');
    if (websocketService) {
      // No need to await this
      setTimeout(() => {
        websocketService.broadcastSessionUpdate(session._id.toString(), {
          type: 'ended',
          sessionId: session._id.toString(),
        });
      }, 0);
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      message: 'Error ending session',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all active sessions
 * @route   GET /api/attendance/sessions/active
 * @access  Private
 */
export const getActiveSessions = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const query = { isActive: true };

    // If student, filter by their courses
    if (req.user.role === 'student') {
      // TODO: Filter by student's enrolled courses
      // For now, just show all active sessions
    }

    // If faculty, filter by their created sessions
    if (req.user.role === 'faculty') {
      query['faculty'] = req.user.id;
    }

    const sessions = await Session.find(query)
      .populate('faculty', 'name email')
      .sort({ startTime: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error: any) {
    console.error('Error getting active sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting active sessions',
      error: error.message,
    });
  }
};

/**
 * @desc    Get session details
 * @route   GET /api/attendance/session/:id
 * @access  Private
 */
export const getSessionDetails = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('faculty', 'name email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Get attendance records for the session
    const attendanceRecords = await Attendance.find({ session: req.params.id })
      .populate('student', 'name email studentId');

    res.status(200).json({
      success: true,
      data: {
        session,
        attendance: attendanceRecords,
      },
    });
  } catch (error: any) {
    console.error('Error getting session details:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting session details',
      error: error.message,
    });
  }
};

/**
 * @desc    Mark attendance manually
 * @route   POST /api/attendance/mark
 * @access  Private (Faculty)
 */
export const markAttendanceManually = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { sessionId, studentId, status } = req.body;

    // Validate required fields
    if (!sessionId || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and Student ID are required',
      });
    }

    // Validate faculty role
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only faculty members can mark attendance manually',
      });
    }

    // Check if session exists and is active
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    if (!session.isActive && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Session is not active',
      });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Check if attendance already exists
    let attendance = await Attendance.findOne({
      session: sessionId,
      student: studentId,
    });

    if (attendance) {
      // Update existing attendance
      attendance.status = status || 'present';
      attendance.markedBy = 'faculty';
      attendance.markedAt = new Date();

      await attendance.save();
    } else {
      // Create new attendance record
      attendance = await Attendance.create({
        session: sessionId,
        student: studentId,
        status: status || 'present',
        markedBy: 'faculty',
        verificationMethod: 'manual',
      });
    }

    // Update session attendance count
    const attendanceCount = await Attendance.countDocuments({
      session: sessionId,
      status: 'present',
    });

    session.attendanceCount = attendanceCount;
    await session.save();

    // Notify via WebSocket if available
    const websocketService = req.app.get('websocketService');
    if (websocketService) {
      setTimeout(() => {
        websocketService.broadcastAttendanceUpdate(sessionId, {
          type: 'marked',
          student: {
            id: student._id,
            name: student.name,
            studentId: student.studentId
          },
          status: attendance.status,
          method: 'manual',
          markedBy: req.user.name,
        });
      }, 0);
    }

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error: any) {
    console.error('Error marking attendance manually:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message,
    });
  }
};

/**
 * @desc    Mark attendance with face recognition
 * @route   POST /api/attendance/face
 * @access  Private (Student)
 */
export const markAttendanceWithFace = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { sessionId, image } = req.body;

    // Validate required fields
    if (!sessionId || !image) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and face image are required',
      });
    }

    // Check if session exists and is active
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    if (!session.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Session is not active',
      });
    }

    // Get all students with face encodings
    const students = await User.find({
      role: 'student',
      faceEncoding: { $exists: true, $ne: [] },
    }).select('+faceEncoding');

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No registered faces found',
      });
    }

    // Prepare data for ML API
    const encodings = students.map((student) => ({
      studentId: student.studentId || student._id.toString(),
      encoding: student.faceEncoding,
    }));

    let matchedStudent;
    let verificationConfidence = 0;

    // For storing face analysis results
    let analyzeResponse = null;

    try {
      // First, analyze the face to ensure it's a good quality image
      analyzeResponse = await axios.post(`${config.mlApi.url}/api/face/analyze`, {
        image
      });

      if (!analyzeResponse.data.success) {
        return res.status(400).json({
          success: false,
          message: analyzeResponse.data.message || 'Face analysis failed'
        });
      }

      if (analyzeResponse.data.faceCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'No face detected in the image'
        });
      }

      if (analyzeResponse.data.faceCount > 1) {
        return res.status(400).json({
          success: false,
          message: 'Multiple faces detected in the image. Please provide an image with only one face.'
        });
      }

      // Call ML API to verify face
      const response = await axios.post(
        `${config.mlApi.url}${config.mlApi.face.verify}`,
        {
          image,
          encodings,
        }
      );

      if (!response.data.success) {
        return res.status(400).json({
          success: false,
          message: response.data.message || 'Face verification failed',
        });
      }

      // Find the matched student
      const matchedStudentId = response.data.studentId;
      matchedStudent = students.find(
        (student) =>
          student.studentId === matchedStudentId ||
          student._id.toString() === matchedStudentId
      );

      if (!matchedStudent) {
        return res.status(404).json({
          success: false,
          message: 'Matched student not found in database',
        });
      }

      // Get verification details from the response
      verificationConfidence = response.data.verification?.confidenceScore ||
        (response.data.confidence === 'high' ? 0.9 :
        response.data.confidence === 'medium' ? 0.7 : 0.5);

      // Create verification details object
      const verificationDetails = {
        timestamp: new Date(),
        success: true,
        message: 'Face verification successful',
        confidence: verificationConfidence,
        method: 'face',
        faceQuality: analyzeResponse?.data?.faceQuality || 'unknown',
        faceCount: analyzeResponse?.data?.faceCount || 1
      };
    } catch (error) {
      // If faculty mode is enabled, bypass face recognition and use the current user
      if (req.body.facultyMode && req.user.role === 'faculty') {
        matchedStudent = await User.findById(req.body.studentId);

        if (!matchedStudent) {
          return res.status(404).json({
            success: false,
            message: 'Student not found',
          });
        }

        verificationConfidence = 1.0; // Faculty override

        // Create verification details for faculty override
        const verificationDetails = {
          timestamp: new Date(),
          success: true,
          message: 'Faculty override - manual attendance',
          confidence: verificationConfidence,
          method: 'manual',
          faceQuality: 'unknown',
          faceCount: 0
        };
      } else {
        throw error;
      }
    }

    // In student mode, ensure the user can only mark their own attendance
    if (req.user.role === 'student' && matchedStudent._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Face recognition failed: Not your face',
      });
    }

    // Check if attendance already exists
    let attendance = await Attendance.findOne({
      session: sessionId,
      student: matchedStudent._id,
    });

    if (attendance) {
      // Update existing attendance
      attendance.status = 'present';
      attendance.faceVerified = true;
      attendance.verificationMethod = 'face';
      attendance.verificationImage = image;
      attendance.verificationConfidence = verificationConfidence;
      attendance.verificationDetails = verificationDetails;
      attendance.markedAt = new Date();

      await attendance.save();
    } else {
      // Create new attendance record
      attendance = await Attendance.create({
        session: sessionId,
        student: matchedStudent._id,
        status: 'present',
        markedBy: 'system',
        faceVerified: true,
        verificationMethod: 'face',
        verificationImage: image,
        verificationConfidence: verificationConfidence,
        verificationDetails: verificationDetails,
        markedAt: new Date(),
      });
    }

    // Update session attendance count
    const attendanceCount = await Attendance.countDocuments({
      session: sessionId,
      status: 'present',
    });

    session.attendanceCount = attendanceCount;
    await session.save();

    // Notify via WebSocket if available
    const websocketService = req.app.get('websocketService');
    if (websocketService) {
      setTimeout(() => {
        websocketService.broadcastAttendanceUpdate(sessionId, {
          type: 'marked',
          student: {
            id: matchedStudent._id,
            name: matchedStudent.name,
            studentId: matchedStudent.studentId,
          },
          status: 'present',
          method: 'face',
          confidence: verificationConfidence,
        });
      }, 0);
    }

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        student: {
          id: matchedStudent._id,
          name: matchedStudent.name,
          studentId: matchedStudent.studentId,
          email: matchedStudent.email,
        },
        session: {
          id: session._id,
          courseId: session.courseId,
          startTime: session.startTime,
          attendanceCount: session.attendanceCount,
        },
        attendance: {
          id: attendance._id,
          status: attendance.status,
          markedAt: attendance.markedAt,
          verificationMethod: attendance.verificationMethod,
        },
      },
    });
  } catch (error: any) {
    console.error('Mark attendance with face error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error marking attendance with face',
      error: error.message,
    });
  }
};

/**
 * @desc    Get student attendance stats
 * @route   GET /api/attendance/stats/student/:id
 * @access  Private (Self or Faculty/Admin)
 */
export const getStudentStats = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const studentId = req.params.id || req.user.id;

    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'faculty' && req.user.id !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these stats',
      });
    }

    // Get student
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Get all attended sessions
    const attendanceRecords = await Attendance.find({
      student: studentId,
    }).populate('session');

    // Calculate stats
    const totalSessions = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(record => record.status === 'present').length;
    const lateCount = attendanceRecords.filter(record => record.status === 'late').length;
    const absentCount = attendanceRecords.filter(record => record.status === 'absent').length;

    // Get course-wise attendance
    // TODO: Implement course-wise attendance stats

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.name,
          studentId: student.studentId,
          email: student.email,
        },
        stats: {
          totalSessions,
          presentCount,
          lateCount,
          absentCount,
          presentPercentage: totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0,
          attendanceRate: totalSessions > 0 ? ((presentCount + lateCount) / totalSessions) * 100 : 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting student stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting student stats',
      error: error.message,
    });
  }
};

/**
 * @desc    Bulk mark attendance for multiple students
 * @route   POST /api/attendance/bulk
 * @access  Private (Faculty)
 */
export const bulkMarkAttendance = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { sessionId, students } = req.body;

    // Validate required fields
    if (!sessionId || !students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and students array are required',
      });
    }

    // Validate faculty role
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only faculty members can mark attendance in bulk',
      });
    }

    // Check if session exists and is active
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    if (!session.isActive && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Session is not active',
      });
    }

    // Process each student
    const results = [];
    for (const student of students) {
      const { studentId, status } = student;

      // Check if student exists
      const studentUser = await User.findById(studentId);
      if (!studentUser || studentUser.role !== 'student') {
        results.push({
          studentId,
          success: false,
          message: 'Student not found',
        });
        continue;
      }

      // Check if attendance already exists
      let attendance = await Attendance.findOne({
        session: sessionId,
        student: studentId,
      });

      if (attendance) {
        // Update existing attendance
        attendance.status = status || 'present';
        attendance.markedBy = 'faculty';
        attendance.markedAt = new Date();

        await attendance.save();
      } else {
        // Create new attendance record
        attendance = await Attendance.create({
          session: sessionId,
          student: studentId,
          status: status || 'present',
          markedBy: 'faculty',
          verificationMethod: 'manual',
        });
      }

      results.push({
        studentId,
        success: true,
        data: attendance,
      });

      // Notify via WebSocket if available
      const websocketService = req.app.get('websocketService');
      if (websocketService) {
        websocketService.broadcastAttendanceUpdate(sessionId, {
          type: 'marked',
          student: {
            id: studentUser._id,
            name: studentUser.name,
            studentId: studentUser.studentId,
          },
          status: status || 'present',
          method: 'manual',
          markedBy: req.user.name,
        });
      }
    }

    // Update session attendance count
    const attendanceCount = await Attendance.countDocuments({
      session: sessionId,
      status: 'present',
    });

    session.attendanceCount = attendanceCount;
    await session.save();

    res.status(200).json({
      success: true,
      data: {
        session,
        results,
      },
    });
  } catch (error: any) {
    console.error('Error marking attendance in bulk:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance in bulk',
      error: error.message,
    });
  }
};

/**
 * @desc    Get attendance report
 * @route   GET /api/attendance/report
 * @access  Private (Faculty/Admin)
 */
export const getAttendanceReport = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // Validate faculty/admin role
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only faculty and admin can access attendance reports',
      });
    }

    const { courseId, startDate, endDate } = req.query;

    const query: any = {};

    // Add courseId filter if provided
    if (courseId) {
      // Find sessions for this course
      const sessions = await Session.find({ courseId });
      query.session = { $in: sessions.map(session => session._id) };
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      query.markedAt = {};
      if (startDate) {
        query.markedAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.markedAt.$lte = new Date(endDate as string);
      }
    }

    // Get attendance records
    const attendanceRecords = await Attendance.find(query)
      .populate({
        path: 'student',
        select: 'name email studentId',
      })
      .populate({
        path: 'session',
        select: 'courseId startTime endTime isActive faculty',
        populate: {
          path: 'faculty',
          select: 'name email',
        },
      })
      .sort({ 'session.startTime': -1, markedAt: -1 });

    // Group by session
    const sessionMap = new Map();
    for (const record of attendanceRecords) {
      const sessionId = record.session._id.toString();
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          session: record.session,
          attendance: [],
        });
      }
      sessionMap.get(sessionId).attendance.push(record);
    }

    // Convert map to array
    const report = Array.from(sessionMap.values());

    res.status(200).json({
      success: true,
      count: report.length,
      data: report,
    });
  } catch (error: any) {
    console.error('Error getting attendance report:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting attendance report',
      error: error.message,
    });
  }
};

export default {
  createSession,
  endSession,
  getActiveSessions,
  getSessionDetails,
  markAttendanceManually,
  markAttendanceWithFace,
  getStudentStats,
  bulkMarkAttendance,
  getAttendanceReport,
};

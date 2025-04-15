import { Request, Response } from 'express';
import Session from '../models/Session';
import Attendance from '../models/Attendance';

// Define extended Request type that includes user property
interface AuthRequest extends Request {
  user?: any;
}

// @desc    Start a class session
// @route   POST /api/attendance/sessions
// @access  Private (Faculty only)
export const startSession = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { courseId, classType, duration } = req.body;

    const session = await Session.create({
      faculty: req.user.id,
      courseId,
      classType,
      duration,
      startTime: new Date(),
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    End a class session
// @route   PUT /api/attendance/sessions/:id/end
// @access  Private (Faculty only)
export const endSession = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const session = await Session.findOne({ 
      _id: req.params.id, 
      faculty: req.user.id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active session found with that ID'
      });
    }

    session.isActive = false;
    session.endTime = new Date();
    await session.save();

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get active sessions
// @route   GET /api/attendance/sessions/active
// @access  Private (Faculty/Admin)
export const getActiveSessions = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const query = req.user.role === 'faculty' ? { faculty: req.user.id, isActive: true } : { isActive: true };
    
    const sessions = await Session.find(query);

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get session details
// @route   GET /api/attendance/sessions/:id
// @access  Private (Faculty/Admin)
export const getSessionDetails = async (req: Request, res: Response): Promise<any> => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark attendance with face recognition
// @route   POST /api/attendance/sessions/:id/mark
// @access  Private (Student only)
export const markAttendance = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { image } = req.body;
    
    // Check if session exists and is active
    const session = await Session.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active session found with that ID'
      });
    }

    // This is a placeholder - would typically involve face recognition
    // For now, we'll create an attendance record directly
    const attendance = await Attendance.create({
      session: session._id,
      student: req.user.id,
      status: 'present',
      verificationMethod: 'face',
      location: req.body.location || {},
      deviceInfo: req.headers['user-agent'] || 'Unknown device'
    });

    res.status(201).json({
      success: true,
      data: attendance,
      message: 'Attendance marked successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark attendance manually
// @route   POST /api/attendance/sessions/:id/manual
// @access  Private (Faculty only)
export const markAttendanceManually = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { studentId, status } = req.body;

    // Check if session exists and is active
    const session = await Session.findOne({
      _id: req.params.id,
      faculty: req.user.id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active session found with that ID'
      });
    }

    // Create or update attendance record
    const attendance = await Attendance.findOneAndUpdate(
      {
        session: session._id,
        student: studentId
      },
      {
        status,
        verificationMethod: 'manual',
        markedBy: req.user.id
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: attendance,
      message: 'Attendance marked manually'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark attendance using face recognition
// @route   POST /api/attendance/sessions/:id/mark
// @access  Private (Student)
import User from '../models/User';
import axios from 'axios';

export const markAttendanceByFace = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const sessionId = req.params.id;
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }
    // Fetch all students with faceEncoding
    const students = await User.find({ role: 'student', faceEncoding: { $exists: true, $ne: [] } }).select('faceEncoding');
    if (!students.length) {
      return res.status(404).json({ success: false, message: 'No registered faces found' });
    }
    // Prepare encodings and student map
    const encodings = students.map(s => s.faceEncoding);
    const studentIds = students.map(s => s._id.toString());
    // Call ML service to match face
    const ML_GATEWAY_URL = process.env.ML_GATEWAY_URL || 'http://localhost:8080';
    const response = await axios.post(`${ML_GATEWAY_URL}/face/verify`, { image, encodings });
    const { matchIndex, confidence } = response.data;
    if (typeof matchIndex !== 'number' || matchIndex < 0) {
      return res.status(401).json({ success: false, message: 'Face not recognized' });
    }
    const matchedStudentId = studentIds[matchIndex];
    // Mark attendance for matched student
    const Attendance = require('../models/Attendance').default;
    const attendance = await Attendance.findOneAndUpdate(
      { session: sessionId, student: matchedStudentId },
      { status: 'present', verificationMethod: 'face', confidence },
      { new: true, upsert: true }
    );
    res.status(200).json({
      success: true,
      data: attendance,
      message: 'Attendance marked by face recognition',
      matchedStudentId,
      confidence
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Attendance marking failed',
      error: err.message
    });
  }
};

// @desc    Get session attendance
// @route   GET /api/attendance/sessions/:id/attendance
// @access  Private (Faculty/Admin)
export const getSessionAttendance = async (req: Request, res: Response): Promise<any> => {
  try {
    const attendanceRecords = await Attendance.find({
      session: req.params.id
    }).populate('student', 'name email studentId');

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get student attendance history
// @route   GET /api/attendance/history/:studentId
// @access  Private (Faculty/Admin/Self)
export const getStudentAttendanceHistory = async (req: Request, res: Response): Promise<any> => {
  try {
    const attendanceRecords = await Attendance.find({
      student: req.params.studentId
    }).populate('session', 'courseId classType startTime endTime');

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
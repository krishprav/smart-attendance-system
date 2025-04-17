import { Request, Response } from 'express';
import axios from 'axios';
import User from '../models/User';
import Session from '../models/Session';
import Attendance from '../models/Attendance';
import config from '../config';

// Define extended Request type that includes user property
interface AuthRequest extends Request {
  user?: any;
}

/**
 * @desc    Mark attendance using face recognition
 * @route   POST /api/attendance/face
 * @access  Private
 */
export const markAttendanceWithFace = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { sessionId, image } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session ID is required' 
      });
    }
    
    if (!image) {
      return res.status(400).json({ 
        success: false, 
        message: 'Face image is required' 
      });
    }
    
    // Check if session exists and is active
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }
    
    if (!session.isActive) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session is not active' 
      });
    }
    
    // Get all students with face encodings
    const students = await User.find({ 
      role: 'student',
      faceEncoding: { $exists: true, $ne: [] }
    }).select('+faceEncoding');
    
    if (students.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No registered faces found' 
      });
    }
    
    // Prepare data for ML API
    const encodings = students.map(student => ({
      studentId: student.studentId || student._id.toString(),
      encoding: student.faceEncoding
    }));
    
    // Call ML API to verify face
    const response = await axios.post(`${config.mlApi.url}${config.mlApi.face.verify}`, {
      image,
      encodings
    });
    
    if (!response.data.success) {
      return res.status(400).json({ 
        success: false, 
        message: response.data.message || 'Face verification failed' 
      });
    }
    
    // Find the matched student
    const matchedStudentId = response.data.studentId;
    const matchedStudent = students.find(student => 
      student.studentId === matchedStudentId || 
      student._id.toString() === matchedStudentId
    );
    
    if (!matchedStudent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Matched student not found in database' 
      });
    }
    
    // Check if attendance already exists
    let attendance = await Attendance.findOne({
      session: sessionId,
      student: matchedStudent._id
    });
    
    const verificationConfidence = 
      response.data.confidence === 'high' ? 0.9 : 
      response.data.confidence === 'medium' ? 0.7 : 0.5;
    
    if (attendance) {
      // Update existing attendance
      attendance.status = 'present';
      attendance.faceVerified = true;
      attendance.verificationMethod = 'face';
      attendance.verificationImage = image;
      attendance.verificationConfidence = verificationConfidence;
      attendance.verificationDetails = {
        timestamp: new Date(),
        success: true,
        message: 'Face verification successful'
      };
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
        verificationDetails: {
          timestamp: new Date(),
          success: true,
          message: 'Face verification successful'
        }
      });
    }
    
    // Update session attendance count
    const attendanceCount = await Attendance.countDocuments({
      session: sessionId,
      status: 'present'
    });
    
    session.attendanceCount = attendanceCount;
    await session.save();
    
    return res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        student: {
          id: matchedStudent._id,
          name: matchedStudent.name,
          studentId: matchedStudent.studentId,
          email: matchedStudent.email
        },
        session: {
          id: session._id,
          courseId: session.courseId,
          startTime: session.startTime,
          attendanceCount: session.attendanceCount
        },
        attendance: {
          id: attendance._id,
          status: attendance.status,
          markedAt: attendance.markedAt,
          verificationMethod: attendance.verificationMethod
        }
      }
    });
  } catch (error: any) {
    console.error('Mark attendance with face error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error marking attendance with face',
      error: error.message
    });
  }
};

export default {
  markAttendanceWithFace
};

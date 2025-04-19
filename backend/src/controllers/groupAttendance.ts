import { Request, Response } from 'express';
import axios from 'axios';
import User from '../models/User';
import Session from '../models/Session';
import Attendance from '../models/Attendance';
import config from '../config';
import { AuthRequest } from '../middleware/auth';

/**
 * @desc    Mark attendance for multiple students in a session using face recognition
 * @route   POST /api/attendance/group
 * @access  Private (Faculty only)
 */
export const markGroupAttendance = async (req: AuthRequest, res: Response): Promise<any> => {
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
        message: 'Image is required' 
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
    
    // Verify that the faculty member is the owner of the session
    if (session.faculty.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to mark attendance for this session'
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
    
    // Call ML API to identify multiple faces
    const response = await axios.post(`${config.mlApi.url}/api/face/identify-multiple`, {
      image,
      encodings
    });
    
    if (!response.data.success) {
      return res.status(400).json({ 
        success: false, 
        message: response.data.message || 'Face identification failed' 
      });
    }
    
    // Get the matched students
    const matchedStudents = response.data.matches || [];
    
    if (matchedStudents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No students identified in the image'
      });
    }
    
    // Mark attendance for all matched students
    const attendanceResults = [];
    
    for (const match of matchedStudents) {
      const { studentId, confidence } = match;
      
      // Find the student in the database
      const student = students.find(s => 
        s.studentId === studentId || 
        s._id.toString() === studentId
      );
      
      if (!student) continue;
      
      // Check if attendance already exists
      let attendance = await Attendance.findOne({
        session: sessionId,
        student: student._id
      });
      
      if (attendance) {
        // Update existing attendance
        attendance.status = 'present';
        attendance.markedBy = 'faculty';
        attendance.faceVerified = true;
        attendance.verificationMethod = 'face';
        attendance.verificationImage = image;
        attendance.verificationConfidence = confidence;
        attendance.verificationDetails = {
          timestamp: new Date(),
          success: true,
          message: 'Face verification successful (group)'
        };
        attendance.markedAt = new Date();
        
        await attendance.save();
      } else {
        // Create new attendance record
        attendance = await Attendance.create({
          session: sessionId,
          student: student._id,
          status: 'present',
          markedBy: 'faculty',
          faceVerified: true,
          verificationMethod: 'face',
          verificationImage: image,
          verificationConfidence: confidence,
          verificationDetails: {
            timestamp: new Date(),
            success: true,
            message: 'Face verification successful (group)'
          }
        });
      }
      
      attendanceResults.push({
        studentId: student.studentId || student._id.toString(),
        name: student.name,
        email: student.email,
        confidence
      });
    }
    
    // Update session attendance count
    const attendanceCount = await Attendance.countDocuments({
      session: sessionId,
      status: 'present'
    });
    
    await Session.findByIdAndUpdate(sessionId, {
      attendanceCount
    });
    
    return res.status(200).json({
      success: true,
      message: `Attendance marked for ${attendanceResults.length} students`,
      data: {
        sessionId,
        attendanceCount,
        students: attendanceResults
      }
    });
    
  } catch (error: any) {
    console.error('Group attendance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error marking group attendance',
      error: error.message
    });
  }
};

export default {
  markGroupAttendance
};

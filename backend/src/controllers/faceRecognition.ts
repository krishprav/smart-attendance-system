import { Request, Response } from 'express';
import axios from 'axios';
import User from '../models/User';
import config from '../config';

// Define extended Request type that includes user property
interface AuthRequest extends Request {
  user?: any;
}

/**
 * @desc    Register a user's face
 * @route   POST /api/face/register
 * @access  Private (Self or Admin)
 */
export const registerFace = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.params.id || req.user._id;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check authorization - only self or admin can register face
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to register face for this user' 
      });
    }
    
    // Get image from request body
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image provided' 
      });
    }
    
    // Call ML API to get face encoding
    const response = await axios.post(`${config.mlApi.url}${config.mlApi.face.register}`, {
      studentId: user.studentId || user._id.toString(),
      image
    });
    
    if (!response.data.success) {
      return res.status(400).json({ 
        success: false, 
        message: response.data.message || 'Face registration failed' 
      });
    }
    
    // Convert the face encoding to an array of numbers if it's not already
    let faceEncoding;
    if (response.data.encoding) {
      // If the ML service returns the encoding directly
      faceEncoding = Array.isArray(response.data.encoding) 
        ? response.data.encoding 
        : JSON.parse(response.data.encoding);
    } else {
      // If the ML service stores the encoding on its side
      // We'll just mark that the face is registered
      faceEncoding = [1]; // Placeholder to indicate face is registered
    }
    
    // Update user with face encoding
    user.faceEncoding = faceEncoding;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Face registered successfully'
    });
  } catch (error: any) {
    console.error('Face registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error registering face',
      error: error.message
    });
  }
};

/**
 * @desc    Get face registration status
 * @route   GET /api/face/status/:id
 * @access  Private (Self or Admin/Faculty)
 */
export const getFaceRegistrationStatus = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.params.id || req.user._id;
    
    // Find the user with face encoding
    const user = await User.findById(userId).select('+faceEncoding');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if face is registered
    const isRegistered = Array.isArray(user.faceEncoding) && user.faceEncoding.length > 0;
    
    return res.status(200).json({
      success: true,
      isRegistered
    });
  } catch (error: any) {
    console.error('Get face registration status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting face registration status',
      error: error.message
    });
  }
};

/**
 * @desc    Verify a face for attendance
 * @route   POST /api/face/verify
 * @access  Private
 */
export const verifyFace = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { image, sessionId } = req.body;
    
    if (!image) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image provided' 
      });
    }
    
    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'No session ID provided' 
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
    
    // Return the matched student info
    return res.status(200).json({
      success: true,
      message: 'Face verified successfully',
      student: {
        id: matchedStudent._id,
        name: matchedStudent.name,
        studentId: matchedStudent.studentId,
        email: matchedStudent.email
      },
      confidence: response.data.confidence || 'high'
    });
  } catch (error: any) {
    console.error('Face verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying face',
      error: error.message
    });
  }
};

export default {
  registerFace,
  getFaceRegistrationStatus,
  verifyFace
};

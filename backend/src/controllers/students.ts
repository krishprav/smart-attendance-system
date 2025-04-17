import { Request, Response } from 'express';
import User from '../models/User';

// Define extended Request type that includes user property
interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin/Faculty only)
export const getStudents = async (_req: Request, res: Response): Promise<any> => {
  try {
    const students = await User.find({ role: 'student' });
    
    res.status(200).json({
      success: true,
      count: students.length,
      data: students.map(student => ({
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        createdAt: student.createdAt
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private (Admin/Faculty/Self)
export const getStudent = async (req: Request, res: Response): Promise<any> => {
  try {
    const student = await User.findOne({ 
      _id: req.params.id,
      role: 'student'
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        createdAt: student.createdAt
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

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin/Self)
export const updateStudent = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, email } = req.body;
    
    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      { name, email },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        createdAt: student.createdAt
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

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin only)
export const deleteStudent = async (req: Request, res: Response): Promise<any> => {
  try {
    const student = await User.findOneAndDelete({ 
      _id: req.params.id,
      role: 'student'
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Register face
// @route   POST /api/students/:id/face
// @access  Private (Self or Admin)
import axios from 'axios';

export const registerFace = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    // Only self or admin can register face
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    // Expect image in req.body.image (base64 or URL)
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }
    // Call ML API Gateway to get face encoding
    const ML_GATEWAY_URL = process.env.ML_GATEWAY_URL || 'http://localhost:8080';
    interface FaceRegisterResponse {
      encoding?: string;
    }
    const response = await axios.post<FaceRegisterResponse>(`${ML_GATEWAY_URL}/face/register`, { image });
    const { encoding } = response.data;
    if (!encoding) {
      return res.status(400).json({ success: false, message: 'Face encoding failed' });
    }
    user.faceEncoding = encoding;
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Face registered successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Face registration failed',
      error: err.message
    });
  }
};

// @desc    Get face registration status
// @route   GET /api/students/:id/face/status
// @access  Private (Self or Admin/Faculty)
export const getFaceRegistrationStatus = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('+faceEncoding');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const registered = Array.isArray(user.faceEncoding) && user.faceEncoding.length > 0;
    res.status(200).json({
      success: true,
      registered,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};
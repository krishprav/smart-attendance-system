import { Request, Response } from 'express';
import axios from 'axios';
import User from '../models/User';
import config from '../config';
import { AuthRequest } from '../middleware/auth';

/**
 * @desc    Register a user's face
 * @route   POST /api/face/register/:userId
 * @access  Private (Self or Faculty)
 */
export const registerFace = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image is required' 
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if the request is from the user themselves or a faculty member
    if (req.user.id !== userId && req.user.role !== 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to register a face for this user'
      });
    }
    
    // Call ML API to analyze the face
    const analyzeResponse = await axios.post(`${config.mlApi.url}/api/face/analyze`, {
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
    
    // Call ML API to encode the face
    const encodeResponse = await axios.post(`${config.mlApi.url}/api/face/encode`, {
      image
    });
    
    if (!encodeResponse.data.success) {
      return res.status(400).json({ 
        success: false, 
        message: encodeResponse.data.message || 'Face encoding failed' 
      });
    }
    
    // Update user with face encoding
    user.faceEncoding = encodeResponse.data.encoding;
    user.faceRegistered = true;
    user.faceRegisteredAt = new Date();
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Face registered successfully',
      data: {
        userId: user._id,
        faceRegistered: true,
        faceRegisteredAt: user.faceRegisteredAt
      }
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

export default {
  registerFace
};

import { Request, Response } from 'express';
import { userService, attendanceService, sessionService } from '../services/prismaService';
import axios from 'axios';
import config from '../config';
import { logger } from '../utils/logger';

// Define interface for request with user
interface AuthRequest extends Request {
  user: any;
}

// Controller for face-related operations
export const faceController = {
  // Register a user's face
  async registerFace(req: AuthRequest, res: Response) {
    try {
      const userId = req.params.userId;
      const { faceImage } = req.body;

      if (!faceImage) {
        return res.status(400).json({
          success: false,
          message: 'Face image is required',
        });
      }

      // Get user
      const user = await userService.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Call ML API to extract face encoding
      try {
        // First, analyze the face to ensure it's a good quality image
        const analyzeResponse = await axios.post(`${config.mlApi.url}${config.mlApi.face.analyze}`, {
          image: faceImage
        });

        if (!analyzeResponse.data.success) {
          return res.status(400).json({
            success: false,
            message: analyzeResponse.data.message || 'Face analysis failed',
          });
        }

        if (analyzeResponse.data.faceCount === 0) {
          return res.status(400).json({
            success: false,
            message: 'No face detected in the image',
          });
        }

        if (analyzeResponse.data.faceCount > 1) {
          return res.status(400).json({
            success: false,
            message: 'Multiple faces detected in the image. Please provide an image with only one face.',
          });
        }

        // Extract face encoding
        const response = await axios.post(`${config.mlApi.url}${config.mlApi.face.register}`, {
          studentId: user.studentId || user.id,
          image: faceImage
        });

        const { encoding } = response.data;

        if (!encoding) {
          return res.status(400).json({
            success: false,
            message: 'Failed to extract face encoding',
          });
        }

        // Save face encoding to database
        const faceEncoding = Array.isArray(encoding) ? encoding : JSON.parse(encoding);
        const updatedUser = await userService.registerFace(userId, faceEncoding);

        return res.status(200).json({
          success: true,
          data: {
            user: updatedUser,
            message: 'Face registered successfully',
          },
        });
      } catch (error) {
        logger.error('ML API Error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to process face image',
        });
      }
    } catch (error) {
      logger.error('Register Face Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  },

  // Get face data for a user
  async getFaceData(req: AuthRequest, res: Response) {
    try {
      const userId = req.params.userId;

      // Get user with face data
      const user = await userService.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          faceRegistered: user.faceRegistered,
          faceRegisteredAt: user.faceRegisteredAt,
        },
      });
    } catch (error) {
      logger.error('Get Face Data Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  },

  // Mark attendance using facial recognition
  async markAttendance(req: Request, res: Response) {
    try {
      const { sessionId, classImage } = req.body;

      if (!sessionId || !classImage) {
        return res.status(400).json({
          success: false,
          message: 'Session ID and class image are required',
        });
      }

      // Get session
      const session = await sessionService.findSessionById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }

      // Get all users with registered faces
      const users = await userService.getAllUsersWithFaces();
      if (users.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No users with registered faces found',
        });
      }

      // Extract face encodings and user IDs
      const faceEncodings = users.map(user => ({
        userId: user.id,
        studentId: user.studentId,
        faceEncoding: user.faceEncoding,
      }));

      // Call ML API to recognize faces in the class image
      try {
        const response = await axios.post(`${config.mlApi.url}${config.mlApi.face.verify}`, {
          image: classImage,
          encodings: faceEncodings,
        });

        const { recognizedUsers } = response.data;

        if (!recognizedUsers || recognizedUsers.length === 0) {
          return res.status(200).json({
            success: true,
            message: 'No faces recognized in the image',
            data: {
              attendanceCount: 0,
              recognizedUsers: [],
            },
          });
        }

        // Mark attendance for recognized users
        const attendanceRecords = await Promise.all(
          recognizedUsers.map(async (userId: string) => {
            // Determine attendance status (present, late, etc.)
            const currentTime = new Date();
            const sessionStartTime = new Date(session.startTime);
            
            let status: 'present' | 'late' = 'present';
            
            // If more than 10 minutes late, mark as 'late'
            if (currentTime.getTime() - sessionStartTime.getTime() > 10 * 60 * 1000) {
              status = 'late';
            }
            
            // Mark attendance
            return attendanceService.markAttendance(sessionId, userId, status);
          })
        );

        return res.status(200).json({
          success: true,
          message: 'Attendance marked successfully',
          data: {
            attendanceCount: attendanceRecords.length,
            recognizedUsers,
          },
        });
      } catch (error) {
        logger.error('ML API Error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to process class image',
        });
      }
    } catch (error) {
      logger.error('Mark Attendance Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  },

  // Get attendance records by session
  async getAttendanceBySession(req: Request, res: Response) {
    try {
      const sessionId = req.params.sessionId;

      // Get session
      const session = await sessionService.findSessionById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }

      // Get attendance records
      const attendanceRecords = await attendanceService.getAttendanceBySession(sessionId);

      return res.status(200).json({
        success: true,
        data: {
          session,
          attendanceRecords,
        },
      });
    } catch (error) {
      logger.error('Get Attendance Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  },

  // Remove face registration for a user
  async removeFaceRegistration(req: AuthRequest, res: Response) {
    try {
      const userId = req.params.userId;

      // Get user
      const user = await userService.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Update user to remove face data
      const updatedUser = await userService.updateUser(userId, {
        vector_encoding: null as any, // Type workaround for Prisma
        faceEncoding: [], 
        faceRegistered: false,
        faceRegisteredAt: null,
      });

      return res.status(200).json({
        success: true,
        message: 'Face registration removed successfully',
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      logger.error('Remove Face Registration Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
};

export default faceController;
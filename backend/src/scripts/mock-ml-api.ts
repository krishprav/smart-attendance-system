import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.ML_API_PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// In-memory storage for face encodings
const faceEncodings: Record<string, number[]> = {};

// Routes
app.get('/', (_req, res) => {
  res.json({ message: 'Mock ML API is running' });
});

// Face registration endpoint
app.post('/api/face/register', (req, res) => {
  try {
    const { studentId, image } = req.body;
    
    if (!studentId || !image) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and image are required'
      });
    }
    
    // Generate a mock face encoding (128 random values between -1 and 1)
    const encoding = Array.from({ length: 128 }, () => Math.random() * 2 - 1);
    
    // Store the encoding
    faceEncodings[studentId] = encoding;
    
    console.log(`Face registered for student ${studentId}`);
    
    return res.json({
      success: true,
      message: 'Face registered successfully',
      encoding
    });
  } catch (error: any) {
    console.error('Face registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error registering face',
      error: error.message
    });
  }
});

// Face verification endpoint
app.post('/api/face/verify', (req, res) => {
  try {
    const { image, encodings } = req.body;
    
    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }
    
    if (!encodings || !Array.isArray(encodings) || encodings.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No face encodings provided'
      });
    }
    
    // Randomly select a student ID from the provided encodings
    const randomIndex = Math.floor(Math.random() * encodings.length);
    const matchedStudentId = encodings[randomIndex].studentId;
    
    console.log(`Face verified for student ${matchedStudentId}`);
    
    return res.json({
      success: true,
      message: 'Face verified successfully',
      studentId: matchedStudentId,
      confidence: 'high'
    });
  } catch (error: any) {
    console.error('Face verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying face',
      error: error.message
    });
  }
});

// Face analysis endpoint
app.post('/api/face/analyze', (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }
    
    // Generate mock analysis results
    const analysis = {
      attention: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
      emotion: ['neutral', 'happy', 'sad', 'angry', 'surprised'][Math.floor(Math.random() * 5)],
      engagement: Math.random() * 0.3 + 0.7 // 0.7 to 1.0
    };
    
    return res.json({
      success: true,
      analysis
    });
  } catch (error: any) {
    console.error('Face analysis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error analyzing face',
      error: error.message
    });
  }
});

// Object detection endpoints
app.post('/api/object-detection/idcard', (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }
    
    // Generate mock detection results
    const isDetected = Math.random() > 0.2; // 80% chance of detection
    
    return res.json({
      success: true,
      isDetected,
      confidence: isDetected ? Math.random() * 0.3 + 0.7 : 0 // 0.7 to 1.0 if detected
    });
  } catch (error: any) {
    console.error('ID card detection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error detecting ID card',
      error: error.message
    });
  }
});

app.post('/api/object-detection/phone', (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }
    
    // Generate mock detection results
    const isDetected = Math.random() > 0.7; // 30% chance of detection
    
    return res.json({
      success: true,
      isDetected,
      confidence: isDetected ? Math.random() * 0.3 + 0.7 : 0 // 0.7 to 1.0 if detected
    });
  } catch (error: any) {
    console.error('Phone detection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error detecting phone',
      error: error.message
    });
  }
});

// Sentiment analysis endpoint
app.post('/api/sentiment/analyze', (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }
    
    // Generate mock sentiment results
    const sentiment = {
      positive: Math.random(),
      negative: Math.random(),
      neutral: Math.random()
    };
    
    // Normalize to sum to 1
    const sum = sentiment.positive + sentiment.negative + sentiment.neutral;
    sentiment.positive /= sum;
    sentiment.negative /= sum;
    sentiment.neutral /= sum;
    
    return res.json({
      success: true,
      sentiment
    });
  } catch (error: any) {
    console.error('Sentiment analysis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error analyzing sentiment',
      error: error.message
    });
  }
});

// Combined analysis endpoint
app.post('/api/analyze/all', (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }
    
    // Generate mock analysis results
    const analysis = {
      face: {
        attention: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
        emotion: ['neutral', 'happy', 'sad', 'angry', 'surprised'][Math.floor(Math.random() * 5)],
        engagement: Math.random() * 0.3 + 0.7 // 0.7 to 1.0
      },
      objects: {
        idcard: {
          isDetected: Math.random() > 0.2, // 80% chance of detection
          confidence: Math.random() * 0.3 + 0.7 // 0.7 to 1.0
        },
        phone: {
          isDetected: Math.random() > 0.7, // 30% chance of detection
          confidence: Math.random() * 0.3 + 0.7 // 0.7 to 1.0
        }
      },
      sentiment: {
        positive: 0.6,
        negative: 0.1,
        neutral: 0.3
      }
    };
    
    return res.json({
      success: true,
      analysis
    });
  } catch (error: any) {
    console.error('Combined analysis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error performing combined analysis',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock ML API server running on port ${PORT}`);
  console.log(`API Health Check: http://localhost:${PORT}/`);
  console.log(`Face Registration: http://localhost:${PORT}/api/face/register`);
  console.log(`Face Verification: http://localhost:${PORT}/api/face/verify`);
});

export default app;

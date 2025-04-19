import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { io, Socket } from 'socket.io-client';

interface AttendanceMarkerProps {
  sessionId: string;
  courseId: string;
  onAttendanceMarked?: (success: boolean) => void;
  onCancel?: () => void;
}

const AttendanceMarker: React.FC<AttendanceMarkerProps> = ({
  sessionId,
  courseId,
  onAttendanceMarked,
  onCancel
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [attendanceStatus, setAttendanceStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [socketConnected, setSocketConnected] = useState(false);
  
  const webcamRef = useRef<Webcam>(null);
  const socketRef = useRef<Socket | null>(null);
  const { user, token } = useAuth();

  // Initialize WebSocket connection
  useEffect(() => {
    if (!token) return;

    // Connect to WebSocket server
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: {
        token
      }
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      setSocketConnected(true);
      
      // Join the session room
      socket.emit('join_session', { sessionId });
    });

    socket.on('connection_success', (data) => {
      console.log('Connection success:', data);
    });

    socket.on('session_joined', (data) => {
      console.log('Joined session:', data);
    });

    socket.on('attendance_update', (data) => {
      console.log('Attendance update:', data);
      
      // If this update is for the current user
      if (user && data.student && data.student.id === user.id) {
        setAttendanceStatus('success');
        setMessage(`Your attendance has been marked as ${data.status || 'present'}`);
        
        if (onAttendanceMarked) {
          onAttendanceMarked(true);
        }
      }
    });

    socket.on('session_ended', () => {
      setError('This session has ended.');
      setAttendanceStatus('error');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });

    socketRef.current = socket;

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, sessionId, user, onAttendanceMarked]);

  // Check if attendance is already marked
  useEffect(() => {
    const checkAttendance = async () => {
      if (!sessionId || !user) return;
      
      try {
        setIsProcessing(true);
        const response = await api.get(`/attendance/session/${sessionId}`);
        
        // Check if user's attendance is already marked
        const attendanceRecords = response.data.data.attendance || [];
        const userAttendance = attendanceRecords.find(
          (record: any) => record.student._id === user.id
        );
        
        if (userAttendance && userAttendance.status === 'present') {
          setAttendanceStatus('success');
          setMessage('Your attendance has already been marked for this session.');
          
          if (onAttendanceMarked) {
            onAttendanceMarked(true);
          }
        }
      } catch (error) {
        console.error('Error checking attendance status:', error);
      } finally {
        setIsProcessing(false);
      }
    };
    
    checkAttendance();
  }, [sessionId, user, onAttendanceMarked]);

  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  const switchCamera = () => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
  };

  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
      } else {
        setError('Failed to capture image. Please try again.');
      }
    } else {
      setError('Camera not available. Please check your camera settings.');
    }
  }, [webcamRef]);

  const resetCapture = () => {
    setCapturedImage(null);
    setError(null);
    setMessage(null);
  };

  const markAttendance = async () => {
    if (!capturedImage) {
      setError('No image captured. Please take a photo first.');
      return;
    }
    
    if (!user) {
      setError('User not logged in. Please log in first.');
      return;
    }
    
    if (!sessionId) {
      setError('Session ID is missing. Please try again.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setMessage(null);
    setAttendanceStatus('pending');
    
    try {
      const response = await api.post('/attendance/face', {
        sessionId,
        image: capturedImage,
      });
      
      if (response.data.success) {
        setAttendanceStatus('success');
        setMessage('Attendance marked successfully!');
        
        // Call the completion callback
        if (onAttendanceMarked) {
          onAttendanceMarked(true);
        }
      } else {
        setAttendanceStatus('error');
        setError(response.data.message || 'Failed to mark attendance. Please try again.');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      setAttendanceStatus('error');
      
      // @ts-ignore
      const errorMessage = error.response?.data?.message || 'Failed to mark attendance. Please try again.';
      setError(errorMessage);
      
      if (onAttendanceMarked) {
        onAttendanceMarked(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const videoConstraints = {
    width: 720,
    height: 480,
    facingMode: facingMode,
  };

  if (attendanceStatus === 'success' && message) {
    return (
      <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Attendance Confirmed</h2>
        <p className="text-gray-600 text-center mb-6">{message}</p>
        <div className="flex space-x-4">
          <button
            onClick={() => onAttendanceMarked && onAttendanceMarked(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Mark Attendance</h2>
      <div className="flex items-center mb-4">
        <div className={`w-3 h-3 rounded-full mr-2 ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-sm text-gray-600">
          {socketConnected ? 'Connected to session' : 'Connecting to session...'}
        </span>
      </div>
      
      <p className="text-gray-600 text-center mb-6">
        Position your face in the center of the camera frame and take a photo to mark your attendance for this class.
      </p>
      
      {error && (
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {message && !error && (
        <div className="w-full bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}
      
      <div className="relative w-full max-w-md mb-4">
        {!capturedImage ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMedia={handleCameraReady}
              className="w-full h-auto rounded-lg shadow-sm"
            />
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <button
                onClick={switchCamera}
                className="p-2 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-70 focus:outline-none"
                title="Switch Camera"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-14a2 2 0 10-.001 0H5a1 1 0 01-1-1V1H3a1 1 0 00-1 1v12a5 5 0 0010 0V2a2 2 0 00-2-2h-1zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="relative">
            <img src={capturedImage} alt="Captured" className="w-full h-auto rounded-lg shadow-sm" />
          </div>
        )}
      </div>
      
      <div className="flex space-x-4 mt-4">
        {!capturedImage ? (
          <>
            <button
              onClick={captureImage}
              disabled={!isCameraReady || isProcessing || !socketConnected}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300 ${(!isCameraReady || isProcessing || !socketConnected) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? 'Processing...' : 'Take Photo'}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition duration-300"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={markAttendance}
              disabled={isProcessing || !socketConnected}
              className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300 ${(isProcessing || !socketConnected) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? 'Processing...' : 'Mark Attendance'}
            </button>
            <button
              onClick={resetCapture}
              disabled={isProcessing}
              className={`px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition duration-300 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Retake
            </button>
          </>
        )}
      </div>
      
      <div className="w-full mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800">Course Details</h3>
        <p className="text-sm text-blue-600">Course: {courseId}</p>
        <p className="text-sm text-blue-600">Session ID: {sessionId}</p>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Your face will be matched with your registered face data to verify your identity.</p>
        <p className="mt-1">Please ensure your face is clearly visible and well-lit for accurate recognition.</p>
      </div>
    </div>
  );
};

export default AttendanceMarker;

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface FaceRegistrationProps {
  onRegistrationComplete?: () => void;
  onCancel?: () => void;
}

const FaceRegistration: React.FC<FaceRegistrationProps> = ({
  onRegistrationComplete,
  onCancel
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  
  const webcamRef = useRef<Webcam>(null);
  const { user, setUser } = useAuth();

  // Check if face is already registered
  useEffect(() => {
    const checkFaceRegistration = async () => {
      if (!user) return;
      
      try {
        setIsProcessing(true);
        const response = await api.get(`/face/status/${user.id}`);
        
        if (response.data.isRegistered) {
          setRegistrationStatus('success');
          setMessage('Your face is already registered!');
        }
      } catch (error) {
        console.error('Error checking face registration status:', error);
      } finally {
        setIsProcessing(false);
      }
    };
    
    checkFaceRegistration();
  }, [user]);

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

  const saveImage = async () => {
    if (!capturedImage) {
      setError('No image captured. Please take a photo first.');
      return;
    }
    
    if (!user) {
      setError('User not logged in. Please log in first.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setMessage(null);
    setRegistrationStatus('pending');
    
    try {
      const response = await api.post('/face/register', {
        image: capturedImage,
      });
      
      if (response.data.success) {
        setRegistrationStatus('success');
        setMessage('Face registered successfully!');
        
        // Update user in context
        if (setUser && user) {
          setUser({
            ...user,
            faceRegistered: true,
          });
        }
        
        // Call the completion callback
        if (onRegistrationComplete) {
          onRegistrationComplete();
        }
      } else {
        setRegistrationStatus('error');
        setError(response.data.message || 'Failed to register face. Please try again.');
      }
    } catch (error) {
      console.error('Error registering face:', error);
      setRegistrationStatus('error');
      
      // @ts-ignore
      const errorMessage = error.response?.data?.message || 'Failed to register face. Please try again.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const videoConstraints = {
    width: 720,
    height: 480,
    facingMode: facingMode,
  };

  if (registrationStatus === 'success' && message) {
    return (
      <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Registration Complete</h2>
        <p className="text-gray-600 text-center mb-6">{message}</p>
        <button
          onClick={onRegistrationComplete}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Face Registration</h2>
      <p className="text-gray-600 text-center mb-6">
        Please position your face in the center of the camera frame and take a photo. Make sure your face is clearly visible and well-lit.
      </p>
      
      {error && (
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {message && (
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
              disabled={!isCameraReady || isProcessing}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300 ${(!isCameraReady || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              onClick={saveImage}
              disabled={isProcessing}
              className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? 'Processing...' : 'Save Photo'}
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
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Your face data will be securely stored and will only be used for attendance verification.</p>
        <p className="mt-1">No videos are recorded, only still images are processed for face recognition.</p>
      </div>
    </div>
  );
};

export default FaceRegistration;

'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  onFacesDetected: (count: number) => void;
  isCapturing: boolean;
  onCaptureComplete: () => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ 
  onCapture, 
  onFacesDetected, 
  isCapturing,
  onCaptureComplete
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [captureInterval, setCaptureInterval] = useState<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState(3);

  // Handle camera ready state
  const handleUserMedia = useCallback(() => {
    setIsCameraReady(true);
  }, []);

  // Capture image from webcam
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
        
        // Simulate face detection (in a real app, you would use a face detection library)
        simulateFaceDetection(imageSrc);
      }
    }
  }, [onCapture]);

  // Simulate face detection (in a real app, this would be a real face detection algorithm)
  const simulateFaceDetection = (imageSrc: string) => {
    // Simulate processing time
    setTimeout(() => {
      // Simulate detecting between 10-30 faces
      const detectedFaces = Math.floor(Math.random() * 20) + 10;
      onFacesDetected(detectedFaces);
    }, 500);
  };

  // Start/stop continuous capture
  useEffect(() => {
    if (isCapturing && isCameraReady) {
      // Start countdown
      setCountdown(3);
      const countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            // Start capturing after countdown
            const interval = setInterval(() => {
              capture();
            }, 2000); // Capture every 2 seconds
            setCaptureInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto-stop after 15 seconds
      setTimeout(() => {
        if (captureInterval) {
          clearInterval(captureInterval);
          setCaptureInterval(null);
        }
        onCaptureComplete();
      }, 15000);

      return () => {
        clearInterval(countdownTimer);
        if (captureInterval) {
          clearInterval(captureInterval);
        }
      };
    } else if (!isCapturing && captureInterval) {
      clearInterval(captureInterval);
      setCaptureInterval(null);
    }
  }, [isCapturing, isCameraReady, capture, captureInterval, onCaptureComplete]);

  return (
    <div className="relative">
      <div className="rounded-lg overflow-hidden border-2 border-blue-500 bg-gray-100">
        {countdown > 0 && isCapturing ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
            <div className="text-white text-6xl font-bold animate-pulse">
              {countdown}
            </div>
          </div>
        ) : null}
        
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "user"
          }}
          onUserMedia={handleUserMedia}
          className="w-full h-auto"
        />
        
        {isCapturing && countdown === 0 && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full animate-pulse">
            Recording
          </div>
        )}
      </div>
      
      {!isCameraReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="text-gray-600">
            <svg className="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading camera...
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;

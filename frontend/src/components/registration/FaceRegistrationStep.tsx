'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api';

interface FaceRegistrationStepProps {
  userId: string;
  onComplete: (success: boolean) => void;
  onSkip?: () => void;
}

const FaceRegistrationStep: React.FC<FaceRegistrationStepProps> = ({
  userId,
  onComplete,
  onSkip
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive'
      });
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture image
  const captureImage = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data as base64 string
    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
    return imageData;
  };

  // Check for face in the captured image
  const checkForFace = async (imageData: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post('/api/ml/face/analyze', { image: imageData });
      
      if (response.data.success && response.data.faceCount > 0) {
        setFaceDetected(true);
        return true;
      } else {
        setFaceDetected(false);
        toast({
          title: 'No Face Detected',
          description: 'Please position your face clearly in the frame.',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      console.error('Error analyzing face:', error);
      setFaceDetected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle capture button click
  const handleCapture = async () => {
    const imageData = captureImage();
    if (!imageData) return;
    
    const hasFace = await checkForFace(imageData);
    if (!hasFace) {
      setCapturedImage(null);
    }
  };

  // Register face
  const registerFace = async () => {
    if (!capturedImage) return;
    
    try {
      setIsLoading(true);
      
      const response = await apiClient.post(`/api/face/register/${userId}`, {
        image: capturedImage
      });
      
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Face registered successfully!',
          variant: 'default'
        });
        stopCamera();
        onComplete(true);
      } else {
        toast({
          title: 'Registration Error',
          description: response.data.message || 'Failed to register face. Please try again.',
          variant: 'destructive'
        });
        setCapturedImage(null);
      }
    } catch (error: any) {
      console.error('Error registering face:', error);
      toast({
        title: 'Registration Error',
        description: error.response?.data?.message || 'Failed to register face. Please try again.',
        variant: 'destructive'
      });
      setCapturedImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry capture
  const handleRetry = () => {
    setCapturedImage(null);
    setFaceDetected(false);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Face Registration</h2>
          <p className="text-gray-600 mt-2">
            Register your face for attendance marking
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          {/* Camera view or captured image */}
          <div className="relative w-full max-w-md aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {capturedImage ? (
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />
            )}
            
            {!isCameraActive && !capturedImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500">Camera inactive</p>
              </div>
            )}
            
            {/* Face detection indicator */}
            {faceDetected && capturedImage && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                Face Detected
              </div>
            )}
          </div>
          
          {/* Hidden canvas for capturing */}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            {!isCameraActive && !capturedImage && (
              <Button 
                onClick={startCamera} 
                className="flex-1"
                disabled={isLoading}
              >
                Start Camera
              </Button>
            )}
            
            {isCameraActive && !capturedImage && (
              <>
                <Button 
                  onClick={handleCapture} 
                  className="flex-1"
                  disabled={isLoading}
                >
                  Capture
                </Button>
                <Button 
                  onClick={stopCamera} 
                  variant="outline" 
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </>
            )}
            
            {capturedImage && (
              <>
                <Button 
                  onClick={registerFace} 
                  className="flex-1"
                  disabled={isLoading || !faceDetected}
                >
                  {isLoading ? 'Registering...' : 'Register Face'}
                </Button>
                <Button 
                  onClick={handleRetry} 
                  variant="outline" 
                  className="flex-1"
                  disabled={isLoading}
                >
                  Retry
                </Button>
              </>
            )}
          </div>
          
          {/* Skip option */}
          {onSkip && (
            <Button 
              onClick={onSkip} 
              variant="ghost" 
              className="text-gray-500"
              disabled={isLoading}
            >
              Skip for now (Not recommended)
            </Button>
          )}
          
          <p className="text-sm text-gray-500 text-center mt-4">
            Your face data will be securely stored and used only for attendance purposes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FaceRegistrationStep;

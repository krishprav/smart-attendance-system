import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';

const FaceRegistration: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Check if face is already registered
  useEffect(() => {
    const checkFaceRegistration = async () => {
      try {
        if (!user) return;

        const response = await apiClient.get(`/api/face/status/${user.id}`);
        setIsRegistered(response.data.isRegistered);
      } catch (error) {
        console.error('Error checking face registration status:', error);
      }
    };

    checkFaceRegistration();
  }, [user]);

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
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
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Capture image from camera
  const captureImage = (): string | null => {
    if (!canvasRef.current || !videoRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data as base64 string
    return canvas.toDataURL('image/jpeg');
  };

  // Register face
  const registerFace = async () => {
    try {
      if (!user) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to register your face.',
          variant: 'destructive'
        });
        return;
      }

      setIsLoading(true);

      // Start camera if not active
      if (!isCameraActive) {
        await startCamera();
        return;
      }

      // Capture image
      const image = captureImage();

      if (!image) {
        toast({
          title: 'Capture Error',
          description: 'Failed to capture image. Please try again.',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      // Send image to API
      const response = await apiClient.post(`/api/ml/face/register`, { studentId: user.id, image });

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Face registered successfully!',
          variant: 'default'
        });
        setIsRegistered(true);
        stopCamera();
      } else {
        toast({
          title: 'Registration Error',
          description: response.data.message || 'Failed to register face. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error registering face:', error);
      toast({
        title: 'Registration Error',
        description: error.response?.data?.message || 'Failed to register face. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset registration
  const resetRegistration = async () => {
    try {
      setIsRegistered(false);
      stopCamera();
    } catch (error) {
      console.error('Error resetting registration:', error);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Face Registration</CardTitle>
        <CardDescription>
          Register your face for attendance verification
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {isRegistered ? (
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <svg
                className="w-12 h-12 text-green-500 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-green-800 font-medium">Your face is registered!</p>
              <p className="text-green-600 text-sm mt-1">
                You can now use face recognition for attendance.
              </p>
            </div>
          ) : (
            <>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-500">Camera inactive</p>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="text-sm text-gray-500">
                <p>Please ensure:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Your face is clearly visible</li>
                  <li>Good lighting conditions</li>
                  <li>Look directly at the camera</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        {isRegistered ? (
          <Button
            variant="outline"
            onClick={resetRegistration}
            className="w-full"
          >
            Re-register Face
          </Button>
        ) : (
          <Button
            onClick={registerFace}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isCameraActive ? 'Capture & Register' : 'Start Camera'}
              </>
            ) : (
              isCameraActive ? 'Capture & Register' : 'Start Camera'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default FaceRegistration;

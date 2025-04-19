'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api';

interface GroupAttendanceProps {
  sessionId: string;
  onComplete?: (results: any) => void;
}

const GroupAttendance: React.FC<GroupAttendanceProps> = ({
  sessionId,
  onComplete
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
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

  // Handle capture button click
  const handleCapture = () => {
    captureImage();
  };

  // Mark attendance for the group
  const markGroupAttendance = async () => {
    if (!capturedImage) return;
    
    try {
      setIsLoading(true);
      
      const response = await apiClient.post('/api/attendance/group', {
        sessionId,
        image: capturedImage
      });
      
      if (response.data.success) {
        toast({
          title: 'Success',
          description: `Attendance marked for ${response.data.data.students.length} students!`,
          variant: 'default'
        });
        
        setResults(response.data.data);
        
        if (onComplete) {
          onComplete(response.data.data);
        }
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to mark attendance.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error marking group attendance:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to mark attendance.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Retry capture
  const handleRetry = () => {
    setCapturedImage(null);
    setResults(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Group Attendance</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Camera view or captured image */}
          <div className="relative w-full max-w-2xl aspect-video bg-gray-100 rounded-lg overflow-hidden">
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
            
            {/* Results overlay */}
            {results && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-2 rounded text-sm">
                {results.students.length} students marked present
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
                  Capture Group Photo
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
            
            {capturedImage && !results && (
              <>
                <Button 
                  onClick={markGroupAttendance} 
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Mark Attendance'}
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
            
            {results && (
              <Button 
                onClick={handleRetry} 
                className="flex-1"
              >
                Take Another Photo
              </Button>
            )}
          </div>
          
          {/* Results display */}
          {results && (
            <div className="w-full mt-4">
              <h3 className="text-lg font-semibold mb-2">Attendance Results</h3>
              <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Student ID</th>
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.students.map((student: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{student.studentId}</td>
                        <td className="py-2">{student.name}</td>
                        <td className="py-2">{Math.round(student.confidence * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Total students marked present: {results.students.length}
              </p>
            </div>
          )}
          
          <p className="text-sm text-gray-500 text-center mt-4">
            Take a photo of the class to automatically mark attendance for all visible students.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupAttendance;

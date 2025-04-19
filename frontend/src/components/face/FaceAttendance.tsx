import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api';

interface Session {
  _id: string;
  courseId: string;
  faculty: {
    _id: string;
    name: string;
  };
  startTime: string;
  endTime: string;
  location: string;
  isActive: boolean;
}

const FaceAttendance: React.FC = () => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [attendanceMarked, setAttendanceMarked] = useState<boolean>(false);
  const [attendanceResult, setAttendanceResult] = useState<any>(null);

  // Fetch active sessions
  useEffect(() => {
    const fetchActiveSessions = async () => {
      try {
        const response = await apiClient.get('/api/attendance/sessions/active');
        setSessions(response.data.data || []);
      } catch (error) {
        console.error('Error fetching active sessions:', error);
      }
    };

    fetchActiveSessions();

    // Refresh sessions every 30 seconds
    const interval = setInterval(fetchActiveSessions, 30000);

    return () => clearInterval(interval);
  }, []);

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

  // Mark attendance
  const markAttendance = async () => {
    try {
      if (!selectedSession) {
        toast({
          title: 'Session Required',
          description: 'Please select a session to mark attendance.',
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
      const response = await apiClient.post('/api/attendance/face', {
        sessionId: selectedSession,
        image
      });

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Attendance marked successfully!',
          variant: 'default'
        });
        setAttendanceMarked(true);
        setAttendanceResult(response.data.data);
        stopCamera();
      } else {
        toast({
          title: 'Attendance Error',
          description: response.data.message || 'Failed to mark attendance. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      toast({
        title: 'Attendance Error',
        description: error.response?.data?.message || 'Failed to mark attendance. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset attendance
  const resetAttendance = () => {
    setAttendanceMarked(false);
    setAttendanceResult(null);
    setSelectedSession('');
    stopCamera();
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Face Attendance</CardTitle>
        <CardDescription>
          Mark your attendance using face recognition
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {attendanceMarked ? (
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
              <p className="text-green-800 font-medium">Attendance Marked!</p>

              {attendanceResult && (
                <div className="mt-4 text-left bg-white p-3 rounded-md shadow-sm">
                  <p className="text-sm font-medium">Details:</p>
                  <div className="mt-2 text-xs space-y-1">
                    <p><span className="font-medium">Name:</span> {attendanceResult.student.name}</p>
                    <p><span className="font-medium">Course:</span> {attendanceResult.session.courseId}</p>
                    <p><span className="font-medium">Time:</span> {new Date(attendanceResult.attendance.markedAt).toLocaleTimeString()}</p>
                    <p><span className="font-medium">Status:</span> {attendanceResult.attendance.status}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label htmlFor="session" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Session
                  </label>
                  <Select
                    value={selectedSession}
                    onValueChange={setSelectedSession}
                    disabled={isCameraActive || isLoading}
                  >
                    <SelectTrigger id="session">
                      <SelectValue placeholder="Select a session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.length === 0 ? (
                        <SelectItem value="none" disabled>No active sessions</SelectItem>
                      ) : (
                        sessions.map((session) => (
                          <SelectItem key={session._id} value={session._id}>
                            {session.courseId} - {formatDate(session.startTime)} ({session.location})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

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
              </div>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        {attendanceMarked ? (
          <Button
            variant="outline"
            onClick={resetAttendance}
            className="w-full"
          >
            Mark Another Attendance
          </Button>
        ) : (
          <Button
            onClick={markAttendance}
            disabled={isLoading || (!selectedSession && !isCameraActive)}
            className="w-full"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isCameraActive ? 'Capture & Mark Attendance' : 'Start Camera'}
              </>
            ) : (
              isCameraActive ? 'Capture & Mark Attendance' : 'Start Camera'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default FaceAttendance;

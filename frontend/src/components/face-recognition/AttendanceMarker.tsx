'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import WebcamCapture from '@/components/camera/WebcamCapture';
import { BiUser, BiCheckCircle, BiErrorCircle, BiIdCard, BiMobile, BiHappy } from 'react-icons/bi';
import { FcApproval, FcCancel } from 'react-icons/fc';
import axios from 'axios';

// ML API URL
const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8080';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface SessionProps {
  sessionId: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  startTime: string;
  endTime: string;
}

export default function AttendanceMarker({ sessionInfo }: { sessionInfo: SessionProps }) {
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isMarked, setIsMarked] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [countdown, setCountdown] = useState(0);
  const [showCamera, setShowCamera] = useState(true);
  const [studentId, setStudentId] = useState('STUDENT123'); // Mock student ID
  
  // Check if student already marked attendance
  useEffect(() => {
    const checkAttendanceStatus = async () => {
      try {
        // Mock API call for demo
        // In production, use an actual API call
        // const response = await axios.get(`${API_URL}/api/attendance/sessions/${sessionInfo.sessionId}/status/${studentId}`);
        
        // Check localStorage for demo purposes
        const markedSessions = JSON.parse(localStorage.getItem('markedSessions') || '[]');
        const alreadyMarked = markedSessions.includes(sessionInfo.sessionId);
        
        if (alreadyMarked) {
          setIsMarked(true);
          setShowCamera(false);
          toast.success('You have already marked attendance for this session.');
        }
      } catch (error) {
        console.error('Error checking attendance status:', error);
      }
    };
    
    checkAttendanceStatus();
  }, [sessionInfo.sessionId, studentId]);
  
  // Handle camera capture
  const handleCapture = useCallback((imageSrc: string) => {
    setCapturedImage(imageSrc);
    
    // Auto-submit after capture
    submitAttendance(imageSrc);
  }, []);
  
  // Submit attendance
  const submitAttendance = async (imageSrc: string) => {
    try {
      setIsSubmitting(true);
      toast.loading('Verifying your identity...');
      
      // In production, use actual API call
      // const response = await axios.post(`${ML_API_URL}/api/analyze/all`, {
      //   image: imageSrc,
      //   studentId,
      //   sessionId: sessionInfo.sessionId
      // });
      
      // Mock API call with delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response for demo - 85% success rate
      const success = Math.random() < 0.85;
      
      toast.dismiss();
      
      if (success) {
        // Mock analysis results
        const mockResults = {
          face: {
            success: true,
            studentId: studentId,
            confidence: 'high',
            message: 'Face verification successful'
          },
          idCard: {
            idCardVisible: Math.random() < 0.7, // 70% chance ID is visible
            confidence: 0.82,
            message: 'ID card detection completed'
          },
          phone: {
            phoneDetected: Math.random() < 0.3, // 30% chance phone is detected
            confidence: 0.78,
            message: 'Phone detection completed'
          },
          sentiment: {
            success: true,
            results: [{
              faceId: 0,
              engagement: parseFloat((0.65 + Math.random() * 0.3).toFixed(2)),
              attention: parseFloat((0.7 + Math.random() * 0.3).toFixed(2)),
              emotions: {
                primary_emotion: ['happy', 'neutral', 'surprised'][Math.floor(Math.random() * 3)],
                confidence: parseFloat((0.7 + Math.random() * 0.25).toFixed(2))
              }
            }]
          }
        };
        
        setAnalysisResults(mockResults);
        setIsVerified(true);
        setShowCamera(false);
        
        // Store in localStorage for demo
        const markedSessions = JSON.parse(localStorage.getItem('markedSessions') || '[]');
        localStorage.setItem('markedSessions', JSON.stringify([...markedSessions, sessionInfo.sessionId]));
        
        // Start countdown for attendance confirmation
        startCountdown();
        
        toast.success('Identity verified! Marking attendance...');
      } else {
        toast.error('Face verification failed. Please try again with proper lighting and positioning.');
        setCapturedImage('');
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      toast.error('Error processing your attendance. Please try again.');
      setCapturedImage('');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Start countdown for attendance confirmation
  const startCountdown = () => {
    setCountdown(5);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsMarked(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Reset attendance process
  const resetAttendance = () => {
    setCapturedImage('');
    setIsVerified(false);
    setIsMarked(false);
    setAnalysisResults(null);
    setShowCamera(true);
    
    // Remove from localStorage for demo
    const markedSessions = JSON.parse(localStorage.getItem('markedSessions') || '[]');
    localStorage.setItem(
      'markedSessions', 
      JSON.stringify(markedSessions.filter((id: string) => id !== sessionInfo.sessionId))
    );
  };
  
  if (isMarked) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center text-center p-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <BiCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Attendance Marked Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your attendance has been recorded for {sessionInfo.courseName} ({sessionInfo.courseCode}).
          </p>
          
          {analysisResults && (
            <div className="w-full max-w-lg bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">Compliance Report</h3>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="flex justify-center mb-2">
                    {analysisResults.idCard.idCardVisible ? 
                      <FcApproval className="text-3xl" /> : 
                      <FcCancel className="text-3xl" />}
                  </div>
                  <p className="text-sm font-medium">ID Card</p>
                  <p className="text-xs text-gray-500">
                    {analysisResults.idCard.idCardVisible ? 'Visible' : 'Not Visible'}
                  </p>
                </div>
                
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="flex justify-center mb-2">
                    {!analysisResults.phone.phoneDetected ? 
                      <FcApproval className="text-3xl" /> : 
                      <FcCancel className="text-3xl" />}
                  </div>
                  <p className="text-sm font-medium">Phone Usage</p>
                  <p className="text-xs text-gray-500">
                    {analysisResults.phone.phoneDetected ? 'Detected' : 'Not Detected'}
                  </p>
                </div>
                
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="flex justify-center mb-2">
                    <BiHappy className={`text-3xl ${
                      analysisResults.sentiment.results[0].engagement > 0.7 ? 'text-green-500' :
                      analysisResults.sentiment.results[0].engagement > 0.4 ? 'text-yellow-500' :
                      'text-red-500'
                    }`} />
                  </div>
                  <p className="text-sm font-medium">Engagement</p>
                  <p className="text-xs text-gray-500">
                    {Math.round(analysisResults.sentiment.results[0].engagement * 100)}% 
                    ({analysisResults.sentiment.results[0].engagement > 0.7 ? 'Good' :
                      analysisResults.sentiment.results[0].engagement > 0.4 ? 'Average' :
                      'Low'})
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              onClick={resetAttendance}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (isVerified && countdown > 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center text-center p-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <div className="text-3xl font-bold text-blue-500">{countdown}</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Attendance</h2>
          <p className="text-gray-600">
            Submitting your attendance. Please wait...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              Session: <span className="font-medium">{sessionInfo.courseName} ({sessionInfo.courseCode})</span>
              <br />
              Instructor: <span className="font-medium">{sessionInfo.instructor}</span>
              <br />
              Time: <span className="font-medium">{sessionInfo.startTime} - {sessionInfo.endTime}</span>
            </p>
          </div>
        </div>
      </div>
      
      {showCamera && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">
            Please look directly at the camera and ensure your face is clearly visible.
            Make sure your ID card is visible and displayed prominently.
          </p>
          
          <div className="border rounded-lg overflow-hidden">
            <WebcamCapture
              onCapture={handleCapture}
              width={640}
              height={480}
              facingMode="user"
              btnClassName="bg-blue-500 hover:bg-blue-600"
            />
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-center">
        {isSubmitting && (
          <div className="flex items-center text-blue-700 gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing your attendance...</span>
          </div>
        )}
      </div>
    </div>
  );
}

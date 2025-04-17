'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import WebcamCapture from '@/components/camera/WebcamCapture';

// Fetch active sessions from backend API
const fetchActiveSessions = async () => {
  const res = await fetch('/api/active-sessions');
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return await res.json();
};

// Simple notification function instead of toast
const notify = (message: string, type: 'success' | 'error' | 'info') => {
  console.log(`[${type.toUpperCase()}]: ${message}`);
  if (type === 'error') {
    alert(`Error: ${message}`);
  } else if (type === 'success') {
    alert(`Success: ${message}`);
  }
};

export default function AttendancePage() {
  const router = useRouter();
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFaceRegistered, setIsFaceRegistered] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [attendanceResults, setAttendanceResults] = useState<any>(null);
  
  useEffect(() => {
    setLoading(true);
    fetchActiveSessions()
      .then(data => {
        setActiveSessions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Check if user has registered their face
    const checkFaceRegistration = async () => {
      try {
        setLoading(true);
        
        // For demo, check localStorage
        const faceRegistered = localStorage.getItem('faceRegistered') === 'true';
        setIsFaceRegistered(faceRegistered);
        
        // If session ID is in marked sessions, set as marked
        const markedSessions = JSON.parse(localStorage.getItem('markedSessions') || '[]');
        if (selectedSession && markedSessions.includes(selectedSession)) {
          setAttendanceMarked(true);
        }
        
      } catch (error) {
        console.error('Error checking face registration status:', error);
        notify('Failed to load data. Please try refreshing the page.', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    checkFaceRegistration();
  }, [selectedSession]);
  
  const handleSessionSelect = (sessionId: string) => {
    setSelectedSession(sessionId);
    setCapturedImage(null);
    setIsCapturing(false);
    setAttendanceMarked(false);
    setAttendanceResults(null);
    
    // Check if already marked
    const markedSessions = JSON.parse(localStorage.getItem('markedSessions') || '[]');
    if (markedSessions.includes(sessionId)) {
      setAttendanceMarked(true);
      notify('You have already marked attendance for this session', 'info');
    }
  };
  
  const handleCapture = useCallback((imageSrc: string) => {
    setCapturedImage(imageSrc);
    setIsCapturing(false);
  }, []);
  
  const startCapture = () => {
    setIsCapturing(true);
    setCapturedImage(null);
  };
  
  const submitAttendance = async () => {
    if (!capturedImage || !selectedSession) return;
    
    try {
      setIsSubmitting(true);
      notify('Processing your attendance...', 'info');
      
      // Mock API call with delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 90% success rate for demo
      const success = Math.random() < 0.9;
      
      if (success) {
        // Generate mock results
        const results = {
          success: true,
          studentId: 'STUDENT123',
          confidence: 'high',
          idCardVisible: Math.random() < 0.7,
          phoneDetected: Math.random() < 0.3,
          engagement: parseFloat((0.6 + Math.random() * 0.3).toFixed(2)),
          emotion: ['happy', 'neutral', 'surprised'][Math.floor(Math.random() * 3)]
        };
        
        setAttendanceResults(results);
        setAttendanceMarked(true);
        
        // Save to localStorage for demo
        const markedSessions = JSON.parse(localStorage.getItem('markedSessions') || '[]');
        localStorage.setItem('markedSessions', JSON.stringify([...markedSessions, selectedSession]));
        
        notify('Attendance marked successfully!', 'success');
      } else {
        notify('Failed to verify your identity. Please try again.', 'error');
        setCapturedImage(null);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      notify('Error processing your attendance. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetAttendance = () => {
    // Remove from marked sessions in localStorage
    if (selectedSession) {
      const markedSessions = JSON.parse(localStorage.getItem('markedSessions') || '[]');
      localStorage.setItem(
        'markedSessions', 
        JSON.stringify(markedSessions.filter((id: string) => id !== selectedSession))
      );
    }
    
    setCapturedImage(null);
    setIsCapturing(false);
    setAttendanceMarked(false);
    setAttendanceResults(null);
  };
  
  const selectedSessionInfo = activeSessions.find(s => s.sessionId === selectedSession);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isFaceRegistered) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Face Registration Required</h2>
          <p className="text-gray-600 mb-6">
            You need to register your face before you can mark attendance.
            Face registration is a one-time process that enables the system to recognize you.
          </p>
          <button
            onClick={() => router.push('/student/face-registration')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Register Your Face
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-blue-900 mb-8 drop-shadow">Attendance</h1>
      
      {selectedSession ? (
        <div>
          <button
            onClick={() => setSelectedSession(null)}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Active Sessions
          </button>
          
          {selectedSessionInfo && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">{selectedSessionInfo.courseName}</h2>
              <div className="grid gap-2 grid-cols-1 md:grid-cols-2 mb-6">
                <div className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-700">Time</p>
                    <p className="text-sm text-gray-500">{selectedSessionInfo.startTime} - {selectedSessionInfo.endTime}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-700">Location</p>
                    <p className="text-sm text-gray-500">{selectedSessionInfo.location}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-700">Instructor</p>
                    <p className="text-sm text-gray-500">{selectedSessionInfo.instructor}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-700">Course Code</p>
                    <p className="text-sm text-gray-500">{selectedSessionInfo.courseCode}</p>
                  </div>
                </div>
              </div>
              
              {attendanceMarked ? (
                <div className="bg-green-50 rounded-lg p-4 flex items-center mb-4">
                  <svg className="h-10 w-10 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-medium text-green-800">Attendance Marked Successfully</h3>
                    <p className="text-green-700">Your attendance has been recorded for this session.</p>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  {isCapturing ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">Position your face clearly in the camera and ensure your ID card is visible</p>
                      <WebcamCapture 
                        onCapture={handleCapture}
                        width={640}
                        height={480}
                        facingMode="user"
                      />
                    </div>
                  ) : capturedImage ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">Review your image before marking attendance</p>
                      <div className="border rounded-lg overflow-hidden mb-4">
                        <img src={capturedImage} alt="Captured" className="w-full max-h-[400px] object-contain" />
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => setCapturedImage(null)}
                          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                          disabled={isSubmitting}
                        >
                          Retake
                        </button>
                        <button
                          onClick={submitAttendance}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </span>
                          ) : 'Mark Attendance'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">Click the button below to start the camera and mark your attendance</p>
                      <button
                        onClick={startCapture}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Start Camera
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {attendanceResults && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b">
                    <h3 className="text-sm font-medium text-gray-700">Attendance Analysis</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded p-3">
                        <h4 className="text-xs text-gray-500 mb-1">ID Card Detection</h4>
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-1 ${attendanceResults.idCardVisible ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-sm font-medium">{attendanceResults.idCardVisible ? 'Visible' : 'Not Visible'}</span>
                        </div>
                      </div>
                      <div className="border rounded p-3">
                        <h4 className="text-xs text-gray-500 mb-1">Phone Detection</h4>
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-1 ${!attendanceResults.phoneDetected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-sm font-medium">{attendanceResults.phoneDetected ? 'Detected' : 'Not Detected'}</span>
                        </div>
                      </div>
                      <div className="border rounded p-3">
                        <h4 className="text-xs text-gray-500 mb-1">Engagement Level</h4>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                attendanceResults.engagement > 0.7 ? 'bg-green-500' :
                                attendanceResults.engagement > 0.4 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${attendanceResults.engagement * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{Math.round(attendanceResults.engagement * 100)}%</span>
                        </div>
                      </div>
                      <div className="border rounded p-3">
                        <h4 className="text-xs text-gray-500 mb-1">Mood</h4>
                        <span className="text-sm font-medium capitalize">{attendanceResults.emotion}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {attendanceMarked && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={resetAttendance}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Reset Attendance (Demo)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>
            
            {activeSessions.length === 0 ? (
              <div className="bg-gray-50 text-center py-8 rounded-lg">
                <svg className="text-gray-400 h-12 w-12 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600">No active sessions at the moment.</p>
                <p className="text-gray-500 text-sm">Check back later for your scheduled classes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 cursor-pointer transition"
                    onClick={() => handleSessionSelect(session.sessionId)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div>
                        <h3 className="font-medium text-lg text-gray-900">{session.courseName}</h3>
                        <div className="text-gray-600 text-sm">{session.courseCode}</div>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {session.startTime} - {session.endTime}
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                        Instructor: {session.instructor}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Location: {session.location}
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <div className="text-sm text-blue-900 font-semibold">
                        Attendance: {session.studentsPresent}/{session.totalStudents} students
                      </div>
                      <button className="px-4 py-1 bg-blue-700 hover:bg-blue-800 text-white text-sm rounded-xl font-bold shadow transition">
                        Mark Attendance
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl border border-blue-200 p-8 mb-8 text-gray-900">
            <h2 className="text-xl font-bold text-blue-900 mb-4">About Attendance</h2>
            <div className="prose prose-blue">
              <p>
                The Smart Attendance System uses facial recognition to mark your presence in class.
                Here's how it works:
              </p>
              
              <ol>
                <li>Select an active session from the list above</li>
                <li>Position your face clearly in the camera</li>
                <li>Make sure your ID card is visible</li>
                <li>The system will automatically verify your identity</li>
                <li>Your attendance will be marked for the selected session</li>
              </ol>
              
              <p className="font-medium">Important Notes:</p>
              <ul>
                <li>Ensure proper lighting when capturing your face</li>
                <li>Your ID card should be clearly visible</li>
                <li>Attendance can only be marked during the scheduled session time</li>
                <li>For any issues, please contact your instructor or the IT department</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

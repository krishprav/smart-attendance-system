'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import Link from 'next/link';
import AttendanceMarker from '@/components/face-recognition/AttendanceMarker';
import FaceRegistration from '@/components/face-recognition/FaceRegistration';

interface Session {
  _id: string;
  courseId: string;
  faculty: {
    _id: string;
    name: string;
    email: string;
  };
  classType: string;
  startTime: string;
  location?: string;
  isActive: boolean;
}

export default function StudentDashboard() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSession, setNewSession] = useState<any | null>(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<Map<string, string>>(new Map());
  const [showFaceRegistration, setShowFaceRegistration] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  
  const socketRef = React.useRef<Socket | null>(null);

  // Check if user is logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    // Check if face registration is needed
    if (user && !user.faceRegistered) {
      setShowFaceRegistration(true);
    }
  }, [user, loading, router]);

  // Connect to WebSocket
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
    });

    socket.on('connection_success', (data) => {
      console.log('Connection success:', data);
    });

    socket.on('session_available', (data) => {
      console.log('New session available:', data);
      setNewSession(data);
      
      // Add to active sessions
      setActiveSessions(prev => {
        // Check if session already exists
        if (prev.some(session => session._id === data.sessionId)) {
          return prev;
        }
        
        // Add new session
        return [...prev, {
          _id: data.sessionId,
          courseId: data.courseId,
          faculty: {
            _id: '',
            name: data.facultyName || 'Faculty',
            email: ''
          },
          classType: 'lecture',
          startTime: data.startTime || new Date().toISOString(),
          isActive: true
        }];
      });
    });

    socket.on('session_ended', (data) => {
      console.log('Session ended:', data);
      
      // Remove from active sessions
      setActiveSessions(prev => 
        prev.filter(session => session._id !== data.sessionId)
      );
      
      // Update attendance status
      setAttendanceStatus(prev => {
        const newStatus = new Map(prev);
        newStatus.set(data.sessionId, 'session_ended');
        return newStatus;
      });
    });

    socket.on('attendance_update', (data) => {
      console.log('Attendance update:', data);
      
      // If this update is for the current user
      if (user && data.student && data.student.id === user.id) {
        setAttendanceStatus(prev => {
          const newStatus = new Map(prev);
          newStatus.set(data.sessionId, data.status || 'present');
          return newStatus;
        });
      }
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
  }, [token, user]);

  // Fetch active sessions
  useEffect(() => {
    const fetchActiveSessions = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        const response = await api.get('/attendance/sessions/active');
        
        if (response.data.success) {
          setActiveSessions(response.data.data);
          
          // Initialize attendance status for each session
          const statusMap = new Map<string, string>();
          for (const session of response.data.data) {
            statusMap.set(session._id, 'unknown');
          }
          setAttendanceStatus(statusMap);
        }
      } catch (error) {
        console.error('Error fetching active sessions:', error);
        // @ts-ignore
        setError(error.response?.data?.message || 'Failed to fetch active sessions');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActiveSessions();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchActiveSessions, 30000);
    
    return () => clearInterval(interval);
  }, [token]);

  // Check attendance status for each session
  useEffect(() => {
    const checkAttendanceStatus = async () => {
      if (!token || !user || activeSessions.length === 0) return;
      
      try {
        // For each active session, check if user has already marked attendance
        for (const session of activeSessions) {
          const response = await api.get(`/attendance/session/${session._id}`);
          
          if (response.data.success) {
            const attendanceRecords = response.data.data.attendance || [];
            const userAttendance = attendanceRecords.find(
              (record: any) => record.student && record.student._id === user.id
            );
            
            if (userAttendance) {
              setAttendanceStatus(prev => {
                const newStatus = new Map(prev);
                newStatus.set(session._id, userAttendance.status);
                return newStatus;
              });
            }
          }
        }
      } catch (error) {
        console.error('Error checking attendance status:', error);
      }
    };
    
    checkAttendanceStatus();
  }, [activeSessions, token, user]);

  const handleAttendanceClick = (session: Session) => {
    setSelectedSession(session);
    setShowAttendanceModal(true);
  };

  const handleAttendanceComplete = (success: boolean) => {
    if (success && selectedSession) {
      // Update attendance status
      setAttendanceStatus(prev => {
        const newStatus = new Map(prev);
        newStatus.set(selectedSession._id, 'present');
        return newStatus;
      });
    }
    
    setShowAttendanceModal(false);
    setSelectedSession(null);
  };

  const handleFaceRegistrationComplete = () => {
    setShowFaceRegistration(false);
  };

  const getAttendanceStatus = (sessionId: string): string => {
    const status = attendanceStatus.get(sessionId);
    switch (status) {
      case 'present':
        return 'Marked Present';
      case 'late':
        return 'Marked Late';
      case 'absent':
        return 'Marked Absent';
      case 'session_ended':
        return 'Session Ended';
      default:
        return 'Not Marked';
    }
  };

  const getAttendanceStatusClass = (sessionId: string): string => {
    const status = attendanceStatus.get(sessionId);
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'late':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'absent':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'session_ended':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-blue-600 bg-blue-100 border-blue-200';
    }
  };

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show face registration if needed
  if (showFaceRegistration) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to Smart Attendance</h1>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">
            Please register your face before continuing. This is required for attendance verification.
          </p>
        </div>
        <FaceRegistration onRegistrationComplete={handleFaceRegistrationComplete} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <div className="mt-2 sm:mt-0 flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {socketConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Show notification for new session */}
      {newSession && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
          <div className="flex">
            <div className="py-1 mr-2">
              <svg className="fill-current h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 110-12 6 6 0 010 12zm-1-5h2v2H9v-2zm0-6h2v4H9V5z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">New class session started!</p>
              <p className="text-sm">
                {newSession.courseId} by {newSession.facultyName} has just started. Mark your attendance now.
              </p>
              <button 
                onClick={() => {
                  const session = activeSessions.find(s => s._id === newSession.sessionId);
                  if (session) {
                    handleAttendanceClick(session);
                  }
                  setNewSession(null);
                }}
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Mark Attendance
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Sessions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Active Class Sessions</h2>
            </div>
            <div className="p-6">
              {activeSessions.length > 0 ? (
                <div className="space-y-4">
                  {activeSessions.map((session) => (
                    <div key={session._id} className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="mb-3 sm:mb-0">
                        <h3 className="font-medium text-lg">{session.courseId}</h3>
                        <p className="text-gray-600 text-sm">
                          Started at {new Date(session.startTime).toLocaleTimeString()}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Faculty: {session.faculty.name}
                        </p>
                        {session.location && (
                          <p className="text-gray-600 text-sm">
                            Location: {session.location}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium mb-2 ${getAttendanceStatusClass(session._id)}`}>
                          {getAttendanceStatus(session._id)}
                        </span>
                        <button
                          onClick={() => handleAttendanceClick(session)}
                          disabled={attendanceStatus.get(session._id) === 'present'}
                          className={`px-4 py-2 rounded ${
                            attendanceStatus.get(session._id) === 'present'
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          } transition duration-300`}
                        >
                          {attendanceStatus.get(session._id) === 'present'
                            ? 'Attendance Marked'
                            : 'Mark Attendance'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No active sessions</h3>
                  <p className="mt-1 text-sm text-gray-500">There are no active class sessions at the moment.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Class Schedule */}
          <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Today's Schedule</h2>
            </div>
            <div className="p-6">
              <Link href="/student/schedule" className="text-blue-600 hover:text-blue-800 flex items-center">
                View full class schedule
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Student Info & Quick Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Student Information</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
                  {user?.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="font-medium">{user?.name || 'Student'}</h3>
                  <p className="text-sm text-gray-600">{user?.email || 'student@iiitmanipur.ac.in'}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Student ID:</span> {user?.studentId || '220101001'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Face Recognition:</span> {user?.faceRegistered ? 'Registered' : 'Not Registered'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Quick Links</h2>
            </div>
            <div className="p-6">
              <ul className="space-y-2">
                <li>
                  <Link href="/student/attendance" className="text-blue-600 hover:text-blue-800 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    My Attendance Report
                  </Link>
                </li>
                <li>
                  <Link href="/student/classes" className="text-blue-600 hover:text-blue-800 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    My Courses
                  </Link>
                </li>
                <li>
                  <Link href="/student/profile" className="text-blue-600 hover:text-blue-800 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Settings
                  </Link>
                </li>
                <li>
                  <Link href="/student/face-registration" className="text-blue-600 hover:text-blue-800 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Update Face Registration
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Attendance Modal */}
      {showAttendanceModal && selectedSession && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setShowAttendanceModal(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <AttendanceMarker
                sessionId={selectedSession._id}
                courseId={selectedSession.courseId}
                onAttendanceMarked={handleAttendanceComplete}
                onCancel={() => setShowAttendanceModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

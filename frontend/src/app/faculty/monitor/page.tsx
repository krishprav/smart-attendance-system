'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import SessionMonitor from '@/components/monitoring/SessionMonitor';

interface Session {
  id: string;
  courseId: string;
  courseName: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  classType: string;
  isActive: boolean;
  attendanceCount: number;
  totalStudents: number;
}

export default function MonitorPage() {
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        // In a real app, we would fetch from the API
        // const response = await fetch('/api/attendance/sessions/active');
        // const data = await response.json();
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockSessions: Session[] = [
          {
            id: '1',
            courseId: 'CS101',
            courseName: 'Introduction to Computer Science',
            startTime: new Date(Date.now() - 45 * 60000).toISOString(), // 45 minutes ago
            endTime: null,
            duration: 90,
            classType: 'lecture',
            isActive: true,
            attendanceCount: 32,
            totalStudents: 45,
          },
          {
            id: '2',
            courseId: 'MATH201',
            courseName: 'Calculus II',
            startTime: new Date(Date.now() - 20 * 60000).toISOString(), // 20 minutes ago
            endTime: null,
            duration: 60,
            classType: 'lecture',
            isActive: true,
            attendanceCount: 28,
            totalStudents: 38,
          },
        ];
        
        setActiveSessions(mockSessions);
        
        // If there's only one session, select it automatically
        if (mockSessions.length === 1) {
          setSelectedSession(mockSessions[0]);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
    
    // Refresh data every minute
    const interval = setInterval(fetchSessions, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Monitor Session</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : activeSessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No Active Sessions</h2>
            <p className="text-gray-600 mb-6">You don't have any active sessions at the moment.</p>
            <a
              href="/faculty/start-session"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Start a New Session
            </a>
          </div>
        ) : (
          <>
            {activeSessions.length > 1 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Active Sessions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeSessions.map(session => (
                    <div
                      key={session.id}
                      className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer border-2 transition-colors ${
                        selectedSession?.id === session.id
                          ? 'border-blue-500'
                          : 'border-transparent hover:border-blue-300'
                      }`}
                      onClick={() => handleSessionSelect(session)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{session.courseName}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{session.courseId}</p>
                      <div className="mt-3 text-sm text-gray-500">
                        <div className="flex justify-between">
                          <span>Started:</span>
                          <span>{new Date(session.startTime).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{session.duration} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Attendance:</span>
                          <span>{session.attendanceCount}/{session.totalStudents}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedSession && (
              <div>
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">{selectedSession.courseName}</h2>
                      <p className="text-gray-600">{selectedSession.courseId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Started: {new Date(selectedSession.startTime).toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Expected End: {new Date(new Date(selectedSession.startTime).getTime() + selectedSession.duration * 60000).toLocaleTimeString()}
                      </p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <a
                      href={`/faculty/analytics?sessionId=${selectedSession.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50 text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Session Analytics
                    </a>
                    <a
                      href={`/faculty/reports?sessionId=${selectedSession.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50 text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Generate Report
                    </a>
                    <button
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md bg-white hover:bg-red-50 text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      End Session
                    </button>
                  </div>
                </div>
                
                <SessionMonitor 
                  sessionId={selectedSession.id} 
                  totalStudents={selectedSession.totalStudents} 
                />
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

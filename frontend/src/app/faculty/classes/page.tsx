'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { courses } from '../../../data/courseData';

// Type definitions
type ClassSession = {
  id: string;
  subject: string;
  code: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  totalStudents: number;
  attendanceCount?: number;
  attendancePercentage?: number;
};

type Class = {
  id: string;
  code: string;
  name: string;
  department: string;
  semester: string;
  totalStudents: number;
  sessions: ClassSession[];
};

export default function FacultyClassesPage() {
  // UI improvement: background gradient
  // (Wrap content below in a gradient div)

  const [activeTab, setActiveTab] = useState<'classes' | 'sessions'>('classes');
  const [sessionFilter, setSessionFilter] = useState<'upcoming' | 'ongoing' | 'past'>('upcoming');
  
  // Use real course data from courseData.ts
  // Map courseData to Class[] structure expected by the UI
  const classes: Class[] = courses.map((course: any, idx: number) => ({
    id: course.code,
    code: course.code,
    name: course.title,
    department: course.program,
    semester: course.semester,
    totalStudents: 0, // You can update this if you have student data
    sessions: [] // No session data in courseData, so leave empty
  }));

  // No loading state needed, data is static

  // Get all sessions across all classes
  const allSessions = classes.flatMap(cls => cls.sessions);
  
  // Filter sessions based on active filter
  const filteredSessions = allSessions.filter(session => {
    if (sessionFilter === 'upcoming') return session.status === 'upcoming';
    if (sessionFilter === 'ongoing') return session.status === 'ongoing';
    return session.status === 'completed';
  });
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-extrabold text-blue-900 mb-8 drop-shadow">My Classes</h1>
          {/* Tab and filter buttons with improved styling */}
          <div className="flex space-x-4 mb-6">
            <button
              className={`px-4 py-2 rounded-lg font-semibold shadow transition border-2 ${activeTab === 'classes' ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`}
              onClick={() => setActiveTab('classes')}
            >
              Classes
            </button>
            
            <button 
              className={`px-4 py-2 rounded-md ${
                activeTab === 'sessions' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab('sessions')}
            >
              Sessions
            </button>
          </div>
        </div>
        
        {activeTab === 'classes' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map((cls) => (
              <div key={cls.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">{cls.name}</h2>
                  <p className="text-gray-600">{cls.code}</p>
                </div>
                
                <div className="px-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-900">Department</p>
                      <p className="font-medium">{cls.department}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-900">Semester</p>
                      <p className="font-medium">{cls.semester}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-900">Students</p>
                      <p className="font-medium">{cls.totalStudents}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-900">Sessions</p>
                      <p className="font-medium">{cls.sessions.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/faculty/classes/${cls.id}/students`}
                        className="text-gray-900 hover:text-indigo-800 font-medium"
                      >
                        View Students
                      </Link>
                      <span className="text-gray-300">|</span>
                      <Link 
                        href={`/faculty/classes/${cls.id}/sessions`}
                        className="text-gray-900 hover:text-indigo-800 font-medium"
                      >
                        View Sessions
                      </Link>
                    </div>
                    
                    <Link
                      href={`/faculty/start-session?classId=${cls.id}`}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow transition font-semibold"
                    >
                      New Session
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Sessions</h2>
              
              <div className="flex space-x-2">
                <button 
                  className={`px-4 py-2 rounded-md text-sm ${
                    sessionFilter === 'upcoming' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  onClick={() => setSessionFilter('upcoming')}
                >
                  Upcoming
                </button>
                
                <button
                  className={`px-4 py-2 rounded-md text-sm ${
                    sessionFilter === 'ongoing' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  onClick={() => setSessionFilter('ongoing')}
                >
                  Ongoing
                </button>
                
                <button 
                  className={`px-4 py-2 rounded-md text-sm ${
                    sessionFilter === 'past' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  onClick={() => setSessionFilter('past')}
                >
                  Past
                </button>
              </div>
            </div>
            
            {filteredSessions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No {sessionFilter} sessions</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {sessionFilter === 'upcoming' 
                    ? 'You don\'t have any upcoming sessions scheduled.' 
                    : sessionFilter === 'ongoing'
                      ? 'You don\'t have any ongoing sessions right now.'
                      : 'You don\'t have any past sessions.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredSessions.map((session) => (
                  <div key={session.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">{session.subject}</h2>
                          <p className="text-gray-600">{session.code}</p>
                        </div>
                        
                        {sessionFilter === 'past' && session.attendancePercentage !== undefined && (
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            session.attendancePercentage >= 90 
                              ? 'bg-green-100 text-green-800' 
                              : session.attendancePercentage >= 75
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {session.attendancePercentage}% Attendance
                          </span>
                        )}
                        
                        {sessionFilter === 'ongoing' && (
                          <Link
                            href={`/faculty/monitor?sessionId=${session.id}`}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow transition font-semibold"
                          >
                            Monitor Session
                          </Link>
                        )}
                        
                        {sessionFilter === 'upcoming' && (
                          <Link
                            href={`/faculty/start-session?sessionId=${session.id}`}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow transition font-semibold"
                          >
                            Start Session
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-900">Students:</span>
                          <span className="ml-2 text-gray-900">{session.totalStudents}</span>
                        </div>
                        
                        <div>
                          <span className="text-gray-900">Date:</span>
                          <span className="ml-2 text-gray-900">{session.date}</span>
                        </div>
                        
                        <div>
                          <span className="text-gray-900">Time:</span>
                          <span className="ml-2 text-gray-900">{`${session.startTime} - ${session.endTime}`}</span>
                        </div>
                        
                        <div>
                          <span className="text-gray-900">Location:</span>
                          <span className="ml-2 text-gray-900">{session.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    {sessionFilter === 'past' && (
                      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
                        <div className="text-sm">
                          <span className="text-gray-900">Attendance:</span>
                          <span className="ml-2 text-gray-900">
                            {session.attendanceCount} / {session.totalStudents} students
                          </span>
                        </div>
                        
                        <Link
                          href={`/faculty/reports/sessions/${session.id}`}
                          className="text-gray-900 hover:text-indigo-800"
                        >
                          View Report
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

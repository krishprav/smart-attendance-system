'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';

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
  const [activeTab, setActiveTab] = useState<'classes' | 'sessions'>('classes');
  const [sessionFilter, setSessionFilter] = useState<'upcoming' | 'ongoing' | 'past'>('upcoming');
  
  // Mock data for classes
  const classes: Class[] = [
    {
      id: 'cls-101',
      code: 'CS101',
      name: 'Introduction to Programming',
      department: 'Computer Science',
      semester: 'Spring 2025',
      totalStudents: 45,
      sessions: [
        {
          id: 'cs101-1',
          subject: 'Introduction to Programming',
          code: 'CS101',
          date: '2025-04-15',
          startTime: '10:00 AM',
          endTime: '11:30 AM',
          location: 'Room 301',
          status: 'upcoming',
          totalStudents: 45,
        },
        {
          id: 'cs101-2',
          subject: 'Introduction to Programming',
          code: 'CS101',
          date: '2025-04-08',
          startTime: '10:00 AM',
          endTime: '11:30 AM',
          location: 'Room 301',
          status: 'completed',
          totalStudents: 45,
          attendanceCount: 40,
          attendancePercentage: 88.9,
        },
      ],
    },
    {
      id: 'cls-201',
      code: 'CS201',
      name: 'Data Structures',
      department: 'Computer Science',
      semester: 'Spring 2025',
      totalStudents: 38,
      sessions: [
        {
          id: 'cs201-1',
          subject: 'Data Structures',
          code: 'CS201',
          date: '2025-04-15',
          startTime: '01:00 PM',
          endTime: '02:30 PM',
          location: 'Room 401',
          status: 'upcoming',
          totalStudents: 38,
        },
        {
          id: 'cs201-2',
          subject: 'Data Structures',
          code: 'CS201',
          date: '2025-04-08',
          startTime: '01:00 PM',
          endTime: '02:30 PM',
          location: 'Room 401',
          status: 'completed',
          totalStudents: 38,
          attendanceCount: 35,
          attendancePercentage: 92.1,
        },
      ],
    },
    {
      id: 'cls-301',
      code: 'CS301',
      name: 'Algorithms',
      department: 'Computer Science',
      semester: 'Spring 2025',
      totalStudents: 32,
      sessions: [
        {
          id: 'cs301-1',
          subject: 'Algorithms',
          code: 'CS301',
          date: '2025-04-16',
          startTime: '09:00 AM',
          endTime: '10:30 AM',
          location: 'Room 201',
          status: 'upcoming',
          totalStudents: 32,
        },
        {
          id: 'cs301-2',
          subject: 'Algorithms',
          code: 'CS301',
          date: '2025-04-09',
          startTime: '09:00 AM',
          endTime: '10:30 AM',
          location: 'Room 201',
          status: 'completed',
          totalStudents: 32,
          attendanceCount: 28,
          attendancePercentage: 87.5,
        },
      ],
    },
    {
      id: 'cls-401',
      code: 'CS401',
      name: 'Database Systems',
      department: 'Computer Science',
      semester: 'Spring 2025',
      totalStudents: 35,
      sessions: [
        {
          id: 'cs401-1',
          subject: 'Database Systems',
          code: 'CS401',
          date: '2025-04-14',
          startTime: '10:00 AM',
          endTime: '11:30 AM',
          location: 'Room 302',
          status: 'ongoing',
          totalStudents: 35,
        },
        {
          id: 'cs401-2',
          subject: 'Database Systems',
          code: 'CS401',
          date: '2025-04-09',
          startTime: '10:00 AM',
          endTime: '11:30 AM',
          location: 'Room 302',
          status: 'completed',
          totalStudents: 35,
          attendanceCount: 31,
          attendancePercentage: 88.6,
        },
      ],
    },
  ];
  
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Classes</h1>
          
          <div className="flex space-x-2">
            <button 
              className={`px-4 py-2 rounded-md ${
                activeTab === 'classes' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
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
              <div key={cls.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">{cls.name}</h2>
                  <p className="text-gray-600">{cls.code}</p>
                </div>
                
                <div className="px-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{cls.department}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Semester</p>
                      <p className="font-medium">{cls.semester}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Students</p>
                      <p className="font-medium">{cls.totalStudents}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Sessions</p>
                      <p className="font-medium">{cls.sessions.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/faculty/classes/${cls.id}/students`}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View Students
                      </Link>
                      <span className="text-gray-300">|</span>
                      <Link 
                        href={`/faculty/classes/${cls.id}/sessions`}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View Sessions
                      </Link>
                    </div>
                    
                    <Link
                      href={`/faculty/start-session?classId=${cls.id}`}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
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
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
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
                  <div key={session.id} className="bg-white rounded-lg shadow-md overflow-hidden">
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
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                          >
                            Monitor Session
                          </Link>
                        )}
                        
                        {sessionFilter === 'upcoming' && (
                          <Link
                            href={`/faculty/start-session?sessionId=${session.id}`}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                          >
                            Start Session
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Students:</span>
                          <span className="ml-2 text-gray-900">{session.totalStudents}</span>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <span className="ml-2 text-gray-900">{session.date}</span>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <span className="ml-2 text-gray-900">{`${session.startTime} - ${session.endTime}`}</span>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <span className="ml-2 text-gray-900">{session.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    {sessionFilter === 'past' && (
                      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
                        <div className="text-sm">
                          <span className="text-gray-500">Attendance:</span>
                          <span className="ml-2 text-gray-900">
                            {session.attendanceCount} / {session.totalStudents} students
                          </span>
                        </div>
                        
                        <Link
                          href={`/faculty/reports/sessions/${session.id}`}
                          className="text-sm text-indigo-600 hover:text-indigo-800"
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

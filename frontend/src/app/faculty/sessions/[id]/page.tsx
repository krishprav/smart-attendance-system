'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import GroupAttendance from '@/components/attendance/GroupAttendance';
import { apiClient } from '@/lib/api';
import { courses } from '@/data/courseData';
import { allStudents } from '@/data/studentData';

interface Student {
  id: string;
  name: string;
  studentId: string;
  status: 'present' | 'absent' | 'late';
  verificationMethod?: string;
  markedAt?: string;
}

interface SessionDetails {
  id: string;
  courseId: string;
  courseName: string;
  faculty: {
    id: string;
    name: string;
  };
  startTime: string;
  endTime: string | null;
  duration: number;
  isActive: boolean;
  location: string;
  attendanceCount: number;
  totalStudents: number;
}

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<SessionDetails | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGroupAttendance, setShowGroupAttendance] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        setLoading(true);

        // Extract course code from session ID (format: courseCode-timestamp)
        const courseCode = sessionId.split('-')[0];

        // Find the course from real data
        const course = courses.find(c => c.code === courseCode);

        if (!course) {
          throw new Error(`Course with code ${courseCode} not found`);
        }

        // Create session with real data
        setSession({
          id: sessionId,
          courseId: course.code,
          courseName: course.title,
          faculty: {
            id: 'FAC001',
            name: course.instructors[0]
          },
          startTime: new Date().toISOString(),
          endTime: null,
          duration: 60,
          isActive: true,
          location: `Room ${100 + Math.floor(Math.random() * 10)}`,
          attendanceCount: 0,
          totalStudents: 30
        });

        // Get random students for this course (in a real app, this would be from the database)
        const randomStudents = allStudents.slice(0, 30);

        // Initialize all students as absent
        setStudents(
          randomStudents.map(student => ({
            id: student.id,
            name: student.name,
            studentId: student.rollNumber,
            status: 'absent' as 'absent'
          }))
        );

      } catch (err: any) {
        setError(err.message || 'Failed to fetch session details');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  const handleEndSession = async () => {
    try {
      // In a real app, this would be an API call
      // await apiClient.put(`/attendance/sessions/${sessionId}/end`);

      // Mock for now
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update session state
      setSession(prev => prev ? { ...prev, isActive: false, endTime: new Date().toISOString() } : null);

      // Redirect to classes page
      // router.push('/faculty/classes');
    } catch (err: any) {
      setError(err.message || 'Failed to end session');
    }
  };

  const handleGroupAttendanceComplete = (results: any) => {
    // Update the students list with newly marked students
    if (results && results.students) {
      const newStudents = [...students];

      results.students.forEach((student: any) => {
        const existingIndex = newStudents.findIndex(s => s.studentId === student.studentId);

        if (existingIndex >= 0) {
          // Update existing student
          newStudents[existingIndex] = {
            ...newStudents[existingIndex],
            status: 'present',
            verificationMethod: 'face (group)',
            markedAt: new Date().toISOString()
          };
        } else {
          // Add new student
          newStudents.push({
            id: student.studentId,
            name: student.name || 'Unknown',
            studentId: student.studentId,
            status: 'present',
            verificationMethod: 'face (group)',
            markedAt: new Date().toISOString()
          });
        }
      });

      setStudents(newStudents);

      // Update attendance count
      if (session) {
        setSession({
          ...session,
          attendanceCount: newStudents.filter(s => s.status === 'present').length
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-3 text-gray-700">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error || 'Session not found'}</p>
          <Link href="/faculty/classes">
            <button type="button" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Back to Classes
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-900 mb-2">{session.courseName}</h1>
            <p className="text-lg text-gray-600">{session.courseId}</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link href="/faculty/classes">
              <button type="button" className="px-5 py-2.5 border border-blue-300 rounded-xl text-blue-700 bg-white hover:bg-blue-50 font-medium transition-colors duration-200 shadow-sm">
                Back to Classes
              </button>
            </Link>
            {session.isActive && (
              <button
                type="button"
                onClick={handleEndSession}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors duration-200 shadow-sm"
              >
                End Session
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-blue-100">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-white">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Session Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="text-gray-700"><span className="font-medium">Started:</span> {new Date(session.startTime).toLocaleString()}</p>
                </div>
                {session.endTime && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="text-gray-700"><span className="font-medium">Ended:</span> {new Date(session.endTime).toLocaleString()}</p>
                  </div>
                )}
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="text-gray-700"><span className="font-medium">Duration:</span> {session.duration} minutes</p>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <p className="text-gray-700"><span className="font-medium">Location:</span> {session.location}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="text-gray-700">
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${
                      session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {session.isActive ? 'Active' : 'Ended'}
                    </span>
                  </p>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <p className="text-gray-700"><span className="font-medium">Attendance:</span> {session.attendanceCount}/{session.totalStudents} students</p>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <div className="flex-grow">
                    <p className="text-gray-700"><span className="font-medium">Attendance Rate:</span> {Math.round((session.attendanceCount / session.totalStudents) * 100)}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div
                        className={`h-2.5 rounded-full ${session.attendanceCount / session.totalStudents > 0.8 ? 'bg-green-600' : session.attendanceCount / session.totalStudents > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.round((session.attendanceCount / session.totalStudents) * 100)}%` }} aria-label="Attendance progress bar"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {session.isActive && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-900">Mark Attendance</h2>
              <button
                type="button"
                onClick={() => setShowGroupAttendance(!showGroupAttendance)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors duration-200 shadow-sm flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                {showGroupAttendance ? 'Hide Group Attendance' : 'Group Attendance'}
              </button>
            </div>

            {showGroupAttendance && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
                <GroupAttendance
                  sessionId={sessionId}
                  onComplete={handleGroupAttendanceComplete}
                />
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Attendance List</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Verification
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-700 font-medium">{student.name.charAt(0)}</span>
                          </div>
                          {student.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          student.status === 'present' ? 'bg-green-100 text-green-800' :
                          student.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.verificationMethod ? (
                          <div className="flex items-center">
                            {student.verificationMethod === 'face' ? (
                              <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            ) : null}
                            {student.verificationMethod}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.markedAt ? new Date(student.markedAt).toLocaleTimeString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {session.isActive && student.status === 'absent' && (
                          <button
                            type="button"
                            onClick={() => handleMarkAttendance(student.id)}
                            className="text-blue-600 hover:text-blue-900 font-medium flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Mark Present
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {students.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No attendance records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

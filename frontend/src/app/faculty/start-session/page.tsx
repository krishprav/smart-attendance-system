'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { courses } from '@/data/courseData';
import Link from 'next/link';
import { facultyAPI } from '@/services/api';

export default function StartSessionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [courseCode, setCourseCode] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [course, setCourse] = useState<any>(null);
  const [attendanceMethod, setAttendanceMethod] = useState('face');
  const [isTakingAttendance, setIsTakingAttendance] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }

    // Set default date and time if not already set
    if (!sessionDate) {
      setSessionDate(new Date().toISOString().split('T')[0]);
    }
    if (!sessionTime) {
      setSessionTime(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    }

    // Get query parameters
    if (searchParams) {
      const code = searchParams.get('courseCode');
      const date = searchParams.get('date');
      const time = searchParams.get('time');

      if (code) setCourseCode(code);
      if (date) setSessionDate(date);
      if (time) setSessionTime(time);

      // Find course details
      if (code) {
        const courseDetails = courses.find(c => c.code === code);
        if (courseDetails) {
          setCourse(courseDetails);
          console.log('Course found:', courseDetails);
        } else {
          console.error('Course not found with code:', code);
          // Try to find a VI semester course as fallback
          const fallbackCourse = courses.find(c => c.semester === 'VI');
          if (fallbackCourse) {
            console.log('Using fallback course:', fallbackCourse);
            setCourse(fallbackCourse);
            setCourseCode(fallbackCourse.code);
          }
        }
      } else {
        // If no course code provided, use a default VI semester course
        const defaultCourse = courses.find(c => c.semester === 'VI');
        if (defaultCourse) {
          console.log('Using default course:', defaultCourse);
          setCourse(defaultCourse);
          setCourseCode(defaultCourse.code);
        }
      }
    }
  }, [user, loading, router, searchParams]);

  const handleStartAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTakingAttendance(true);
    setIsCreatingSession(true);

    try {
      // Create a new session using the API
      const sessionData = {
        courseCode,
        date: sessionDate || new Date().toISOString().split('T')[0],
        startTime: sessionTime || new Date().toLocaleTimeString(),
        endTime: '', // Will be set when the session ends
        location: 'Classroom', // Default location
        sections: course?.sections || ['A', 'B']
      };

      // Generate a unique session ID with course code and timestamp
      let sessionId = `${courseCode}-${Date.now()}`;

      console.log('Creating session with data:', sessionData);

      // Try to call the API, but use a fallback if it fails
      try {
        // Attempt to call the API
        const response = await facultyAPI.createSession(sessionData);
        console.log('API response:', response);

        // If successful, use the session ID from the response
        if (response.data?.data?.id) {
          sessionId = response.data.data.id;
        }
      } catch (apiError) {
        // If the API call fails, log the error but continue with the local session ID
        console.warn('API call failed, using local session ID:', apiError);
        // We'll continue with the locally generated sessionId
      }

      // Store session data in localStorage for persistence
      if (typeof window !== 'undefined') {
        const existingSessions = JSON.parse(localStorage.getItem('facultySessions') || '[]');
        existingSessions.push({
          id: sessionId,
          ...sessionData,
          createdAt: new Date().toISOString(),
          status: 'active'
        });
        localStorage.setItem('facultySessions', JSON.stringify(existingSessions));
      }

      // Redirect to the monitor page with the session ID
      setTimeout(() => {
        router.push(`/faculty/monitor?sessionId=${sessionId}`);
      }, 1500);
    } catch (error) {
      console.error('Error creating session:', error);
      setIsTakingAttendance(false);
      setIsCreatingSession(false);
      // Show error message to user
      alert('Failed to create session. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/faculty/classes" className="text-blue-600 hover:text-blue-800 mr-2">
          &larr; Back to Classes
        </Link>
        <h1 className="text-3xl font-bold">Start Attendance Session</h1>
      </div>

      {course ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{course.code}: {course.title}</h2>
                <p className="text-gray-600">
                  {course.semester} Semester | {course.program || 'CSE'} |
                  Sections: {course.sections ? course.sections.join(', ') : 'A, B'}
                </p>
                <p className="text-gray-600">Instructor: {course.instructors && course.instructors.length > 0 ? course.instructors[0] : 'Faculty'}</p>
              </div>

              <div className="mt-4 md:mt-0 bg-blue-50 px-4 py-2 rounded-md">
                <p className="font-medium">Session Details</p>
                <p>Date: {sessionDate ? new Date(sessionDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                <p>Time: {sessionTime ? sessionTime.replace('-', ' to ') : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Start Attendance Session</h3>

            {isTakingAttendance ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-lg font-medium">Starting attendance session...</p>
                <p className="text-gray-600">This will only take a moment.</p>
              </div>
            ) : (
              <form onSubmit={handleStartAttendance}>
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Attendance Method</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className={`cursor-pointer border rounded-lg p-4 text-center ${
                        attendanceMethod === 'face' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                      onClick={() => setAttendanceMethod('face')}
                    >
                      <div className="font-medium mb-1">Face Recognition</div>
                      <div className="text-sm text-gray-600">Automatic attendance using facial recognition</div>
                    </div>

                    <div
                      className={`cursor-pointer border rounded-lg p-4 text-center ${
                        attendanceMethod === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                      onClick={() => setAttendanceMethod('manual')}
                    >
                      <div className="font-medium mb-1">Manual Marking</div>
                      <div className="text-sm text-gray-600">Manually mark present/absent students</div>
                    </div>

                    <div
                      className={`cursor-pointer border rounded-lg p-4 text-center ${
                        attendanceMethod === 'qr' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                      onClick={() => setAttendanceMethod('qr')}
                    >
                      <div className="font-medium mb-1">QR Code</div>
                      <div className="text-sm text-gray-600">Generate QR code for students to scan</div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Session Settings</label>
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="verifyStudentId"
                        className="mr-2"
                        defaultChecked={true}
                      />
                      <label htmlFor="verifyStudentId" className="text-gray-700">Verify Student ID Cards</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="monitorEngagement"
                        className="mr-2"
                        defaultChecked={true}
                      />
                      <label htmlFor="monitorEngagement" className="text-gray-700">Monitor Class Engagement</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enforceAttendance"
                        className="mr-2"
                        defaultChecked={true}
                      />
                      <label htmlFor="enforceAttendance" className="text-gray-700">Enforce Minimum Attendance Policy (75%)</label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    href="/faculty/classes"
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2 hover:bg-gray-300 transition"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                    disabled={isTakingAttendance || isCreatingSession}
                  >
                    {isTakingAttendance ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isCreatingSession ? 'Creating Session...' : 'Starting Session...'}
                      </>
                    ) : (
                      'Start Attendance Session'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">Course not found or session details missing.</p>
          <Link
            href="/faculty/classes"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Back to Classes
          </Link>
        </div>
      )}
    </div>
  );
}

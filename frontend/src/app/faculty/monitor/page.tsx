'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { courses } from '@/data/courseData';
import { facultyAPI } from '@/services/api';
import { students as realStudents, getStudentsBySection, getStudentsBySemester, Student as StudentData } from '@/data/studentData';
import { getClassesForDayAndSection } from '@/data/timetableData';
import WebcamCapture from '@/components/WebcamCapture';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { recognizeFaces, FaceMatchResult } from '@/services/faceRecognition';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  attendance: 'present' | 'absent' | 'late';
  verificationMethod: 'face' | 'manual' | 'id' | 'none';
  timeMarked: string;
  faceRecognized?: boolean; // Flag to indicate if the student was recognized by face recognition
  faceConfidence?: number; // Confidence score from face recognition
  compliance: {
    idCard: boolean;
    attentive: boolean;
  };
}

export default function SessionMonitorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sessionId, setSessionId] = useState('');
  const [sessionDetails, setSessionDetails] = useState({
    courseCode: '',
    courseTitle: '',
    date: '',
    time: '',
    location: '',
    section: '',
    instructor: ''
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
    percentage: 0
  });

  // Face recognition states
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedFaces, setDetectedFaces] = useState(0);
  const [recognitionStatus, setRecognitionStatus] = useState<'idle' | 'capturing' | 'processing' | 'complete'>('idle');
  const [recognizedStudents, setRecognizedStudents] = useState<FaceMatchResult[]>([]);

  // Attendance method state
  const [activeMethod, setActiveMethod] = useState<'manual' | 'face' | 'qr'>('manual');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }

    // Get session ID from query parameters
    if (searchParams) {
      const id = searchParams.get('sessionId');
      if (id) {
        setSessionId(id);

        // Try to get session data from localStorage first
        let sessionData = null;
        if (typeof window !== 'undefined') {
          const storedSessions = JSON.parse(localStorage.getItem('facultySessions') || '[]');
          sessionData = storedSessions.find((s: any) => s.id === id);

          if (sessionData) {
            console.log('Found session data in localStorage:', sessionData);
          }
        }

        // Extract course code from session ID if no session data found
        let courseCode;
        if (sessionData) {
          // Use the stored session data
          courseCode = sessionData.courseCode;
        } else {
          // Parse session ID to get course code (format: courseCode-timestamp)
          const parts = id.split('-');
          courseCode = parts[0];
          console.log('Extracted course code from session ID:', courseCode);
        }

        // Get course details
        const course = courses.find(c => c.code === courseCode);

        if (course) {
          setSessionDetails({
            courseCode,
            courseTitle: course.title,
            date: sessionData?.date ? new Date(sessionData.date).toLocaleDateString() : new Date().toLocaleDateString(),
            time: sessionData?.startTime || new Date().toLocaleTimeString(),
            location: sessionData?.location || `Room ${Math.floor(Math.random() * 10) + 100}`,
            section: course.sections ? course.sections.join(', ') : 'A, B',
            instructor: course.instructors && course.instructors.length > 0 ? course.instructors[0] : 'Faculty'
          });
        }

        // Generate mock student data
        generateMockStudents();
      }
    }
  }, [user, loading, router, searchParams]);

  // Generate mock students for the demo
  const generateMockStudents = async () => {
    try {
      // Try to get real attendance data from the API
      if (sessionId) {
        try {
          const response = await facultyAPI.getAttendance(sessionId);
          if (response.data && response.data.data && response.data.data.students) {
            const attendanceData = response.data.data;
            setStudents(attendanceData.students);

            // Calculate attendance stats
            const present = attendanceData.students.filter((s: any) => s.attendance === 'present').length;
            const absent = attendanceData.students.filter((s: any) => s.attendance === 'absent').length;
            const late = attendanceData.students.filter((s: any) => s.attendance === 'late').length;
            const total = attendanceData.students.length;
            const percentage = total > 0 ? Math.round((present + late) / total * 100) : 0;

            setAttendanceStats({
              present,
              absent,
              late,
              total,
              percentage
            });

            return; // Exit if we got real data
          }
        } catch (error) {
          console.error('Error fetching attendance data:', error);
          // Continue to generate mock data if API fails
        }
      }

      // Use real student data from studentData.ts and timetable data
      console.log('Using real student data with timetable');

      // Get course code and sections from session details
      const courseCode = sessionDetails?.courseCode || '';
      const courseSections = sessionDetails?.section?.split(', ') || ['A', 'B'];

      // Get the current day of the week
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDay = daysOfWeek[new Date().getDay()];

      // Get classes for the current day and course code
      const todayClasses = getClassesForDayAndSection(currentDay, null, 'VI', null);
      console.log('Today\'s classes:', todayClasses.map(c => c.courseCode));
      console.log('Looking for course code:', courseCode);

      // Try to find the exact course code first, then try a partial match
      let courseClass = todayClasses.find(c => c.courseCode === courseCode);

      // If not found, try a partial match (e.g., CS3053 might match CS305)
      if (!courseClass && courseCode) {
        courseClass = todayClasses.find(c =>
          c.courseCode.includes(courseCode) || courseCode.includes(c.courseCode)
        );
      }

      // If we found the class in the timetable, use its section
      const classSection = courseClass ? courseClass.section : courseSections[0];
      console.log(`Found class in timetable: ${courseClass ? 'Yes' : 'No'}, Section: ${classSection}`);

      // Get the specific section and semester from session details
      const sessionSection = sessionDetails?.section || classSection;
      const sessionSemester = 'VI'; // Hard-code VI semester as per requirements

      console.log(`Session details - Section: ${sessionSection}, Semester: ${sessionSemester}, Course: ${courseCode}`);

      // First, try to get students by exact section match
      let courseStudents: StudentData[] = [];

      // If session has multiple sections (comma-separated)
      if (sessionSection.includes(',')) {
        const sectionList = sessionSection.split(',').map(s => s.trim());
        console.log(`Multiple sections found: ${sectionList.join(', ')}`);

        // Get students from each section
        for (const section of sectionList) {
          const sectionStudents = getStudentsBySection(section).filter(s => s.semester === sessionSemester);
          courseStudents = [...courseStudents, ...sectionStudents];
        }
      } else {
        // Single section
        courseStudents = getStudentsBySection(sessionSection).filter(s => s.semester === sessionSemester);
      }

      console.log(`Found ${courseStudents.length} students for section ${sessionSection}`);

      // If no students found with exact section match, try using the class section from timetable
      if (courseStudents.length === 0 && classSection) {
        console.log(`No students found for section ${sessionSection}, trying timetable section ${classSection}`);
        courseStudents = getStudentsBySection(classSection).filter(s => s.semester === sessionSemester);
      }

      // If still no students, include all students from the semester
      if (courseStudents.length === 0) {
        console.log(`No students found for section ${sessionSection}, including all ${sessionSemester} semester students`);
        courseStudents = getStudentsBySemester(sessionSemester);

        // If still no students, include all students as a fallback
        if (courseStudents.length === 0) {
          console.log('No students found for the semester, including all students');
          courseStudents = realStudents;
        }
      }

      // Create attendance records for the real students
      const mockStudents: Student[] = courseStudents.map((student) => {
        // Random attendance status with bias toward present
        const rand = Math.random();
        let attendance: 'present' | 'absent' | 'late';
        if (rand < 0.75) attendance = 'present';
        else if (rand < 0.9) attendance = 'late';
        else attendance = 'absent';

        // Random verification method
        const verificationMethods = ['face', 'manual', 'id', 'none'];
        const verificationMethod = verificationMethods[Math.floor(Math.random() * 3)] as 'face' | 'manual' | 'id' | 'none';

        // Random time marked within the last hour
        const now = new Date();
        const timeMarked = new Date(now.getTime() - Math.floor(Math.random() * 60) * 60000).toLocaleTimeString();

        return {
          id: student.rollNumber,
          name: student.name,
          rollNumber: student.rollNumber,
          attendance,
          verificationMethod,
          timeMarked,
          compliance: {
            idCard: Math.random() > 0.1, // 90% have ID cards
            attentive: Math.random() > 0.2 // 80% are attentive
          }
        };
      });

      // Log the student data for debugging
      console.log(`Generated ${mockStudents.length} student records`);
      if (mockStudents.length > 0) {
        console.log('Sample student:', mockStudents[0]);
      }

      // Always create at least 5 dummy students to ensure we have data to display
      if (mockStudents.length === 0 || !sessionId) {
        console.log('No students found or no session ID, creating dummy students');
        const dummyStudents = [
          { id: 'S001', name: 'John Doe', rollNumber: '220101001', attendance: 'present', verificationMethod: 'manual', timeMarked: new Date().toLocaleTimeString(), compliance: { idCard: true, attentive: true } },
          { id: 'S002', name: 'Jane Smith', rollNumber: '220101002', attendance: 'present', verificationMethod: 'face', timeMarked: new Date().toLocaleTimeString(), compliance: { idCard: true, attentive: true } },
          { id: 'S003', name: 'Bob Johnson', rollNumber: '220101003', attendance: 'late', verificationMethod: 'manual', timeMarked: new Date().toLocaleTimeString(), compliance: { idCard: false, attentive: true } },
          { id: 'S004', name: 'Alice Brown', rollNumber: '220101004', attendance: 'absent', verificationMethod: 'none', timeMarked: new Date().toLocaleTimeString(), compliance: { idCard: false, attentive: false } },
          { id: 'S005', name: 'Charlie Davis', rollNumber: '220101005', attendance: 'present', verificationMethod: 'id', timeMarked: new Date().toLocaleTimeString(), compliance: { idCard: true, attentive: false } },
          { id: 'S006', name: 'Emma Wilson', rollNumber: '220101006', attendance: 'present', verificationMethod: 'face', timeMarked: new Date().toLocaleTimeString(), compliance: { idCard: true, attentive: true } },
          { id: 'S007', name: 'Frank Miller', rollNumber: '220101007', attendance: 'late', verificationMethod: 'manual', timeMarked: new Date().toLocaleTimeString(), compliance: { idCard: true, attentive: false } },
          { id: 'S008', name: 'Grace Lee', rollNumber: '220101008', attendance: 'present', verificationMethod: 'face', timeMarked: new Date().toLocaleTimeString(), compliance: { idCard: true, attentive: true } },
        ] as Student[];

        setStudents(dummyStudents);
        setAttendanceStats({
          present: 5,
          absent: 1,
          late: 2,
          total: 8,
          percentage: 87.5
        });
        return; // Exit after setting dummy students
      }

      setStudents(mockStudents);

      // Calculate stats
      const present = mockStudents.filter(s => s.attendance === 'present').length;
      const late = mockStudents.filter(s => s.attendance === 'late').length;
      const absent = mockStudents.filter(s => s.attendance === 'absent').length;
      const total = mockStudents.length;
      const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

      setAttendanceStats({
        present,
        absent,
        late,
        total,
        percentage
      });
    } catch (error) {
      console.error('Error generating students:', error);
    }
  };

  // Function to manually update attendance
  const updateAttendance = async (studentId: string, status: 'present' | 'absent' | 'late', method: 'manual' | 'face' = 'manual') => {
    try {
      // Update attendance in the API
      if (sessionId) {
        try {
          await facultyAPI.updateAttendance(sessionId, studentId, {
            attendance: status,
            verificationMethod: method
          });
        } catch (error) {
          console.error('Error updating attendance in API:', error);
          // Continue with local update even if API fails
        }
      }

      // Update local state
      setStudents(prev =>
        prev.map(student => {
          if (student.id === studentId) {
            return {
              ...student,
              attendance: status,
              verificationMethod: method,
              timeMarked: new Date().toLocaleTimeString()
            };
          }
          return student;
        })
      );

      // Update stats
      const updatedStudents = students.map(s =>
        s.id === studentId ? { ...s, attendance: status } : s
      );
      const present = updatedStudents.filter(s => s.attendance === 'present').length;
      const late = updatedStudents.filter(s => s.attendance === 'late').length;
      const absent = updatedStudents.filter(s => s.attendance === 'absent').length;

      setAttendanceStats({
        present,
        absent,
        late,
        total: updatedStudents.length,
        percentage: Math.round(((present + late) / updatedStudents.length) * 100)
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  // Update attendance stats based on current students data
  const updateAttendanceStats = () => {
    try {
      const present = students.filter(s => s.attendance === 'present').length;
      const late = students.filter(s => s.attendance === 'late').length;
      const absent = students.filter(s => s.attendance === 'absent').length;

      setAttendanceStats({
        present,
        absent,
        late,
        total: students.length,
        percentage: Math.round(((present + late) / students.length) * 100)
      });
    } catch (error) {
      console.error('Error updating attendance stats:', error);
    }
  };

  // Handle webcam capture
  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
  };

  // Handle face detection
  const handleFacesDetected = (count: number) => {
    setDetectedFaces(count);
  };

  // Start face recognition process
  const startFaceRecognition = () => {
    setIsCapturing(true);
    setRecognitionStatus('capturing');
    setRecognizedStudents([]);
  };

  // Handle capture complete
  const handleCaptureComplete = async () => {
    setIsCapturing(false);
    setRecognitionStatus('processing');

    if (capturedImage) {
      try {
        // Process the captured image with face recognition
        const results = await recognizeFaces(capturedImage);
        setRecognizedStudents(results);

        // Create a map of recognized student IDs for quick lookup
        const recognizedStudentIds = new Set(results.map(r => r.studentId));

        // Update the students list to mark which ones were recognized by face
        setStudents(prevStudents => {
          return prevStudents.map(student => {
            const isRecognized = recognizedStudentIds.has(student.rollNumber);
            const matchResult = results.find(r => r.studentId === student.rollNumber);

            if (isRecognized) {
              // If student is recognized, mark them as present with face verification
              return {
                ...student,
                attendance: 'present',
                verificationMethod: 'face',
                timeMarked: new Date().toLocaleTimeString(),
                faceRecognized: true,
                faceConfidence: matchResult?.confidence || 0
              };
            }

            // For students not recognized, just add the faceRecognized flag as false
            return {
              ...student,
              faceRecognized: false
            };
          });
        });

        // Update attendance stats after marking students
        updateAttendanceStats();

        setRecognitionStatus('complete');
      } catch (error) {
        console.error('Error in face recognition:', error);
        setRecognitionStatus('idle');
      }
    } else {
      setRecognitionStatus('idle');
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
    <div className="max-w-7xl mx-auto px-4 py-8 bg-white">
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center">
          <Link href="/faculty/classes" className="text-blue-600 hover:text-blue-800 mr-4 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Classes
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Session Monitor</h1>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={startFaceRecognition}
            disabled={recognitionStatus !== 'idle'}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Take Attendance
          </button>
        </div>
      </div>

      {/* Webcam Capture Component */}
      {(recognitionStatus === 'capturing' || recognitionStatus === 'processing') && (
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-3">Face Recognition</h2>
          <div className="mb-4">
            <WebcamCapture
              onCapture={handleCapture}
              onFacesDetected={handleFacesDetected}
              isCapturing={isCapturing}
              onCaptureComplete={handleCaptureComplete}
            />
          </div>
          <div className="text-center text-sm text-gray-600">
            {recognitionStatus === 'capturing' ? (
              <p>Capturing class attendance. Please ensure all students are visible.</p>
            ) : (
              <p>Processing {detectedFaces} detected faces...</p>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{sessionDetails.courseCode}: {sessionDetails.courseTitle}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                {new Date(sessionDetails.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {sessionDetails.time}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                {sessionDetails.location}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                Section: {sessionDetails.section}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                {sessionDetails.instructor}
              </span>
            </div>
          </div>

          <div className="mt-4 md:mt-0">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-6 py-4 rounded-lg shadow-inner">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                Attendance Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <div className="text-green-600 font-bold text-2xl">{attendanceStats.present}</div>
                  <div className="text-xs font-medium text-gray-600">Present</div>
                </div>
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <div className="text-yellow-600 font-bold text-2xl">{attendanceStats.late}</div>
                  <div className="text-xs font-medium text-gray-600">Late</div>
                </div>
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <div className="text-red-600 font-bold text-2xl">{attendanceStats.absent}</div>
                  <div className="text-xs font-medium text-gray-600">Absent</div>
                </div>
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <div className="text-blue-600 font-bold text-2xl">{attendanceStats.percentage}%</div>
                  <div className="text-xs font-medium text-gray-600">Rate</div>
                </div>
              </div>
              <div className="mt-3 bg-white rounded-lg p-2 shadow-sm">
                <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="flex h-full">
                    <div
                      className="bg-green-500 h-full"
                      style={{ width: `${(attendanceStats.present / attendanceStats.total) * 100}%` }}
                    ></div>
                    <div
                      className="bg-yellow-500 h-full"
                      style={{ width: `${(attendanceStats.late / attendanceStats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-600">
                  <span>Total: {attendanceStats.total} students</span>
                  <span>Updated: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Method Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
        <div className="flex border-b bg-gray-50">
          <button
            type="button"
            className={`flex-1 py-3 px-4 text-center font-medium ${activeMethod === 'manual' ? 'bg-white text-blue-700 border-b-2 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveMethod('manual')}
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Manual Marking
            </div>
          </button>
          <button
            type="button"
            className={`flex-1 py-3 px-4 text-center font-medium ${activeMethod === 'face' ? 'bg-white text-blue-700 border-b-2 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveMethod('face')}
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Face Recognition
            </div>
          </button>
          <button
            type="button"
            className={`flex-1 py-3 px-4 text-center font-medium ${activeMethod === 'qr' ? 'bg-white text-blue-700 border-b-2 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveMethod('qr')}
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
              </svg>
              QR Code
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeMethod === 'manual' && (
            <div className="text-center text-gray-600">
              <p>Use the table below to manually mark student attendance.</p>
            </div>
          )}

          {activeMethod === 'face' && (
            <div>
              {recognitionStatus === 'idle' ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Capture the classroom to automatically mark attendance using facial recognition.</p>
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                    onClick={startFaceRecognition}
                  >
                    Start Face Recognition
                  </button>
                </div>
              ) : recognitionStatus === 'complete' ? (
                <div className="text-center">
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-2">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Face Recognition Complete!</h3>
                    <p className="text-gray-600 mt-1">
                      {recognizedStudents.length} students recognized and marked present
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Only students with registered faces can be recognized.
                      Students with unregistered faces must be marked manually.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                    onClick={() => setRecognitionStatus('idle')}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <WebcamCapture
                  onCapture={handleCapture}
                  onFacesDetected={handleFacesDetected}
                  isCapturing={isCapturing}
                  onCaptureComplete={handleCaptureComplete}
                />
              )}
            </div>
          )}

          {activeMethod === 'qr' && (
            <div className="flex flex-col items-center">
              <p className="text-gray-600 mb-6 text-center">Generate a QR code for students to scan and mark their attendance.</p>
              <QRCodeGenerator
                sessionId={sessionId || ''}
                courseCode={sessionDetails.courseCode}
                expiryMinutes={5}
              />
            </div>
          )}
        </div>
      </div>

      {/* Top Controls Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Session Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <h3 className="font-semibold mb-3 text-gray-800">Session Controls</h3>
          <div className="space-y-2">
            <button
              type="button"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-medium"
              onClick={() => router.push('/faculty/classes')}
            >
              End Session
            </button>
            <button
              type="button"
              className="w-full bg-white border border-blue-600 text-blue-700 px-4 py-2 rounded hover:bg-blue-50 transition font-medium"
            >
              Export Attendance
            </button>
            <button
              type="button"
              className="w-full bg-white border border-gray-400 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition font-medium"
            >
              Send Reminder
            </button>
          </div>
        </div>

        {/* Compliance Monitoring */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <h3 className="font-semibold mb-3 text-gray-800">Compliance Monitoring</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">ID Card Compliance</span>
                <span className="text-sm font-medium text-green-600">
                  {Math.round(students.filter(s => s.compliance.idCard).length / students.length * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{
                  width: `${Math.round(students.filter((s: Student) => s.compliance.idCard).length / students.length * 100)}%`
                }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Attentiveness</span>
                <span className="text-sm font-medium text-green-600">
                  {Math.round(students.filter(s => s.compliance.attentive).length / students.length * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{
                  width: `${Math.round(students.filter((s: Student) => s.compliance.attentive).length / students.length * 100)}%`
                }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Face Recognition */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <h3 className="font-semibold mb-3 text-gray-800">Face Recognition</h3>
          <div className="space-y-4">
            {recognitionStatus === 'idle' && (
              <button
                type="button"
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition font-medium shadow-sm"
                onClick={startFaceRecognition}
              >
                Start Face Recognition
              </button>
            )}

            {recognitionStatus === 'capturing' && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Capturing class attendance...</p>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 animate-pulse rounded-full"></div>
                </div>
              </div>
            )}

            {recognitionStatus === 'processing' && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Processing {detectedFaces} faces...</p>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-600 animate-pulse rounded-full"></div>
                </div>
              </div>
            )}

            {recognitionStatus === 'complete' && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Recognition complete!</p>
                <p className="text-sm text-gray-600 mb-3">{recognizedStudents.length} students marked present</p>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  onClick={() => setRecognitionStatus('idle')}
                >
                  Done
                </button>
              </div>
            )}

            {(recognitionStatus === 'capturing' || recognitionStatus === 'processing') && (
              <button
                type="button"
                className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition mt-4"
                onClick={() => setRecognitionStatus('idle')}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Student List Section - Full Width */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                Student Attendance List
              </h3>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search students..."
                    className="w-full bg-gray-100 border border-gray-300 text-gray-800 py-1.5 pl-8 pr-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <select
                    className="appearance-none bg-gray-100 border border-gray-300 text-gray-800 py-1.5 pl-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    aria-label="Filter attendance status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Students</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Student</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Roll Number</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Verification</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Time</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Compliance</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Filter students based on search query and status filter */}
                  {students && students.length > 0 ? students
                    .filter(student => {
                      // Filter by search query (name or roll number)
                      const matchesSearch = searchQuery === '' ||
                        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());

                      // Filter by attendance status
                      const matchesStatus = statusFilter === 'all' || student.attendance === statusFilter;

                      return matchesSearch && matchesStatus;
                    })
                    .map((student) => (
                    <tr key={student.id} className={`hover:bg-gray-50 ${student.faceRecognized ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{student.rollNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.attendance === 'present'
                            ? 'bg-green-100 text-green-800'
                            : student.attendance === 'late'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {student.attendance.charAt(0).toUpperCase() + student.attendance.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.verificationMethod === 'face' ? (
                          <span className="flex items-center text-blue-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Face Recognition
                            {student.faceConfidence && (
                              <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                {Math.round(student.faceConfidence)}%
                              </span>
                            )}
                          </span>
                        ) : student.verificationMethod === 'manual' ? (
                          <span className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                            Manual
                          </span>
                        ) : student.verificationMethod === 'id' ? (
                          <span className="flex items-center text-purple-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                            </svg>
                            ID Card
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-400">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            None
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.timeMarked}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            student.compliance.idCard ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            ID Card
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            student.compliance.attentive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            Attentive
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => updateAttendance(student.id, 'present')}
                            className={`px-3 py-1 rounded text-xs flex items-center min-w-[70px] justify-center font-medium ${
                              student.attendance === 'present'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-green-100 hover:text-green-700'
                            }`}
                          >
                            {student.attendance === 'present' ? (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Present
                              </>
                            ) : 'Present'}
                          </button>
                          <button
                            type="button"
                            onClick={() => updateAttendance(student.id, 'late')}
                            className={`px-3 py-1 rounded text-xs flex items-center min-w-[70px] justify-center font-medium ${
                              student.attendance === 'late'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-yellow-100 hover:text-yellow-700'
                            }`}
                          >
                            {student.attendance === 'late' ? (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Late
                              </>
                            ) : 'Late'}
                          </button>
                          <button
                            type="button"
                            onClick={() => updateAttendance(student.id, 'absent')}
                            className={`px-3 py-1 rounded text-xs flex items-center min-w-[70px] justify-center font-medium ${
                              student.attendance === 'absent'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-red-100 hover:text-red-700'
                            }`}
                          >
                            {student.attendance === 'absent' ? (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                                Absent
                              </>
                            ) : 'Absent'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        {searchQuery || statusFilter !== 'all' ?
                          `No students found matching your search criteria. Try adjusting your filters.` :
                          `No students found. Please check your session details or try refreshing the page.`
                        }
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

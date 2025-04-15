'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Course {
  id: string;
  code: string;
  name: string;
  faculty: string;
  schedule: string;
  roomNumber: string;
  attendanceRate: number;
}

export default function StudentClasses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // In a real app, we would fetch courses from API
        // const response = await fetch('/api/student/courses');
        // const data = await response.json();
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockCourses: Course[] = [
          {
            id: '1',
            code: 'CS101',
            name: 'Introduction to Computer Science',
            faculty: 'Dr. Smith',
            schedule: 'Mon, Wed, Fri 10:00 AM - 11:30 AM',
            roomNumber: 'R-101',
            attendanceRate: 92,
          },
          {
            id: '2',
            code: 'MATH201',
            name: 'Calculus II',
            faculty: 'Prof. Johnson',
            schedule: 'Tue, Thu 1:00 PM - 3:00 PM',
            roomNumber: 'R-205',
            attendanceRate: 85,
          },
          {
            id: '3',
            code: 'PHY101',
            name: 'Physics I',
            faculty: 'Dr. Williams',
            schedule: 'Mon, Wed 2:00 PM - 3:30 PM',
            roomNumber: 'R-150',
            attendanceRate: 78,
          },
          {
            id: '4',
            code: 'ENG102',
            name: 'English Composition',
            faculty: 'Prof. Davis',
            schedule: 'Tue, Thu 10:00 AM - 11:30 AM',
            roomNumber: 'R-220',
            attendanceRate: 95,
          },
        ];
        
        setCourses(mockCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Classes</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{course.name}</h2>
                <p className="text-sm text-gray-600 mb-4">{course.code}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-gray-700">{course.faculty}</span>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">{course.schedule}</span>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-gray-700">Room {course.roomNumber}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
                    <span className={`text-sm font-medium ${
                      course.attendanceRate >= 90 ? 'text-green-600' :
                      course.attendanceRate >= 75 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {course.attendanceRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        course.attendanceRate >= 90 ? 'bg-green-500' :
                        course.attendanceRate >= 75 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${course.attendanceRate}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    href={`/student/attendance?courseId=${course.id}`}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-center py-2 px-4 rounded transition"
                  >
                    View Attendance
                  </Link>
                  <Link
                    href="#"
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-2 px-4 rounded transition"
                  >
                    Course Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

interface CourseReport {
  courseId: string;
  courseName: string;
  totalSessions: number;
  attendedSessions: number;
  attendancePercentage: number;
}

interface MonthlyAttendance {
  month: string;
  percentage: number;
}

export default function StudentReports() {
  const [courseReports, setCourseReports] = useState<CourseReport[]>([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState<MonthlyAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'semester' | 'month'>('semester');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // In a real app, we would fetch reports from API
        // const response = await fetch('/api/student/attendance/reports');
        // const data = await response.json();
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockCourseReports: CourseReport[] = [
          {
            courseId: 'CS101',
            courseName: 'Introduction to Computer Science',
            totalSessions: 24,
            attendedSessions: 22,
            attendancePercentage: 91.67,
          },
          {
            courseId: 'MATH201',
            courseName: 'Calculus II',
            totalSessions: 18,
            attendedSessions: 15,
            attendancePercentage: 83.33,
          },
          {
            courseId: 'PHY101',
            courseName: 'Physics I',
            totalSessions: 20,
            attendedSessions: 16,
            attendancePercentage: 80,
          },
          {
            courseId: 'ENG102',
            courseName: 'English Composition',
            totalSessions: 16,
            attendedSessions: 15,
            attendancePercentage: 93.75,
          },
        ];
        
        const mockMonthlyAttendance: MonthlyAttendance[] = [
          { month: 'January', percentage: 85 },
          { month: 'February', percentage: 90 },
          { month: 'March', percentage: 78 },
          { month: 'April', percentage: 92 },
          { month: 'May', percentage: 88 },
          { month: 'June', percentage: 0 },
          { month: 'July', percentage: 0 },
          { month: 'August', percentage: 0 },
          { month: 'September', percentage: 0 },
          { month: 'October', percentage: 0 },
          { month: 'November', percentage: 0 },
          { month: 'December', percentage: 0 },
        ];
        
        setCourseReports(mockCourseReports);
        setMonthlyAttendance(mockMonthlyAttendance);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  // Calculate overall attendance
  const overallAttendance = courseReports.length > 0 
    ? courseReports.reduce((sum, course) => sum + course.attendancePercentage, 0) / courseReports.length
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gradient-to-br from-blue-100 via-white to-blue-200 min-h-screen">
      <h1 className="text-4xl font-extrabold text-blue-900 mb-8 drop-shadow">Attendance Reports</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-xl border border-blue-200 p-8 mb-8 text-gray-900">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Overall Attendance</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedPeriod('semester')}
                  className={`px-4 py-2 rounded-md ${
                    selectedPeriod === 'semester'
                      ? 'bg-blue-600 text-gray-900'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  This Semester
                </button>
                <button
                  onClick={() => setSelectedPeriod('month')}
                  className={`px-4 py-2 rounded-md ${
                    selectedPeriod === 'month'
                      ? 'bg-blue-600 text-gray-900'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Monthly View
                </button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-12">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#edf2f7" 
                    strokeWidth="10" 
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke={
                      overallAttendance >= 90 ? '#48bb78' :
                      overallAttendance >= 75 ? '#ed8936' :
                      '#f56565'
                    }
                    strokeWidth="10" 
                    strokeDasharray={`${2 * Math.PI * 45 * (overallAttendance / 100)} ${2 * Math.PI * 45 * (1 - overallAttendance / 100)}`}
                    strokeDashoffset={2 * Math.PI * 45 * 0.25}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">{overallAttendance.toFixed(1)}%</span>
                  <span className="text-sm text-gray-500">Overall</span>
                </div>
              </div>
              
              <div className="w-full md:w-3/5 max-w-md">
                {selectedPeriod === 'semester' ? (
                  <div className="space-y-4">
                    {courseReports.map(course => (
                      <div key={course.courseId} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">{course.courseName}</span>
                          <span className={`font-medium ${
                            course.attendancePercentage >= 90 ? 'text-green-600' :
                            course.attendancePercentage >= 75 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {course.attendancePercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              course.attendancePercentage >= 90 ? 'bg-green-500' :
                              course.attendancePercentage >= 75 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${course.attendancePercentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {course.attendedSessions} of {course.totalSessions} sessions attended
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {monthlyAttendance
                      .filter(month => month.percentage > 0)
                      .map(month => (
                        <div key={month.month} className="space-y-1">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">{month.month}</span>
                            <span className={`font-medium ${
                              month.percentage >= 90 ? 'text-green-600' :
                              month.percentage >= 75 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {month.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                month.percentage >= 90 ? 'bg-green-500' :
                                month.percentage >= 75 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${month.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Courses by Attendance</h2>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[...courseReports].sort((a, b) => b.attendancePercentage - a.attendancePercentage).map(course => (
                      <tr key={course.courseId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{course.courseName}</div>
                          <div className="text-xs text-gray-500">{course.courseId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {course.attendancePercentage.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            course.attendancePercentage >= 90 ? 'bg-green-100 text-green-800' :
                            course.attendancePercentage >= 75 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {course.attendancePercentage >= 90 ? 'Excellent' :
                             course.attendancePercentage >= 75 ? 'Good' :
                             'At Risk'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Attendance Summary</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-500 mb-1">Total Sessions</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {courseReports.reduce((sum, course) => sum + course.totalSessions, 0)}
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-500 mb-1">Sessions Attended</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {courseReports.reduce((sum, course) => sum + course.attendedSessions, 0)}
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-sm text-yellow-500 mb-1">Sessions Missed</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {courseReports.reduce((sum, course) => sum + (course.totalSessions - course.attendedSessions), 0)}
                      </div>
                    </div>
                    
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-900 mb-1">Courses</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {courseReports.length}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Need Improvement</h3>
                  {courseReports.filter(course => course.attendancePercentage < 85).length === 0 ? (
                    <div className="text-green-700 p-4 bg-green-100 rounded-xl font-semibold">
                      Great job! All your courses have good attendance.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {courseReports
                        .filter(course => course.attendancePercentage < 85)
                        .map(course => (
                          <div key={course.courseId} className="p-3 bg-yellow-100 rounded-xl text-gray-900">
                            <div className="font-medium">{course.courseName}</div>
                            <div className="text-sm text-blue-900 flex justify-between">
                              <span>Current: {course.attendancePercentage.toFixed(1)}%</span>
                              <span>Target: 85%</span>
                            </div>
                            <div className="text-xs text-red-700 mt-1 font-semibold">
                              Don't miss any more sessions to maintain eligibility.
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

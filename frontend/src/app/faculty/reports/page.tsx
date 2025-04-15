'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AttendanceData {
  courseId: string;
  attendanceRate: number;
  sessionCount: number;
  studentCount: number;
}

interface ComplianceData {
  courseId: string;
  idCardCompliance: number;
  phoneCompliance: number;
  overallCompliance: number;
}

interface StudentAttendance {
  studentId: string;
  name: string;
  attendanceRate: number;
  lastAttended: string;
  complianceScore: number;
}

export default function FacultyReports() {
  const [selectedTab, setSelectedTab] = useState<'attendance' | 'compliance' | 'student'>('attendance');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'semester'>('month');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [complianceData, setComplianceData] = useState<ComplianceData[]>([]);
  const [studentData, setStudentData] = useState<StudentAttendance[]>([]);
  const [courses, setCourses] = useState<string[]>([]);

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      // Sample courses
      const sampleCourses = ['CSE101', 'CSE202', 'MATH201', 'PHYS101'];
      setCourses(sampleCourses);

      // Sample attendance data
      setAttendanceData([
        { courseId: 'CSE101', attendanceRate: 87, sessionCount: 12, studentCount: 35 },
        { courseId: 'CSE202', attendanceRate: 78, sessionCount: 8, studentCount: 28 },
        { courseId: 'MATH201', attendanceRate: 92, sessionCount: 10, studentCount: 22 },
        { courseId: 'PHYS101', attendanceRate: 83, sessionCount: 9, studentCount: 30 }
      ]);

      // Sample compliance data
      setComplianceData([
        { courseId: 'CSE101', idCardCompliance: 94, phoneCompliance: 88, overallCompliance: 91 },
        { courseId: 'CSE202', idCardCompliance: 82, phoneCompliance: 77, overallCompliance: 80 },
        { courseId: 'MATH201', idCardCompliance: 98, phoneCompliance: 95, overallCompliance: 97 },
        { courseId: 'PHYS101', idCardCompliance: 89, phoneCompliance: 85, overallCompliance: 87 }
      ]);

      // Sample student data
      setStudentData([
        { studentId: 'ST0001', name: 'Alice Johnson', attendanceRate: 95, lastAttended: '2025-04-12T09:30:00', complianceScore: 98 },
        { studentId: 'ST0002', name: 'Bob Smith', attendanceRate: 82, lastAttended: '2025-04-12T09:30:00', complianceScore: 89 },
        { studentId: 'ST0003', name: 'Charlie Brown', attendanceRate: 78, lastAttended: '2025-04-11T14:15:00', complianceScore: 85 },
        { studentId: 'ST0004', name: 'David Miller', attendanceRate: 92, lastAttended: '2025-04-12T09:30:00', complianceScore: 93 },
        { studentId: 'ST0005', name: 'Eva Garcia', attendanceRate: 68, lastAttended: '2025-04-08T11:00:00', complianceScore: 75 },
        { studentId: 'ST0006', name: 'Frank Wilson', attendanceRate: 88, lastAttended: '2025-04-12T09:30:00', complianceScore: 91 },
        { studentId: 'ST0007', name: 'Grace Lee', attendanceRate: 97, lastAttended: '2025-04-12T09:30:00', complianceScore: 99 }
      ]);

      setLoading(false);
    }, 1000);

    // Real implementation would fetch data from API endpoints
  }, []);

  // Filter data based on selected course
  const filteredAttendanceData = courseFilter === 'all' 
    ? attendanceData 
    : attendanceData.filter(d => d.courseId === courseFilter);

  const filteredComplianceData = courseFilter === 'all'
    ? complianceData
    : complianceData.filter(d => d.courseId === courseFilter);

  const filteredStudentData = studentData;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Attendance Reports</h1>
          <div className="mt-4 md:mt-0">
            <Link 
              href="/" 
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Filters Row */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div>
            <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              id="date-range"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="semester">Current Semester</option>
            </select>
          </div>
          <div>
            <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              id="course-filter"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          <div className="flex-grow md:text-right self-end">
            <button className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-2 rounded transition">
              Export Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedTab('attendance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'attendance'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Attendance Statistics
              </button>
              <button
                onClick={() => setSelectedTab('compliance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'compliance'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Compliance Metrics
              </button>
              <button
                onClick={() => setSelectedTab('student')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'student'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Student Performance
              </button>
            </nav>
          </div>
        </div>

        {/* Attendance Statistics Tab */}
        {selectedTab === 'attendance' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Average Attendance</h3>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-indigo-600">
                    {filteredAttendanceData.length > 0 
                      ? Math.round(filteredAttendanceData.reduce((acc, curr) => acc + curr.attendanceRate, 0) / filteredAttendanceData.length)
                      : 0}%
                  </span>
                  <span className="ml-2 text-green-500 text-sm">↑ 3% from last month</span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Sessions</h3>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-indigo-600">
                    {filteredAttendanceData.reduce((acc, curr) => acc + curr.sessionCount, 0)}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Students</h3>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-indigo-600">
                    {courseFilter === 'all' 
                      ? attendanceData.reduce((max, curr) => curr.studentCount > max ? curr.studentCount : max, 0)
                      : filteredAttendanceData[0]?.studentCount || 0}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Low Attendance</h3>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-red-500">
                    {studentData.filter(s => s.attendanceRate < 75).length}
                  </span>
                  <span className="ml-2 text-gray-500 text-sm">students below 75%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Attendance by Course</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAttendanceData.map((course) => (
                      <tr key={course.courseId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{course.courseId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-500">{course.sessionCount} sessions</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-500">{course.studentCount} students</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="mr-2 w-24 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  course.attendanceRate >= 90 ? 'bg-green-500' : 
                                  course.attendanceRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${course.attendanceRate}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-900">{course.attendanceRate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-green-500">↑ 2%</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Metrics Tab */}
        {selectedTab === 'compliance' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">ID Card Compliance</h3>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-indigo-600">
                    {filteredComplianceData.length > 0 
                      ? Math.round(filteredComplianceData.reduce((acc, curr) => acc + curr.idCardCompliance, 0) / filteredComplianceData.length)
                      : 0}%
                  </span>
                  <span className="ml-2 text-green-500 text-sm">↑ 5% from last month</span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Phone Usage Compliance</h3>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-indigo-600">
                    {filteredComplianceData.length > 0 
                      ? Math.round(filteredComplianceData.reduce((acc, curr) => acc + curr.phoneCompliance, 0) / filteredComplianceData.length)
                      : 0}%
                  </span>
                  <span className="ml-2 text-green-500 text-sm">↑ 2% from last month</span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Overall Compliance</h3>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-indigo-600">
                    {filteredComplianceData.length > 0 
                      ? Math.round(filteredComplianceData.reduce((acc, curr) => acc + curr.overallCompliance, 0) / filteredComplianceData.length)
                      : 0}%
                  </span>
                  <span className="ml-2 text-green-500 text-sm">↑ 3% from last month</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Compliance by Course</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Card Compliance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Usage Compliance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Score</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredComplianceData.map((course) => (
                      <tr key={course.courseId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{course.courseId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="mr-2 w-24 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  course.idCardCompliance >= 90 ? 'bg-green-500' : 
                                  course.idCardCompliance >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${course.idCardCompliance}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-900">{course.idCardCompliance}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="mr-2 w-24 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  course.phoneCompliance >= 90 ? 'bg-green-500' : 
                                  course.phoneCompliance >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${course.phoneCompliance}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-900">{course.phoneCompliance}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="mr-2 w-24 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  course.overallCompliance >= 90 ? 'bg-green-500' : 
                                  course.overallCompliance >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${course.overallCompliance}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-900">{course.overallCompliance}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Student Performance Tab */}
        {selectedTab === 'student' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Student Attendance & Compliance</h3>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search by name or ID..." 
                    className="rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Attended</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudentData.map((student) => (
                      <tr key={student.studentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{student.studentId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{student.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="mr-2 w-24 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  student.attendanceRate >= 90 ? 'bg-green-500' : 
                                  student.attendanceRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${student.attendanceRate}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-900">{student.attendanceRate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-500">{formatDate(student.lastAttended)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="mr-2 w-24 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  student.complianceScore >= 90 ? 'bg-green-500' : 
                                  student.complianceScore >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${student.complianceScore}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-900">{student.complianceScore}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                          <button className="hover:underline">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredStudentData.length}</span> of <span className="font-medium">{filteredStudentData.length}</span> students
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">Previous</button>
                  <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">Next</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
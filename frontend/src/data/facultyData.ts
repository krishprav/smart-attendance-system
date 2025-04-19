// Real data for faculty endpoints
// Combines course data and student data for use in the faculty interface

import { Course as OriginalCourse } from './courseData';
import { Student, getStudentsByCourse, getStudentsByDepartment } from './studentData';

// Extended Course interface with additional properties needed for faculty views
export interface Course {
  id: string;
  code: string;
  title: string;
  faculty: {
    id: string;
    name: string;
  };
  department: string;
  semester: string;
  credits: number;
  totalStudents: number;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
    room: string;
    type: 'lecture' | 'lab' | 'tutorial';
  }[];
}

// Map from original course data to extended course data
export const courses: Course[] = [
  {
    id: 'CS101',
    code: 'CS101',
    title: 'Introduction to Computer Science',
    faculty: {
      id: 'FAC001',
      name: 'Dr. Krishnendu Rarhi'
    },
    department: 'Computer Science & Engineering',
    semester: '1st',
    credits: 4,
    totalStudents: 60,
    schedule: [
      {
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:30',
        room: 'LH-101',
        type: 'lecture'
      },
      {
        day: 'Wednesday',
        startTime: '09:00',
        endTime: '10:30',
        room: 'LH-101',
        type: 'lecture'
      },
      {
        day: 'Friday',
        startTime: '14:00',
        endTime: '16:00',
        room: 'Lab-1',
        type: 'lab'
      }
    ]
  },
  {
    id: 'CS201',
    code: 'CS201',
    title: 'Data Structures and Algorithms',
    faculty: {
      id: 'FAC002',
      name: 'Dr. Soibam Joydeep Singh'
    },
    department: 'Computer Science & Engineering',
    semester: '3rd',
    credits: 4,
    totalStudents: 55,
    schedule: [
      {
        day: 'Tuesday',
        startTime: '10:45',
        endTime: '12:15',
        room: 'LH-102',
        type: 'lecture'
      },
      {
        day: 'Thursday',
        startTime: '10:45',
        endTime: '12:15',
        room: 'LH-102',
        type: 'lecture'
      },
      {
        day: 'Monday',
        startTime: '14:00',
        endTime: '16:00',
        room: 'Lab-2',
        type: 'lab'
      }
    ]
  },
  {
    id: 'CS301',
    code: 'CS301',
    title: 'Database Management Systems',
    faculty: {
      id: 'FAC003',
      name: 'Dr. Manoj Kumar'
    },
    department: 'Computer Science & Engineering',
    semester: '5th',
    credits: 4,
    totalStudents: 50,
    schedule: [
      {
        day: 'Monday',
        startTime: '10:45',
        endTime: '12:15',
        room: 'LH-103',
        type: 'lecture'
      },
      {
        day: 'Wednesday',
        startTime: '10:45',
        endTime: '12:15',
        room: 'LH-103',
        type: 'lecture'
      },
      {
        day: 'Tuesday',
        startTime: '14:00',
        endTime: '16:00',
        room: 'Lab-3',
        type: 'lab'
      }
    ]
  },
  {
    id: 'EC201',
    code: 'EC201',
    title: 'Digital Electronics',
    faculty: {
      id: 'FAC004',
      name: 'Dr. Anil Kumar'
    },
    department: 'Electronics & Communication',
    semester: '3rd',
    credits: 4,
    totalStudents: 45,
    schedule: [
      {
        day: 'Tuesday',
        startTime: '09:00',
        endTime: '10:30',
        room: 'LH-201',
        type: 'lecture'
      },
      {
        day: 'Thursday',
        startTime: '09:00',
        endTime: '10:30',
        room: 'LH-201',
        type: 'lecture'
      },
      {
        day: 'Wednesday',
        startTime: '14:00',
        endTime: '16:00',
        room: 'Lab-4',
        type: 'lab'
      }
    ]
  },
  {
    id: 'MA101',
    code: 'MA101',
    title: 'Mathematics for Computer Science',
    faculty: {
      id: 'FAC005',
      name: 'Dr. Priya Sharma'
    },
    department: 'Mathematics',
    semester: '1st',
    credits: 4,
    totalStudents: 60,
    schedule: [
      {
        day: 'Monday',
        startTime: '14:00',
        endTime: '15:30',
        room: 'LH-101',
        type: 'lecture'
      },
      {
        day: 'Wednesday',
        startTime: '14:00',
        endTime: '15:30',
        room: 'LH-101',
        type: 'lecture'
      },
      {
        day: 'Friday',
        startTime: '10:45',
        endTime: '12:15',
        room: 'LH-101',
        type: 'tutorial'
      }
    ]
  }
];

// Faculty data
export const faculty = [
  {
    id: 'FAC001',
    name: 'Dr. Krishnendu Rarhi',
    email: 'krishnendu@iiitmanipur.ac.in',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    specialization: 'Machine Learning, Computer Vision'
  },
  {
    id: 'FAC002',
    name: 'Dr. Soibam Joydeep Singh',
    email: 'joydeep@iiitmanipur.ac.in',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    specialization: 'Algorithms, Data Structures'
  },
  {
    id: 'FAC003',
    name: 'Dr. Manoj Kumar',
    email: 'manoj@iiitmanipur.ac.in',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor',
    specialization: 'Database Systems, Big Data'
  },
  {
    id: 'FAC004',
    name: 'Dr. Anil Kumar',
    email: 'anil@iiitmanipur.ac.in',
    department: 'Electronics & Communication',
    designation: 'Assistant Professor',
    specialization: 'VLSI Design, Embedded Systems'
  },
  {
    id: 'FAC005',
    name: 'Dr. Priya Sharma',
    email: 'priya@iiitmanipur.ac.in',
    department: 'Mathematics',
    designation: 'Assistant Professor',
    specialization: 'Linear Algebra, Discrete Mathematics'
  }
];

// Session interface
export interface Session {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  faculty: {
    id: string;
    name: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  location: string;
  type: 'lecture' | 'lab' | 'tutorial';
  isActive: boolean;
  attendanceCount: number;
  totalStudents: number;
  students: {
    id: string;
    name: string;
    studentId: string;
    status: 'present' | 'absent' | 'late';
    verificationMethod?: string;
    markedAt?: string;
  }[];
}

// Generate active sessions based on current day and time
export const generateActiveSessions = (): Session[] => {
  const now = new Date();
  const today = now.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Filter courses that have sessions today
  const todayCourses = courses.filter(course => 
    course.schedule.some(schedule => schedule.day === today)
  );
  
  // Generate sessions
  return todayCourses.map(course => {
    const todaySchedule = course.schedule.find(schedule => schedule.day === today);
    
    if (!todaySchedule) return null;
    
    // Check if the session is currently active
    const startTime = new Date();
    const [startHour, startMinute] = todaySchedule.startTime.split(':').map(Number);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date();
    const [endHour, endMinute] = todaySchedule.endTime.split(':').map(Number);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    const isActive = now >= startTime && now <= endTime;
    
    // Calculate duration in minutes
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    
    // Generate random attendance count
    const attendanceCount = Math.floor(Math.random() * (course.totalStudents + 1));
    
    return {
      id: `${course.id}-${today}-${todaySchedule.startTime}`.replace(/[: ]/g, '-'),
      courseId: course.id,
      courseName: course.title,
      courseCode: course.code,
      faculty: course.faculty,
      date: now.toISOString().split('T')[0],
      startTime: todaySchedule.startTime,
      endTime: todaySchedule.endTime,
      duration: durationMinutes,
      location: todaySchedule.room,
      type: todaySchedule.type,
      isActive,
      attendanceCount,
      totalStudents: course.totalStudents,
      students: [] // This would be populated with actual student data
    };
  }).filter(Boolean) as Session[];
};

// Generate past sessions for reports and analytics
export const generatePastSessions = (count: number = 20): Session[] => {
  const sessions: Session[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    // Pick a random course
    const course = courses[Math.floor(Math.random() * courses.length)];
    
    // Pick a random schedule from the course
    const schedule = course.schedule[Math.floor(Math.random() * course.schedule.length)];
    
    // Generate a past date (between 1-30 days ago)
    const pastDate = new Date(now);
    pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 30) - 1);
    
    // Format the date as YYYY-MM-DD
    const dateStr = pastDate.toISOString().split('T')[0];
    
    // Calculate duration in minutes
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
    const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    
    // Generate random attendance count
    const attendanceCount = Math.floor(Math.random() * (course.totalStudents + 1));
    
    sessions.push({
      id: `${course.id}-${dateStr}-${schedule.startTime}`.replace(/[: ]/g, '-'),
      courseId: course.id,
      courseName: course.title,
      courseCode: course.code,
      faculty: course.faculty,
      date: dateStr,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      duration: durationMinutes,
      location: schedule.room,
      type: schedule.type,
      isActive: false,
      attendanceCount,
      totalStudents: course.totalStudents,
      students: [] // This would be populated with actual student data
    });
  }
  
  return sessions;
};

// Generate attendance data for reports
export const generateAttendanceReports = () => {
  return courses.map(course => ({
    courseId: course.code,
    courseName: course.title,
    attendanceRate: Math.floor(Math.random() * 30) + 70, // 70-100%
    sessionCount: Math.floor(Math.random() * 15) + 5, // 5-20 sessions
    studentCount: course.totalStudents
  }));
};

// Generate compliance data for reports
export const generateComplianceReports = () => {
  return courses.map(course => ({
    courseId: course.code,
    courseName: course.title,
    idCardCompliance: Math.floor(Math.random() * 20) + 80, // 80-100%
    phoneCompliance: Math.floor(Math.random() * 30) + 70, // 70-100%
    overallCompliance: Math.floor(Math.random() * 25) + 75 // 75-100%
  }));
};

// Generate student attendance data for reports
export const generateStudentAttendanceReports = () => {
  const students = [];
  
  for (let i = 1; i <= 30; i++) {
    students.push({
      studentId: `ST${100 + i}`,
      name: `Student ${i}`,
      attendanceRate: Math.floor(Math.random() * 40) + 60, // 60-100%
      lastAttended: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      complianceScore: Math.floor(Math.random() * 30) + 70 // 70-100%
    });
  }
  
  return students;
};

// Generate analytics data
export const generateAnalyticsData = () => {
  // Overall attendance rate over time (last 10 weeks)
  const attendanceTrend = Array.from({ length: 10 }, (_, i) => ({
    week: `Week ${i + 1}`,
    rate: Math.floor(Math.random() * 30) + 70 // 70-100%
  }));
  
  // Verification methods distribution
  const verificationMethods = {
    face: Math.floor(Math.random() * 40) + 60, // 60-100%
    manual: Math.floor(Math.random() * 20), // 0-20%
    idCard: Math.floor(Math.random() * 20) // 0-20%
  };
  
  // Engagement metrics
  const engagementMetrics = {
    onTime: Math.floor(Math.random() * 30) + 70, // 70-100%
    late: Math.floor(Math.random() * 15), // 0-15%
    absent: Math.floor(Math.random() * 15) // 0-15%
  };
  
  // Course-wise attendance
  const courseAttendance = courses.map(course => ({
    courseId: course.code,
    courseName: course.title,
    attendanceRate: Math.floor(Math.random() * 30) + 70 // 70-100%
  }));
  
  return {
    overview: {
      totalStudents: courses.reduce((sum, course) => sum + course.totalStudents, 0),
      totalCourses: courses.length,
      totalSessions: Math.floor(Math.random() * 50) + 50, // 50-100 sessions
      averageAttendance: Math.floor(Math.random() * 20) + 80, // 80-100%
      complianceRate: Math.floor(Math.random() * 15) + 85 // 85-100%
    },
    attendanceTrend,
    verificationMethods,
    engagementMetrics,
    courseAttendance
  };
};

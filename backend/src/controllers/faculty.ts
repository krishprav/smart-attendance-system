import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth';

// Sample data - replace with actual database queries in production
const sampleClasses = [
  {
    id: 'cls-101',
    code: 'CS101',
    name: 'Introduction to Programming',
    department: 'Computer Science',
    semester: 'Spring 2025',
    totalStudents: 45,
    sections: ['A', 'B'],
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
    sections: ['A', 'C'],
    sessions: [
      {
        id: 'cs201-1',
        subject: 'Data Structures',
        code: 'CS201',
        date: '2025-04-16',
        startTime: '1:00 PM',
        endTime: '2:30 PM',
        location: 'Room 305',
        status: 'upcoming',
        totalStudents: 38,
      },
    ],
  },
  {
    id: 'cls-301',
    code: 'CS3033',
    name: 'Compiler Design',
    department: 'Computer Science',
    semester: 'VI',
    totalStudents: 120,
    sections: ['A', 'B', 'C', 'D'],
    sessions: [
      {
        id: 'cs3033-1',
        subject: 'Compiler Design',
        code: 'CS3033',
        date: '2025-04-17',
        startTime: '9:30 AM',
        endTime: '11:00 AM',
        location: 'LH-102',
        status: 'upcoming',
        totalStudents: 120,
      },
    ],
  },
];

// Get all faculty classes
export const getFacultyClasses = async (req: AuthRequest, res: Response) => {
  try {
    // In a real app, you would query the database for classes taught by this faculty
    // const classes = await Class.find({ faculty: req.user.id });
    
    res.status(200).json({
      success: true,
      count: sampleClasses.length,
      data: sampleClasses
    });
  } catch (error) {
    console.error('Error getting faculty classes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get a single faculty class by ID
export const getFacultyClassById = async (req: AuthRequest, res: Response) => {
  try {
    const classId = req.params.id;
    
    // In a real app, you would query the database for this specific class
    // const classData = await Class.findOne({ _id: classId, faculty: req.user.id });
    
    const classData = sampleClasses.find(c => c.id === classId);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: classData
    });
  } catch (error) {
    console.error('Error getting faculty class:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all faculty sessions
export const getFacultySessions = async (req: AuthRequest, res: Response) => {
  try {
    // In a real app, you would query the database for sessions taught by this faculty
    // const sessions = await Session.find({ faculty: req.user.id });
    
    // Flatten all sessions from all classes
    const sessions = sampleClasses.flatMap(c => 
      c.sessions.map(s => ({
        ...s,
        className: c.name,
        department: c.department,
        semester: c.semester
      }))
    );
    
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    console.error('Error getting faculty sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get a single faculty session by ID
export const getFacultySessionById = async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = req.params.id;
    
    // In a real app, you would query the database for this specific session
    // const session = await Session.findOne({ _id: sessionId, faculty: req.user.id });
    
    // Find the session in our sample data
    let foundSession = null;
    let foundClass = null;
    
    for (const classData of sampleClasses) {
      const session = classData.sessions.find(s => s.id === sessionId);
      if (session) {
        foundSession = session;
        foundClass = classData;
        break;
      }
    }
    
    if (!foundSession || !foundClass) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Combine session and class data
    const sessionData = {
      ...foundSession,
      className: foundClass.name,
      department: foundClass.department,
      semester: foundClass.semester,
      sections: foundClass.sections
    };
    
    res.status(200).json({
      success: true,
      data: sessionData
    });
  } catch (error) {
    console.error('Error getting faculty session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create a new faculty session
export const createFacultySession = async (req: AuthRequest, res: Response) => {
  try {
    const { courseCode, date, startTime, endTime, location, sections } = req.body;
    
    // Validate required fields
    if (!courseCode || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide courseCode, date, startTime, and endTime'
      });
    }
    
    // In a real app, you would create a new session in the database
    // const session = await Session.create({
    //   courseCode,
    //   date,
    //   startTime,
    //   endTime,
    //   location,
    //   sections,
    //   faculty: req.user.id
    // });
    
    // For demo, create a mock session
    const sessionId = `${courseCode}-${Date.now()}`;
    const newSession = {
      id: sessionId,
      code: courseCode,
      date,
      startTime,
      endTime,
      location: location || 'Default Room',
      status: 'upcoming',
      totalStudents: 45,
      sections: sections || ['A', 'B']
    };
    
    res.status(201).json({
      success: true,
      data: newSession
    });
  } catch (error) {
    console.error('Error creating faculty session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update a faculty session
export const updateFacultySession = async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = req.params.id;
    const updateData = req.body;
    
    // In a real app, you would update the session in the database
    // const session = await Session.findOneAndUpdate(
    //   { _id: sessionId, faculty: req.user.id },
    //   updateData,
    //   { new: true, runValidators: true }
    // );
    
    // For demo, return a mock updated session
    res.status(200).json({
      success: true,
      data: {
        id: sessionId,
        ...updateData,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating faculty session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// End a faculty session
export const endFacultySession = async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = req.params.id;
    
    // In a real app, you would update the session status in the database
    // const session = await Session.findOneAndUpdate(
    //   { _id: sessionId, faculty: req.user.id },
    //   { status: 'completed', endedAt: new Date() },
    //   { new: true }
    // );
    
    // For demo, return a mock ended session
    res.status(200).json({
      success: true,
      data: {
        id: sessionId,
        status: 'completed',
        endedAt: new Date().toISOString(),
        message: 'Session ended successfully'
      }
    });
  } catch (error) {
    console.error('Error ending faculty session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get faculty analytics
export const getFacultyAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    // In a real app, you would query the database for analytics data
    
    // For demo, return mock analytics data
    const analyticsData = {
      overview: {
        totalStudents: 270,
        totalCourses: 5,
        totalSessions: 87,
        averageAttendance: 85,
        complianceRate: 92
      },
      trends: [
        { week: 'Week 1', rate: 78 },
        { week: 'Week 2', rate: 82 },
        { week: 'Week 3', rate: 85 },
        { week: 'Week 4', rate: 81 },
        { week: 'Week 5', rate: 87 },
        { week: 'Week 6', rate: 90 },
        { week: 'Week 7', rate: 88 },
        { week: 'Week 8', rate: 92 },
        { week: 'Week 9', rate: 89 },
        { week: 'Week 10', rate: 91 }
      ],
      classes: sampleClasses.map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        attendanceRate: Math.floor(75 + Math.random() * 20),
        sessionCount: c.sessions.length,
        studentCount: c.totalStudents
      }))
    };
    
    res.status(200).json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error('Error getting faculty analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get analytics for a specific class
export const getFacultyClassAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const classId = req.params.id;
    
    // In a real app, you would query the database for class-specific analytics
    
    // Find the class in our sample data
    const classData = sampleClasses.find(c => c.id === classId);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // For demo, return mock class analytics data
    const classAnalytics = {
      id: classData.id,
      code: classData.code,
      name: classData.name,
      overview: {
        totalStudents: classData.totalStudents,
        totalSessions: classData.sessions.length,
        averageAttendance: Math.floor(75 + Math.random() * 20),
        complianceRate: Math.floor(80 + Math.random() * 15)
      },
      trends: [
        { week: 'Week 1', rate: Math.floor(70 + Math.random() * 25) },
        { week: 'Week 2', rate: Math.floor(70 + Math.random() * 25) },
        { week: 'Week 3', rate: Math.floor(70 + Math.random() * 25) },
        { week: 'Week 4', rate: Math.floor(70 + Math.random() * 25) },
        { week: 'Week 5', rate: Math.floor(70 + Math.random() * 25) }
      ],
      sessions: classData.sessions.map(s => ({
        id: s.id,
        date: s.date,
        attendanceRate: s.attendancePercentage || Math.floor(70 + Math.random() * 25)
      }))
    };
    
    res.status(200).json({
      success: true,
      data: classAnalytics
    });
  } catch (error) {
    console.error('Error getting class analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get analytics for a specific student
export const getFacultyStudentAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.params.id;
    
    // In a real app, you would query the database for student-specific analytics
    
    // For demo, return mock student analytics data
    const studentAnalytics = {
      id: studentId,
      name: 'Student Name', // This would come from the database
      overview: {
        totalClasses: 5,
        totalSessions: 45,
        attendanceRate: Math.floor(70 + Math.random() * 25),
        complianceRate: Math.floor(75 + Math.random() * 20)
      },
      trends: [
        { month: 'January', rate: Math.floor(70 + Math.random() * 25) },
        { month: 'February', rate: Math.floor(70 + Math.random() * 25) },
        { month: 'March', rate: Math.floor(70 + Math.random() * 25) },
        { month: 'April', rate: Math.floor(70 + Math.random() * 25) }
      ],
      classes: sampleClasses.map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        attendanceRate: Math.floor(70 + Math.random() * 25),
        sessionCount: c.sessions.length
      }))
    };
    
    res.status(200).json({
      success: true,
      data: studentAnalytics
    });
  } catch (error) {
    console.error('Error getting student analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get faculty reports
export const getFacultyReports = async (req: AuthRequest, res: Response) => {
  try {
    // In a real app, you would query the database for reports
    
    // For demo, return mock reports data
    const reportsData = {
      attendance: sampleClasses.map(c => ({
        courseId: c.code,
        attendanceRate: Math.floor(75 + Math.random() * 20),
        sessionCount: c.sessions.length,
        studentCount: c.totalStudents
      })),
      compliance: sampleClasses.map(c => ({
        courseId: c.code,
        idCardCompliance: Math.floor(80 + Math.random() * 15),
        phoneCompliance: Math.floor(75 + Math.random() * 20),
        overallCompliance: Math.floor(78 + Math.random() * 18)
      })),
      students: Array.from({ length: 10 }, (_, i) => ({
        studentId: `STU${1000 + i}`,
        name: `Student ${i + 1}`,
        attendanceRate: Math.floor(70 + Math.random() * 25),
        lastAttended: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        complianceScore: Math.floor(75 + Math.random() * 20)
      }))
    };
    
    res.status(200).json({
      success: true,
      data: reportsData
    });
  } catch (error) {
    console.error('Error getting faculty reports:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Generate a faculty report
export const generateFacultyReport = async (req: AuthRequest, res: Response) => {
  try {
    const { reportType, dateRange, courseFilter } = req.body;
    
    // Validate required fields
    if (!reportType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reportType'
      });
    }
    
    // In a real app, you would generate a report and save it to the database
    
    // For demo, return a mock report
    const reportId = `${reportType}-${Date.now()}`;
    const report = {
      id: reportId,
      type: reportType,
      dateRange: dateRange || 'month',
      courseFilter: courseFilter || 'all',
      generatedAt: new Date().toISOString(),
      status: 'completed',
      downloadUrl: `/api/faculty/reports/${reportId}/download`
    };
    
    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error generating faculty report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

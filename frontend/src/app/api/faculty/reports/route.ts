// API route for faculty reports
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const facultyEmail = url.searchParams.get('email');
    const courseCode = url.searchParams.get('courseCode');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    // Validate parameters
    if (!facultyEmail) {
      return NextResponse.json(
        { error: 'Faculty email is required' },
        { status: 400 }
      );
    }
    
    // Get faculty ID
    const facultyResult = await query(
      'SELECT id, name, department FROM faculty WHERE email = $1',
      [facultyEmail]
    );
    
    if (facultyResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Faculty not found' },
        { status: 404 }
      );
    }
    
    const faculty = facultyResult.rows[0];
    
    // Build the query for attendance reports
    let reportsQuery = `
      SELECT 
        c.code as course_code,
        c.title as course_title,
        s.date,
        s.section,
        COUNT(a.id) as total_students,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        s.id as session_id
      FROM 
        sessions s
      JOIN 
        courses c ON s.course_id = c.id
      LEFT JOIN 
        attendance a ON s.id = a.session_id
      WHERE 
        s.faculty_id = $1
    `;
    
    const params = [faculty.id];
    let paramIndex = 2;
    
    // Add course filter if provided
    if (courseCode) {
      reportsQuery += ` AND c.code = $${paramIndex}`;
      params.push(courseCode);
      paramIndex++;
    }
    
    // Add date range filters if provided
    if (startDate) {
      reportsQuery += ` AND s.date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      reportsQuery += ` AND s.date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    // Group by and order by
    reportsQuery += `
      GROUP BY 
        c.code, c.title, s.date, s.section, s.id
      ORDER BY 
        s.date DESC, c.code
    `;
    
    const reportsResult = await query(reportsQuery, params);
    
    // If no reports found in the database, generate mock data
    if (reportsResult.rows.length === 0) {
      // Generate mock data for demonstration
      const mockReports = generateMockReports(faculty.name, courseCode, startDate, endDate);
      
      return NextResponse.json({
        faculty: {
          name: faculty.name,
          email: facultyEmail,
          department: faculty.department
        },
        reports: mockReports,
        isMockData: true
      });
    }
    
    return NextResponse.json({
      faculty: {
        name: faculty.name,
        email: facultyEmail,
        department: faculty.department
      },
      reports: reportsResult.rows,
      isMockData: false
    });
  } catch (error) {
    console.error('Error fetching faculty reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate mock reports
function generateMockReports(facultyName: string, courseCode?: string | null, startDate?: string | null, endDate?: string | null) {
  // Default date range if not provided
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const end = endDate ? new Date(endDate) : new Date();
  
  // Course codes based on faculty name
  let courseCodes = ['CS3033', 'CS3023', 'CS3059', 'CS3071'];
  if (courseCode) {
    courseCodes = courseCodes.filter(code => code === courseCode);
  }
  
  // Generate mock reports
  const mockReports = [];
  
  // Generate a report for each course and each day in the date range
  for (const code of courseCodes) {
    // Generate 2-3 sessions per course
    const sessionCount = 2 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < sessionCount; i++) {
      // Random date within the range
      const dayOffset = Math.floor(Math.random() * ((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));
      const sessionDate = new Date(start.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      
      // Random attendance numbers
      const totalStudents = 30 + Math.floor(Math.random() * 20);
      const presentCount = Math.floor(totalStudents * (0.7 + Math.random() * 0.2));
      const lateCount = Math.floor((totalStudents - presentCount) * 0.5);
      const absentCount = totalStudents - presentCount - lateCount;
      
      mockReports.push({
        course_code: code,
        course_title: getCourseTitleFromCode(code),
        date: sessionDate.toISOString().split('T')[0],
        section: code.startsWith('CS') ? 'A' : 'C',
        total_students: totalStudents,
        present_count: presentCount,
        late_count: lateCount,
        absent_count: absentCount,
        session_id: `mock-${code}-${i}`
      });
    }
  }
  
  // Sort by date (newest first)
  mockReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return mockReports;
}

// Helper function to get course title from code
function getCourseTitleFromCode(code: string): string {
  const courseTitles: Record<string, string> = {
    'CS3033': 'Database Management Systems',
    'CS3023': 'Computer Networks',
    'CS3059': 'Web Technologies',
    'CS3071': 'Machine Learning',
    'EC3033': 'Digital Signal Processing',
    'EC3061': 'VLSI Design',
    'EC3072': 'Wireless Communication'
  };
  
  return courseTitles[code] || 'Unknown Course';
}

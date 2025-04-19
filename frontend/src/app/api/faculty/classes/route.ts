// API route for faculty classes
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getClassesForDayAndSection } from '@/data/timetableData';

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const date = url.searchParams.get('date');
    const facultyEmail = url.searchParams.get('email');

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

    // Get classes for the faculty
    let classesQuery = `
      SELECT
        s.id as session_id,
        c.code as course_code,
        c.title as course_title,
        s.date,
        s.start_time,
        s.end_time,
        s.location,
        s.section,
        f.name as instructor
      FROM
        sessions s
      JOIN
        courses c ON s.course_id = c.id
      JOIN
        faculty f ON s.faculty_id = f.id
      WHERE
        s.faculty_id = $1
    `;

    const params = [faculty.id];

    // Add date filter if provided
    if (date) {
      classesQuery += ' AND s.date = $2';
      params.push(date);
    } else {
      // Default to today's date
      const today = new Date().toISOString().split('T')[0];
      classesQuery += ' AND s.date = $2';
      params.push(today);
    }

    classesQuery += ' ORDER BY s.date, s.start_time';

    const classesResult = await query(classesQuery, params);

    // If no classes found in the database, use the timetable data
    if (classesResult.rows.length === 0) {
      // Get the day of the week
      const targetDate = date ? new Date(date) : new Date();
      const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

      // Get classes from the timetable
      const timetableClasses = getClassesForDayAndSection(dayOfWeek, null, 'VI', null);

      // Filter classes for the faculty (based on instructor name)
      const facultyClasses = timetableClasses.filter(cls =>
        cls.instructor.toLowerCase().includes(faculty.name.toLowerCase().split(' ')[1]) ||
        cls.instructor.toLowerCase().includes(faculty.name.toLowerCase().split(' ')[0])
      );

      // Format the classes
      const formattedClasses = facultyClasses.map(cls => ({
        session_id: `timetable-${cls.id}`,
        course_code: cls.courseCode,
        course_title: cls.courseName,
        date: targetDate.toISOString().split('T')[0],
        start_time: cls.startTime,
        end_time: cls.endTime,
        location: cls.room,
        section: cls.section,
        instructor: cls.instructor
      }));

      return NextResponse.json({
        faculty: {
          name: faculty.name,
          email: facultyEmail,
          department: faculty.department
        },
        classes: formattedClasses
      });
    }

    return NextResponse.json({
      faculty: {
        name: faculty.name,
        email: facultyEmail,
        department: faculty.department
      },
      classes: classesResult.rows
    });
  } catch (error) {
    console.error('Error fetching faculty classes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

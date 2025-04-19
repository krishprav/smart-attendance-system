// Centralized session data store for faculty and student portals
// Now using real data from IIIT Senapati, Manipur Jan-May 2025 timetable

import { courses } from './courseData';
import { classSchedule } from './timetableData';

export interface Session {
  id: string;
  courseCode: string;
  title: string;
  faculty: string;
  date: string; // ISO format
  time: string; // e.g., '10:00 AM - 11:00 AM'
  location: string;
  description?: string;
  section?: string;
  semester?: string;
  program?: string;
  attendanceStatus?: 'pending' | 'completed' | 'in-progress';
  attendanceCount?: number;
  totalStudents?: number;
}

// Helper function to get the course title from course code
const getCourseTitle = (courseCode: string): string => {
  const course = courses.find(c => c.code === courseCode);
  return course ? course.title : 'Unknown Course';
};

// Helper function to get a random instructor for a course
const getInstructorForCourse = (courseCode: string): string => {
  const course = courses.find(c => c.code === courseCode);
  if (!course || !course.instructors.length) return 'TBD';
  
  // Get the primary instructor (first one in the list)
  return course.instructors[0];
};

// Generate sessions for the current week based on the timetable
export const generateSessionsForWeek = (): Session[] => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const sessionsData: Session[] = [];
  
  // Get the dates for Monday-Friday of the current week
  const mondayDate = new Date(now);
  mondayDate.setDate(now.getDate() - currentDay + 1); // Set to Monday
  
  // Days of the week
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Generate sessions for each weekday
  for (let i = 1; i <= 5; i++) { // i=1 (Monday) to i=5 (Friday)
    const currentDate = new Date(mondayDate);
    currentDate.setDate(mondayDate.getDate() + i - 1);
    const dateString = currentDate.toISOString().split('T')[0];
    const dayName = days[i];
    
    // Get classes for this day
    const dayClasses = classSchedule.filter(cls => cls.day === dayName);
    
    // Create sessions for each class
    dayClasses.forEach(cls => {
      const session: Session = {
        id: `${dateString}-${cls.courseCode}-${cls.section}-${cls.startTime}`,
        courseCode: cls.courseCode,
        title: cls.courseName || getCourseTitle(cls.courseCode),
        faculty: cls.instructor || getInstructorForCourse(cls.courseCode),
        date: dateString,
        time: `${cls.startTime} - ${cls.endTime}`,
        location: cls.room,
        section: cls.section,
        semester: cls.semester,
        program: cls.program,
        attendanceStatus: 'pending',
        attendanceCount: 0,
        totalStudents: Math.floor(Math.random() * 40) + 20 // Random number between 20-60 students
      };
      
      sessionsData.push(session);
    });
  }
  
  // Check for special Saturday schedules
  const saturdayDate = new Date(mondayDate);
  saturdayDate.setDate(mondayDate.getDate() + 5); // Saturday
  const saturdayDateString = saturdayDate.toISOString().split('T')[0];
  
  // Special Saturday classes based on the PDF (page 3)
  const specialSaturdays = [
    { date: "2025-01-25", schedule: "Monday" },
    { date: "2025-02-01", schedule: "Tuesday" },
    { date: "2025-02-15", schedule: "Wednesday" },
    { date: "2025-03-01", schedule: "Thursday" },
    { date: "2025-03-15", schedule: "Friday" },
    { date: "2025-03-29", schedule: "Monday" },
    { date: "2025-04-05", schedule: "Tuesday" },
    { date: "2025-04-19", schedule: "Wednesday" }
  ];
  
  // Find if this Saturday has a special schedule
  const specialSaturday = specialSaturdays.find(s => s.date === saturdayDateString);
  if (specialSaturday) {
    const dayName = specialSaturday.schedule;
    const saturdayClasses = classSchedule.filter(cls => cls.day === dayName);
    
    // Create sessions for special Saturday
    saturdayClasses.forEach(cls => {
      const session: Session = {
        id: `${saturdayDateString}-${cls.courseCode}-${cls.section}-${cls.startTime}-special`,
        courseCode: cls.courseCode,
        title: cls.courseName || getCourseTitle(cls.courseCode),
        faculty: cls.instructor || getInstructorForCourse(cls.courseCode),
        date: saturdayDateString,
        time: `${cls.startTime} - ${cls.endTime}`,
        location: cls.room,
        section: cls.section,
        semester: cls.semester,
        program: cls.program,
        description: `Special Saturday class (${specialSaturday.schedule} Schedule)`,
        attendanceStatus: 'pending',
        attendanceCount: 0,
        totalStudents: Math.floor(Math.random() * 40) + 20 // Random number between 20-60 students
      };
      
      sessionsData.push(session);
    });
  }
  
  return sessionsData;
};

// Generate past sessions data for reporting
export const generatePastSessionsData = (count: number = 30): Session[] => {
  const sessions: Session[] = [];
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day
  
  // Generate random past days, avoiding weekends by default
  for (let i = 0; i < count; i++) {
    // Random date between 1-30 days ago
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    const sessionDate = new Date(now.getTime() - (daysAgo * oneDay));
    const day = sessionDate.getDay();
    
    // Skip weekends (0 = Sunday, 6 = Saturday) unless it's a special Saturday
    if (day === 0 || (day === 6 && !isSpecialSaturday(sessionDate))) {
      i--; // Try again
      continue;
    }
    
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
    const dateString = sessionDate.toISOString().split('T')[0];
    
    // If it's a Saturday, check if it's a special Saturday
    let dayClasses = [];
    if (day === 6) {
      // Get the special schedule for this Saturday if it exists
      const scheduleDay = getSpecialSaturdaySchedule(sessionDate);
      if (scheduleDay) {
        dayClasses = classSchedule.filter(cls => cls.day === scheduleDay);
      }
    } else {
      // Regular weekday
      dayClasses = classSchedule.filter(cls => cls.day === dayName);
    }
    
    // Pick a random class from that day's schedule
    if (dayClasses.length > 0) {
      const randomClass = dayClasses[Math.floor(Math.random() * dayClasses.length)];
      
      // Generate random attendance data
      const totalStudents = Math.floor(Math.random() * 40) + 20; // 20-60 students
      const attendanceCount = Math.floor(Math.random() * totalStudents);
      
      const session: Session = {
        id: `${dateString}-${randomClass.courseCode}-${randomClass.section}-${randomClass.startTime}-past`,
        courseCode: randomClass.courseCode,
        title: randomClass.courseName || getCourseTitle(randomClass.courseCode),
        faculty: randomClass.instructor || getInstructorForCourse(randomClass.courseCode),
        date: dateString,
        time: `${randomClass.startTime} - ${randomClass.endTime}`,
        location: randomClass.room,
        section: randomClass.section,
        semester: randomClass.semester,
        program: randomClass.program,
        attendanceStatus: 'completed',
        attendanceCount: attendanceCount,
        totalStudents: totalStudents
      };
      
      sessions.push(session);
    } else {
      i--; // Try again if no classes found for this day
    }
  }
  
  return sessions;
};

// Helper function to check if a date is a special Saturday
function isSpecialSaturday(date: Date): boolean {
  const dateString = date.toISOString().split('T')[0];
  
  // Special Saturday classes based on the PDF (page 3)
  const specialSaturdays = [
    "2025-01-25", "2025-02-01", "2025-02-15", "2025-03-01", 
    "2025-03-15", "2025-03-29", "2025-04-05", "2025-04-19"
  ];
  
  return specialSaturdays.includes(dateString);
}

// Helper function to get the schedule for a special Saturday
function getSpecialSaturdaySchedule(date: Date): string | null {
  const dateString = date.toISOString().split('T')[0];
  
  // Special Saturday classes based on the PDF (page 3)
  const specialSaturdaysMap: {[key: string]: string} = {
    "2025-01-25": "Monday",
    "2025-02-01": "Tuesday",
    "2025-02-15": "Wednesday",
    "2025-03-01": "Thursday",
    "2025-03-15": "Friday",
    "2025-03-29": "Monday",
    "2025-04-05": "Tuesday",
    "2025-04-19": "Wednesday"
  };
  
  return specialSaturdaysMap[dateString] || null;
}

// Generate the current sessions (both upcoming and past)
export const sessions: Session[] = [
  ...generateSessionsForWeek(),
  ...generatePastSessionsData(20)
];

// Export default for compatibility
export default {
  sessions,
  generateSessionsForWeek,
  generatePastSessionsData
};

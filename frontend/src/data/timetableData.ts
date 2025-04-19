// Real data extracted from Time Table Jan-May 2025
// This represents the actual class schedule for IIIT Manipur

import { getStudentByRollNumber } from './studentData';
import { courses as coursesData } from './courseData';

export interface TimeSlot {
  id: string;
  label: string;
  start: string;
  end: string;
}

export interface ClassScheduleEntry {
  id: string;
  day: string; // e.g., 'Monday', 'Tuesday', etc.
  courseCode: string;
  courseName: string;
  instructor: string;
  room: string;
  section: string;
  semester: string;
  program: string;
  startTime: string; // e.g., '09:00'
  endTime: string; // e.g., '10:30'
  type: 'lecture' | 'lab' | 'tutorial';
}

// Define time slots based on the timetable
export const timeSlots: TimeSlot[] = [
  { id: 'slot1', label: '09:00 - 09:55', start: '09:00', end: '09:55' },
  { id: 'slot2', label: '10:00 - 10:55', start: '10:00', end: '10:55' },
  { id: 'slot3', label: '11:00 - 11:55', start: '11:00', end: '11:55' },
  { id: 'slot4', label: '12:00 - 12:55', start: '12:00', end: '12:55' },
  { id: 'slot5', label: '01:00 - 01:55', start: '13:00', end: '13:55' },
  { id: 'slot6', label: '02:00 - 02:55', start: '14:00', end: '14:55' },
  { id: 'slot7', label: '03:00 - 03:55', start: '15:00', end: '15:55' },
  { id: 'slot8', label: '04:00 - 04:55', start: '16:00', end: '16:55' },
  { id: 'slot9', label: '05:00 - 06:30', start: '17:00', end: '18:30' }
];

// Special Saturday schedule based on the timetable
export const specialSaturdays = [
  { date: '2025-01-25', follows: 'Monday' },
  { date: '2025-02-01', follows: 'Tuesday' },
  { date: '2025-02-15', follows: 'Wednesday' },
  { date: '2025-03-01', follows: 'Thursday' },
  { date: '2025-03-15', follows: 'Friday' },
  { date: '2025-03-29', follows: 'Monday' },
  { date: '2025-04-05', follows: 'Tuesday' },
  { date: '2025-04-19', follows: 'Wednesday' },
  { date: '2025-04-22', follows: 'Friday' }, // Tuesday following Friday
  { date: '2025-04-24', follows: 'Friday' }  // Thursday following Friday
];

// Helper function to check if a date is a special Saturday and what day it follows
export const isSpecialSaturday = (date: Date): string | null => {
  const dateStr = date.toISOString().split('T')[0];
  const specialSaturday = specialSaturdays.find(s => s.date === dateStr);
  return specialSaturday ? specialSaturday.follows : null;
};

// Import the timetable JSON data
const timetableJSON: any = {
  "institute": {
    "name": "Indian Institute of Information Technology Senapati, Manipur",
    "address": "Mantripukhri, Imphal – 795002, Manipur, India",
    "website": "www.iiitmanipur.ac.in",
    "type": "Institute of National Importance (Government of India)"
  },
  "timetable": {
    "academic_year": "2024-25",
    "session": "Jan-May 2025",
    "days": [
      {
        "day": "MONDAY",
        "entries": [
          {
            "semester": "VI",
            "section": "A",
            "room": "",
            "schedule": {
              "02:00-02:55": "CS3023",
              "03:00-03:55": "CS3059",
              "04:00-04:55": "CS3033"
            }
          },
          {
            "semester": "VI",
            "section": "B",
            "room": "R-8",
            "schedule": {
              "09:00-09:55": "CS3033",
              "10:00-10:55": "CS3071",
              "11:00-11:55": "CS3023",
              "04:00-04:55": "CS3059"
            }
          },
          {
            "semester": "VI",
            "section": "C",
            "room": "R-5/R-9",
            "schedule": {
              "09:00-09:55": { "course": "EC3061", "room": "R-5" },
              "10:00-10:55": { "course": "EC3072", "room": "R-5" },
              "11:00-11:55": { "course": "EC3033", "room": "R-9" }
            }
          },
          {
            "semester": "VI",
            "section": "D",
            "room": "R-9",
            "schedule": {
              "09:00-09:55": "EC3054",
              "02:00-02:55": "EC3072",
              "03:00-03:55": "EC3033"
            }
          }
        ]
      },
      {
        "day": "TUESDAY",
        "entries": [
          {
            "semester": "VI",
            "section": "A",
            "room": "R-8",
            "schedule": {
              "09:00-09:55": "CS3023",
              "10:00-10:55": "CS3071",
              "02:00-02:55": "CS3059",
              "03:00-03:55": "EC2081"
            }
          },
          {
            "semester": "VI",
            "section": "B",
            "room": "",
            "schedule": {
              "02:00-02:55": "CS3033",
              "03:00-03:55": "CS3059",
              "04:00-04:55": "CS3023"
            }
          },
          {
            "semester": "VI",
            "section": "C",
            "room": "R-4/R-5",
            "schedule": {
              "09:00-09:55": { "course": "EC3046", "room": "R-4" },
              "11:00-11:55": { "course": "EC3072", "room": "R-5" },
              "02:00-02:55": "EC3161 (Gr I)"
            }
          },
          {
            "semester": "VI",
            "section": "D",
            "room": "R-9",
            "schedule": {
              "09:00-09:55": "EC3054",
              "10:00-10:55": "EC3072",
              "11:00-11:55": "EC3033"
            }
          }
        ]
      },
      {
        "day": "WEDNESDAY",
        "entries": [
          {
            "semester": "VI",
            "section": "A",
            "room": "R-8/AUD",
            "schedule": {
              "09:00-09:55": { "course": "CS3033", "room": "R-8" },
              "10:00-10:55": { "course": "CS3071", "room": "R-8" },
              "11:00-11:55": { "course": "CS3053", "room": "AUD" },
              "02:00-02:55": "CS3071"
            }
          },
          {
            "semester": "VI",
            "section": "B",
            "room": "",
            "schedule": {
              "02:00-02:55": "CS3052"
            }
          },
          {
            "semester": "VI",
            "section": "C",
            "room": "R-4",
            "schedule": {
              "09:00-09:55": "EC3061",
              "03:00-03:55": "EC3033"
            }
          },
          {
            "semester": "VI",
            "section": "D",
            "room": "R-9",
            "schedule": {
              "09:00-09:55": "EC3053",
              "02:00-02:55": "EC3172"
            }
          }
        ]
      },
      {
        "day": "THURSDAY",
        "entries": [
          {
            "semester": "VI",
            "section": "A",
            "room": "AUD",
            "schedule": {
              "09:00-09:55": "CS3053",
              "02:00-02:55": "CS3071",
              "03:00-03:55": "CS3023"
            }
          },
          {
            "semester": "VI",
            "section": "B",
            "room": "R-8",
            "schedule": {
              "10:00-10:55": "CS3023",
              "11:00-11:55": "CS3071",
              "12:00-12:55": "CS3033",
              "03:00-03:55": "CS3052"
            }
          },
          {
            "semester": "VI",
            "section": "C",
            "room": "R-4/R-9",
            "schedule": {
              "09:00-09:55": { "course": "EC3046", "room": "R-4" },
              "11:00-11:55": { "course": "EC3072", "room": "R-9" },
              "02:00-02:55": "EC3172"
            }
          },
          {
            "semester": "VI",
            "section": "D",
            "room": "R-9",
            "schedule": {
              "09:00-09:55": "EC3053",
              "03:00-03:55": "EC3033"
            }
          }
        ]
      },
      {
        "day": "FRIDAY",
        "entries": [
          {
            "semester": "VI",
            "section": "A",
            "room": "R-7",
            "schedule": {
              "10:00-10:55": "CS3071",
              "11:00-11:55": "CS3059",
              "12:00-12:55": "CS3033",
              "02:00-02:55": "CS3053"
            }
          },
          {
            "semester": "VI",
            "section": "B",
            "room": "R-8",
            "schedule": {
              "09:00-09:55": "CS3059",
              "10:00-10:55": "CS3052",
              "12:00-12:55": "CS3071",
              "03:00-03:55": "CS3071"
            }
          },
          {
            "semester": "VI",
            "section": "C",
            "room": "R-6",
            "schedule": {
              "09:00-09:55": "EC3033",
              "10:00-10:55": "EC3046",
              "11:00-11:55": "EC3061",
              "02:00-02:55": "EC3161 (Gr II)"
            }
          },
          {
            "semester": "VI",
            "section": "D",
            "room": "R-7",
            "schedule": {
              "09:00-09:55": "EC3054",
              "10:00-10:55": "EC3153",
              "04:00-04:55": "EC3053"
            }
          }
        ]
      }
    ]
  }
};

// Generate class schedule entries from the timetable data
export const generateClassSchedule = (): ClassScheduleEntry[] => {
  const entries: ClassScheduleEntry[] = [];
  let entryId = 1;

  // Process the timetable data for VI semester
  const timetableData = {
    days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    sections: ['A', 'B', 'C', 'D'],
    programs: ['CSE', 'CSE-AID', 'ECE', 'ECE-VLSI']
  };

  // Process each day in the timetable
  timetableData.days.forEach(day => {
    // Get the day's schedule from the JSON data
    const daySchedule = timetableJSON.timetable.days.find((d: any) => d.day === day);
    if (!daySchedule) return;

    // Process each semester VI entry
    daySchedule.entries
      .filter((entry: any) => entry.semester === 'VI')
      .forEach((entry: any) => {
        const section = entry.section;
        const room = entry.room || '';

        // Process each time slot in the schedule
        Object.entries(entry.schedule).forEach(([timeSlot, courseInfo]) => {
          // Skip lunch slots
          if (timeSlot === '12:00-12:55' && courseInfo === 'LUNCH') return;
          if (!courseInfo) return; // Skip empty slots

          // Parse the time slot
          const [startTime, endTime] = timeSlot.split('-');
          
          // Format the course info
          let courseCode, courseName, instructor, courseRoom;
          
          if (typeof courseInfo === 'object' && courseInfo !== null && 'course' in courseInfo) {
            courseCode = courseInfo.course as string;
            courseRoom = (courseInfo as any).room || room;
          } else if (typeof courseInfo === 'string') {
            courseCode = courseInfo;
            courseRoom = room;
          } else {
            return; // Skip invalid entries
          }

          // Find the course details
          const courseDetails = findCourseDetails(courseCode);
          courseName = courseDetails?.title || courseCode;
          instructor = courseDetails?.instructors?.[0] || 'Faculty';

          // Determine the program based on the course code and section
          let program = 'CSE';
          if (courseCode.startsWith('EC')) {
            program = section === 'D' ? 'ECE-VLSI' : 'ECE';
          } else if (section === 'B' && courseCode.includes('AID')) {
            program = 'CSE-AID';
          }

          // Determine the type of class
          let type: 'lecture' | 'lab' | 'tutorial' = 'lecture';
          if (courseCode.includes('Lab') || courseCode.endsWith('2')) {
            type = 'lab';
          } else if (courseCode.includes('Tutorial')) {
            type = 'tutorial';
          }

          // Create the class schedule entry
          entries.push({
            id: `class-${entryId++}`,
            day: day.charAt(0) + day.slice(1).toLowerCase(),
            courseCode,
            courseName,
            instructor,
            room: courseRoom,
            section,
            semester: 'VI',
            program,
            startTime: formatTime(startTime),
            endTime: formatTime(endTime),
            type
          });
        });
      });
  });

  return entries;
};

// Helper function to find course details
const findCourseDetails = (courseCode: string) => {
  return coursesData.find((c) => c.code === courseCode);
};

// Helper function to format time (e.g., '09:00' to '09:00')
const formatTime = (time: string): string => {
  // If time is already in 24-hour format (e.g., '09:00'), return as is
  if (time.includes(':')) return time;
  
  // If time is in 12-hour format with AM/PM, convert to 24-hour
  if (time.includes('AM') || time.includes('PM')) {
    const [hourMin, period] = time.split(' ');
    const [hour, minute] = hourMin.split(':').map(Number);
    
    let hour24 = hour;
    if (period === 'PM' && hour < 12) hour24 += 12;
    if (period === 'AM' && hour === 12) hour24 = 0;
    
    return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }
  
  // If time is just an hour (e.g., '09'), add ':00'
  return `${time.padStart(2, '0')}:00`;
};

// Generate the class schedule
export const classSchedule = generateClassSchedule();

// Function to get classes for a specific day and section
export const getClassesForDayAndSection = (
  day: string | null = null,
  section: string | null = null,
  semester: string | null = null,
  program: string | null = null
): ClassScheduleEntry[] => {
  let filtered = [...classSchedule];
  
  if (day && day !== 'All') {
    filtered = filtered.filter(entry => entry.day === day);
  }
  
  if (section && section !== 'All') {
    filtered = filtered.filter(entry => 
      entry.section === section || 
      entry.section === 'All' || 
      entry.section.includes(section)
    );
  }
  
  if (semester && semester !== 'All') {
    filtered = filtered.filter(entry => 
      entry.semester === semester || 
      entry.semester === 'All'
    );
  }
  
  if (program && program !== 'All') {
    filtered = filtered.filter(entry => 
      entry.program === program || 
      entry.program === 'All' || 
      entry.program.includes(program)
    );
  }
  
  return filtered;
};

// Function to get classes for a specific student
export const getClassesForStudent = (
  studentId: string | null = null,
  program: string | null = null,
  semester: string | null = null,
  section: string | null = null
): ClassScheduleEntry[] => {
  // If studentId is provided, get the student's details
  let studentProgram = program;
  let studentSemester = semester;
  let studentSection = section;
  
  if (studentId) {
    const student = getStudentByRollNumber(studentId);
    
    if (student) {
      studentProgram = student.program;
      studentSemester = student.semester;
      studentSection = student.section;
    }
  }
  
  // Filter classes based on student's program, semester, and section
  return getClassesForDayAndSection(null, studentSection, studentSemester, studentProgram);
};

// Export all data
export default {
  timeSlots,
  specialSaturdays,
  isSpecialSaturday,
  classSchedule,
  getClassesForDayAndSection,
  getClassesForStudent
};

const express = require('express');
const router = express.Router();

// Example: Replace with real DB/model queries in production
const sampleClasses = [
  {
    id: 'cls-101',
    code: 'CS101',
    name: 'Introduction to Programming',
    department: 'Computer Science',
    semester: 'Spring 2025',
    totalStudents: 45,
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
    sessions: [
      {
        id: 'cs201-1',
        subject: 'Data Structures',
        code: 'CS201',
        date: '2025-04-17',
        startTime: '01:00 PM',
        endTime: '02:30 PM',
        location: 'Room 302',
        status: 'upcoming',
        totalStudents: 38,
      },
      {
        id: 'cs201-2',
        subject: 'Data Structures',
        code: 'CS201',
        date: '2025-04-10',
        startTime: '01:00 PM',
        endTime: '02:30 PM',
        location: 'Room 302',
        status: 'completed',
        totalStudents: 38,
        attendanceCount: 35,
        attendancePercentage: 92.1,
      },
    ],
  },
];

// GET /api/faculty/classes
router.get('/classes', (req, res) => {
  // In production, use req.user/facultyId to fetch only this faculty's classes
  res.json(sampleClasses);
});

module.exports = router;

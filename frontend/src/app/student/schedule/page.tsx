'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ClassSchedule from '@/components/schedule/ClassSchedule';
import { getClassesForStudent } from '@/data/timetableData';

export default function SchedulePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Mock student data - in a real app, this would come from the user context
  const [studentData, setStudentData] = useState({
    id: 'STU001',
    name: 'Student Name',
    program: 'CSE',
    semester: 'VI',
    section: 'A'
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    // In a real app, you would fetch the student's data here
    // and set it in the state based on their authenticated user profile
    if (user) {
      // Example: fetch student data from backend
      // const fetchStudentData = async () => {
      //   try {
      //     const response = await fetch(`/api/students/${user.id}`);
      //     const data = await response.json();
      //     setStudentData(data);
      //   } catch (error) {
      //     console.error('Error fetching student data:', error);
      //   }
      // };
      // fetchStudentData();
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Course Schedule</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Your Class Schedule</h2>
            <p className="text-gray-600">
              IIIT Senapati, Manipur - Jan-May 2025 Session
            </p>
          </div>
          <div className="mt-2 sm:mt-0 bg-blue-50 px-4 py-2 rounded-md">
            <p className="font-medium">Program: {studentData.program}</p>
            <p>Semester: {studentData.semester} | Section: {studentData.section}</p>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">
          View your class schedule for the Jan-May 2025 session. You can filter by day to see your specific classes.
          The schedule includes special Saturday classes as per the academic calendar.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ClassSchedule 
          studentId={studentData.id}
          program={studentData.program}
          semester={studentData.semester}
          section={studentData.section}
          showFilter={true}
        />
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Classes</h2>
        <UpcomingClasses 
          program={studentData.program}
          semester={studentData.semester}
          section={studentData.section}
        />
      </div>
    </div>
  );
}

// Component to show today's and tomorrow's classes
function UpcomingClasses({ program, semester, section }) {
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  
  useEffect(() => {
    // Get current day
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const todayName = days[today.getDay()];
    
    // Get next day (tomorrow)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowName = days[tomorrow.getDay()];
    
    // Check for special Saturday schedule
    const isSpecialSaturday = (date) => {
      const dateString = date.toISOString().split('T')[0];
      const specialSaturdays = {
        "2025-01-25": "Monday",
        "2025-02-01": "Tuesday",
        "2025-02-15": "Wednesday",
        "2025-03-01": "Thursday",
        "2025-03-15": "Friday",
        "2025-03-29": "Monday",
        "2025-04-05": "Tuesday",
        "2025-04-19": "Wednesday"
      };
      return specialSaturdays[dateString];
    };
    
    // Get the appropriate day name for today/tomorrow if it's a special Saturday
    const todayScheduleDay = today.getDay() === 6 ? isSpecialSaturday(today) || todayName : todayName;
    const tomorrowScheduleDay = tomorrow.getDay() === 6 ? isSpecialSaturday(tomorrow) || tomorrowName : tomorrowName;
    
    // Get classes for today and tomorrow
    const classes = getClassesForStudent(null, program, semester, section);
    const todayClasses = classes.filter(cls => cls.day === todayScheduleDay);
    const tomorrowClasses = classes.filter(cls => cls.day === tomorrowScheduleDay);
    
    // Sort by start time
    const sortedTodayClasses = [...todayClasses].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const sortedTomorrowClasses = [...tomorrowClasses].sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    // Combine with labels
    const upcoming = [
      ...sortedTodayClasses.map(cls => ({ ...cls, dayLabel: 'Today' })),
      ...sortedTomorrowClasses.map(cls => ({ ...cls, dayLabel: 'Tomorrow' }))
    ];
    
    setUpcomingClasses(upcoming);
  }, [program, semester, section]);

  if (upcomingClasses.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md">
        <p className="text-gray-500">No upcoming classes found.</p>
        <p className="text-sm text-gray-400 mt-2">Enjoy your break!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Day</th>
            <th className="border border-gray-300 px-4 py-2">Time</th>
            <th className="border border-gray-300 px-4 py-2">Course</th>
            <th className="border border-gray-300 px-4 py-2">Instructor</th>
            <th className="border border-gray-300 px-4 py-2">Room</th>
          </tr>
        </thead>
        <tbody>
          {upcomingClasses.map((cls) => (
            <tr key={`${cls.dayLabel}-${cls.id}`} className={cls.dayLabel === 'Today' ? 'bg-blue-50' : ''}>
              <td className="border border-gray-300 px-4 py-2">
                <span className="font-medium">{cls.dayLabel}</span>
                <span className="text-sm text-gray-500 ml-1">({cls.day})</span>
              </td>
              <td className="border border-gray-300 px-4 py-2">{cls.startTime} - {cls.endTime}</td>
              <td className="border border-gray-300 px-4 py-2">
                <div className="font-medium">{cls.courseCode}</div>
                <div className="text-sm text-gray-600">{cls.courseName}</div>
              </td>
              <td className="border border-gray-300 px-4 py-2">{cls.instructor}</td>
              <td className="border border-gray-300 px-4 py-2">{cls.room}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

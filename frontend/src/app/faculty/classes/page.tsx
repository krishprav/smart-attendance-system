'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { courses, Course } from '@/data/courseData';
import Link from 'next/link';
import DatePicker from '@/components/ui/DatePicker';
import { getClassesForDayAndSection, isSpecialSaturday, ClassScheduleEntry, specialSaturdays } from '@/data/timetableData';

export default function FacultyClassesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [todayClasses, setTodayClasses] = useState<Course[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [classSchedules, setClassSchedules] = useState<Record<string, ClassScheduleEntry[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  // We'll use this to store the timetable entries for debugging purposes
  const [, setTimetableEntries] = useState<ClassScheduleEntry[]>([]);

  // Faculty data - in a real app, this would come from the user context
  const facultyData = user ? {
    id: user.id || 'FAC001',
    name: user.name || 'Dr. Kabita Thaoroijam',
    department: 'Computer Science & Engineering',
    expertise: 'Data Structures, Machine Learning'
  } : {
    id: 'FAC001',
    name: 'Dr. Kabita Thaoroijam',
    department: 'Computer Science & Engineering',
    expertise: 'Data Structures, Machine Learning'
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }

    // Fetch faculty courses and schedule
    if (user) {
      const fetchFacultyClasses = () => {
        setIsLoading(true);

        // No need to filter by faculty name as we're only showing VI semester courses

        // Filter only VI semester courses as requested
        let taughtCourses = courses.filter(course => {
          // Only include VI semester courses
          return course.semester === 'VI';
        });

        // If no VI semester courses found, add some default ones
        if (taughtCourses.length === 0) {
          console.log('No VI semester courses found');
          // Include some default VI semester courses for the demo
          taughtCourses = [
            courses.find(c => c.code === 'CS3033' && c.semester === 'VI'),
            courses.find(c => c.code === 'CS3023' && c.semester === 'VI'),
            courses.find(c => c.code === 'CS3059' && c.semester === 'VI'),
            courses.find(c => c.code === 'OE3083' && c.semester === 'VI')
          ].filter(Boolean) as Course[];
        }

        // Get day information for the selected date
        const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Monday"
        const dayIndex = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Check if this is a special Saturday that follows another day's schedule
        let effectiveDay = dayName;
        if (dayIndex === 6) { // Saturday
          const specialDay = isSpecialSaturday(selectedDate);
          if (specialDay) {
            effectiveDay = specialDay; // Use the day it follows (e.g., 'Monday')
            console.log(`This is a special Saturday that follows ${specialDay}'s schedule`);
          }
        }

        // Get classes from the timetable for the effective day
        const allClassesForDay = getClassesForDayAndSection(effectiveDay, null, 'VI', null);
        console.log(`Found ${allClassesForDay.length} classes for ${effectiveDay}`);

        // Store the timetable entries for reference
        setTimetableEntries(allClassesForDay);

        // Create a map of course codes to their schedule entries
        const schedules: Record<string, ClassScheduleEntry[]> = {};

        // Group classes by course code
        allClassesForDay.forEach(entry => {
          if (!schedules[entry.courseCode]) {
            schedules[entry.courseCode] = [];
          }
          schedules[entry.courseCode].push(entry);
        });

        // Filter taught courses to only include those with classes today
        // This is used for debugging purposes
        console.log('Courses with classes today:',
          taughtCourses.filter(course => schedules[course.code] && schedules[course.code].length > 0)
            .map(c => c.code)
        );

        // If no classes found in the timetable, add some default ones for demo purposes
        if (Object.keys(schedules).length === 0) {
          console.log('No classes found in timetable for today, adding demo classes');

          // Use the first few courses as demo
          taughtCourses.slice(0, 3).forEach(course => {
            schedules[course.code] = [{
              id: `demo-${course.code}`,
              day: dayName,
              courseCode: course.code,
              courseName: course.title,
              instructor: course.instructors[0] || 'Faculty',
              room: `R-${Math.floor(Math.random() * 10)}`,
              section: course.sections[0] || 'A',
              semester: 'VI',
              program: course.program || 'CSE',
              startTime: '09:00',
              endTime: '09:55',
              type: 'lecture'
            }];
          });
        }

        // Filter classes for the selected date - only those with a schedule
        const classesForSelectedDate = taughtCourses.filter(course =>
          schedules[course.code] && schedules[course.code].length > 0
        );

        // Store the schedules in state for access in the render function
        setClassSchedules(schedules);

        setTodayClasses(classesForSelectedDate);
        setIsLoading(false);
      };

      fetchFacultyClasses();
    }
  }, [user, authLoading, router, facultyData.name, selectedDate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-900">VI Semester Classes</h1>
        <Link href="/faculty" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">VI Semester Classes for Selected Date</h2>
              <p className="text-gray-600">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="mt-3 sm:mt-0">
              <DatePicker
                selectedDate={selectedDate}
                onDateChangeAction={(date: Date) => setSelectedDate(date)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : todayClasses.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {todayClasses.map(course => {
                // Get schedule for selected date
                const dateSchedule = classSchedules[course.code] || [];

                return (
                  <div key={course.code} className="border border-gray-200 rounded-xl p-5 hover:bg-blue-50 transition-colors duration-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <div>
                        <h3 className="font-bold text-lg text-blue-900">{course.code}: {course.title}</h3>
                        <p className="text-gray-600">{course.semester} Semester | {course.program || 'Regular'}</p>
                      </div>
                      <div className="mt-3 sm:mt-0">
                        <Link
                          href={`/faculty/start-session?courseCode=${course.code}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors duration-200 inline-flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Start Session
                        </Link>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {dateSchedule.map((schedule, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center text-sm bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                          <div className="flex items-center mb-2 sm:mb-0">
                            <svg className="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span className="font-medium text-blue-800">
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                          </div>
                          <div className="flex items-center sm:ml-6">
                            <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                            <span className="text-gray-600 mr-4">
                              Room: {schedule.room}
                            </span>
                            <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                            <span className="text-gray-600 mr-4">
                              Type: {schedule.type}
                            </span>
                            <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            <span className="text-gray-600">
                              Section: {schedule.section}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Display section information for all courses */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <h4 className="font-medium text-gray-700 mb-2">Sections:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {course.sections.includes('A') && (
                          <div className="text-sm bg-blue-50 p-2 rounded">
                            <span className="font-medium">Section A:</span> {course.semester === 'VI' ? '220101001-220101071' : 'Group A'}
                          </div>
                        )}
                        {course.sections.includes('B') && (
                          <div className="text-sm bg-green-50 p-2 rounded">
                            <span className="font-medium">Section B:</span> {course.semester === 'VI' ? '220101071-22010100 & 220103001-220103040' : 'Group B'}
                          </div>
                        )}
                        {course.sections.includes('C') && (
                          <div className="text-sm bg-yellow-50 p-2 rounded">
                            <span className="font-medium">Section C:</span> {course.semester === 'VI' ? '220102001-220102056' : 'Group C'}
                          </div>
                        )}
                        {course.sections.includes('D') && (
                          <div className="text-sm bg-purple-50 p-2 rounded">
                            <span className="font-medium">Section D:</span> {course.semester === 'VI' ? '220102057-220102078 & 220104001-220104027' : 'Group D'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Students:</span> {course.sections.length * 30}
                      </div>
                      <div>
                        <Link
                          href={`/faculty/classes/${course.code}/details`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p className="text-gray-500 mb-2">No VI semester classes scheduled for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.</p>
              <button
                type="button"
                onClick={() => setSelectedDate(new Date())}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                View Today's VI Semester Classes
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Special Saturday Adjustments</h3>
        <ul className="list-disc pl-5 text-blue-700">
          {specialSaturdays.map((saturday, index) => (
            <li key={index}>
              {new Date(saturday.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              (Saturday) - {saturday.follows} Schedule
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { classSchedule, getClassesForDayAndSection, getClassesForStudent, TimeSlot, ClassScheduleEntry } from '@/data/timetableData';
import { courses } from '@/data/courseData';

// Define the shape of a class schedule entry
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

interface ClassScheduleProps {
  studentId?: string;
  program?: string;
  semester?: string;
  section?: string;
  instructor?: string;
  showFilter?: boolean;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ClassSchedule: React.FC<ClassScheduleProps> = ({
  studentId,
  program = 'All',
  semester = 'All',
  section = 'All',
  instructor,
  showFilter = true
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>(section);
  const [selectedSemester, setSelectedSemester] = useState<string>(semester);
  const [selectedProgram, setSelectedProgram] = useState<string>(program);
  const [filteredSchedule, setFilteredSchedule] = useState<ClassScheduleEntry[]>(classSchedule);

  // Available sections, semesters, and programs based on the PDF data
  const sections = ['All', 'A', 'B', 'C', 'D'];
  const semesters = ['All', 'II', 'IV', 'VI', 'VIII'];
  const programs = ['All', 'CSE', 'CSE-AID', 'ECE', 'ECE-VLSI'];

  // Filter the schedule whenever filters change
  useEffect(() => {
    let filtered = [...classSchedule];

    // Filter by day
    if (selectedDay !== 'All') {
      filtered = filtered.filter(entry => entry.day === selectedDay);
    }

    // Filter by section
    if (selectedSection !== 'All') {
      filtered = filtered.filter(entry =>
        entry.section === selectedSection ||
        entry.section === 'All' ||
        entry.section.includes(selectedSection)
      );
    }

    // Filter by semester
    if (selectedSemester !== 'All') {
      filtered = filtered.filter(entry =>
        entry.semester === selectedSemester ||
        entry.semester === 'All'
      );
    }

    // Filter by program
    if (selectedProgram !== 'All') {
      filtered = filtered.filter(entry =>
        entry.program === selectedProgram ||
        entry.program === 'All' ||
        entry.program.includes(selectedProgram)
      );
    }

    // Filter by instructor if provided
    if (instructor) {
      // We would need to match instructor with the courses to filter
      // This requires additional data mapping that's not implemented here
      // For simplicity, we're not implementing this filter
    }

    // Sort by day, then by start time
    filtered.sort((a, b) => {
      const dayOrder = daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
      if (dayOrder !== 0) return dayOrder;
      return a.startTime.localeCompare(b.startTime);
    });

    setFilteredSchedule(filtered);
  }, [selectedDay, selectedSection, selectedSemester, selectedProgram, instructor]);

  return (
    <div className="class-schedule-container">
      <h2 className="text-xl font-bold mb-4">Class Schedule - IIIT Senapati, Manipur (Jan-May 2025)</h2>

      {showFilter && (
        <div className="filters mb-4 grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <select
              className="border rounded-md p-2 w-full"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              <option value="All">All Days</option>
              {daysOfWeek.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              className="border rounded-md p-2 w-full"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              {sections.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select
              className="border rounded-md p-2 w-full"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              {semesters.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
            <select
              className="border rounded-md p-2 w-full"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
            >
              {programs.map(prog => (
                <option key={prog} value={prog}>{prog}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        {filteredSchedule.length > 0 ? (
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Day</th>
                <th className="border border-gray-300 px-4 py-2">Time</th>
                <th className="border border-gray-300 px-4 py-2">Course</th>
                <th className="border border-gray-300 px-4 py-2">Instructor</th>
                <th className="border border-gray-300 px-4 py-2">Room</th>
                <th className="border border-gray-300 px-4 py-2">Section</th>
                <th className="border border-gray-300 px-4 py-2">Semester</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedule.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{entry.day}</td>
                  <td className="border border-gray-300 px-4 py-2">{entry.startTime} - {entry.endTime}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="font-medium">{entry.courseCode}</div>
                    <div className="text-sm text-gray-600">{entry.courseName}</div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{entry.instructor}</td>
                  <td className="border border-gray-300 px-4 py-2">{entry.room}</td>
                  <td className="border border-gray-300 px-4 py-2">{entry.section}</td>
                  <td className="border border-gray-300 px-4 py-2">{entry.semester}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <p className="text-gray-500">No classes found for the selected filters.</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p><strong>Note:</strong> For special Saturday schedules, please refer to the special adjustments calendar.</p>
        <p>The schedule above reflects the regular weekly timetable for Jan-May 2025 session.</p>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Special Saturday Adjustments</h3>
        <ul className="list-disc pl-5 text-blue-700">
          <li>January 25, 2025 (Saturday) - Monday Schedule</li>
          <li>February 1, 2025 (Saturday) - Tuesday Schedule</li>
          <li>February 15, 2025 (Saturday) - Wednesday Schedule</li>
          <li>March 1, 2025 (Saturday) - Thursday Schedule</li>
          <li>March 15, 2025 (Saturday) - Friday Schedule</li>
          <li>March 29, 2025 (Saturday) - Monday Schedule</li>
          <li>April 5, 2025 (Saturday) - Tuesday Schedule</li>
          <li>April 19, 2025 (Saturday) - Wednesday Schedule</li>
        </ul>
      </div>
    </div>
  );
};

export default ClassSchedule;

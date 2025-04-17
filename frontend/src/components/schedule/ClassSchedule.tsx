import React from 'react';

// Define the shape of a class schedule entry
export interface ClassScheduleEntry {
  id: string;
  courseName: string;
  instructor: string;
  day: string; // e.g., 'Monday', 'Tuesday', etc.
  startTime: string; // e.g., '09:00'
  endTime: string; // e.g., '10:30'
  location?: string;
}

interface ClassScheduleProps {
  schedule: ClassScheduleEntry[];
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ClassSchedule: React.FC<ClassScheduleProps> = ({ schedule }) => {
  return (
    <div className="class-schedule-container">
      <h2 className="text-xl font-bold mb-4">Class Schedule</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Day</th>
              <th className="border border-gray-300 px-4 py-2">Course</th>
              <th className="border border-gray-300 px-4 py-2">Instructor</th>
              <th className="border border-gray-300 px-4 py-2">Time</th>
              <th className="border border-gray-300 px-4 py-2">Location</th>
            </tr>
          </thead>
          <tbody>
            {daysOfWeek.map((day) =>
              schedule.filter((entry) => entry.day === day).length > 0 ? (
                schedule
                  .filter((entry) => entry.day === day)
                  .map((entry) => (
                    <tr key={entry.id}>
                      <td className="border border-gray-300 px-4 py-2">{entry.day}</td>
                      <td className="border border-gray-300 px-4 py-2">{entry.courseName}</td>
                      <td className="border border-gray-300 px-4 py-2">{entry.instructor}</td>
                      <td className="border border-gray-300 px-4 py-2">{entry.startTime} - {entry.endTime}</td>
                      <td className="border border-gray-300 px-4 py-2">{entry.location || '-'}</td>
                    </tr>
                  ))
              ) : null
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassSchedule;

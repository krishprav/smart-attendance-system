'use client';

import { useState, useEffect } from 'react';
// Using native Date methods instead of date-fns

interface DatePickerProps {
  selectedDate: Date;
  onDateChangeAction: (date: Date) => void;
}

export default function DatePicker({ selectedDate, onDateChangeAction }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState(selectedDate.getMonth());
  const [year, setYear] = useState(selectedDate.getFullYear());
  const [dates, setDates] = useState<Date[]>([]);

  // Generate dates for the current month
  useEffect(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const newDates: Date[] = [];

    // Add days from previous month to fill the first week
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      newDates.push(new Date(year, month - 1, daysInPrevMonth - i));
    }

    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      newDates.push(new Date(year, month, i));
    }

    // Add days from next month to fill the last week
    const remainingDays = 42 - newDates.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      newDates.push(new Date(year, month + 1, i));
    }

    setDates(newDates);
  }, [month, year]);

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleDateClick = (date: Date) => {
    onDateChangeAction(date);
    setIsOpen(false);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSelectedDate = (date: Date) => {
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 border border-blue-300 rounded-lg text-blue-700 bg-white hover:bg-blue-50 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 bg-white rounded-lg shadow-lg p-4 border border-gray-200 w-72">
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Previous month"
              title="Previous month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div className="font-semibold">{new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Next month"
              title="Next month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {dates.map((date, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleDateClick(date)}
                className={`
                  w-9 h-9 flex items-center justify-center rounded-full text-sm
                  ${isCurrentMonth(date) ? 'text-gray-700' : 'text-gray-400'}
                  ${isToday(date) ? 'bg-blue-100' : ''}
                  ${isSelectedDate(date) ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-gray-100'}
                `}
              >
                {date.getDate()}
              </button>
            ))}
          </div>

          <div className="mt-4 flex justify-between">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setMonth(today.getMonth());
                setYear(today.getFullYear());
                handleDateClick(today);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { courses } from '../../../data/courseData';

export default function StartSession() {
  const [courseId, setCourseId] = useState('');
  const [classType, setClassType] = useState('lecture');
  const [duration, setDuration] = useState('90');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionId, setSessionId] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!courseId) {
      setError('Please select a course');
      return;
    }

    if (!duration || parseInt(duration) <= 0) {
      setError('Please enter a valid duration');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mock API call - in a real app, this would call the backend API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful response
      setSuccess(true);
      setSessionId('123456789'); // This would be returned from the API

      // Real implementation would be:
      // const token = localStorage.getItem('token');
      // const response = await fetch('http://localhost:5000/api/attendance/sessions', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`
      //   },
      //   body: JSON.stringify({
      //     courseId,
      //     classType,
      //     duration: parseInt(duration),
      //     location
      //   })
      // });
      // const data = await response.json();
      // if (data.success) {
      //   setSuccess(true);
      //   setSessionId(data.data._id);
      // } else {
      //   setError(data.message || 'Failed to start session');
      // }
    } catch (err) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4 px-4">
          <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight">Start New Session</h1>
          <Link 
            href="/faculty/classes" 
            className="px-5 py-2 rounded-xl border border-gray-300 text-blue-800 bg-white hover:bg-blue-50 transition font-semibold shadow"
          >
            Back to Home
          </Link>
        </div>

        <div className="bg-white text-gray-900 rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {!success ? (
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {error && (
                <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="course" className="block text-base font-semibold text-gray-700 mb-2">Course</label>
                <select
                  id="course"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 transition"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.code} value={course.code}>
                      {course.code}: {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="classType" className="block text-base font-semibold text-gray-700 mb-2">Class Type</label>
                <select
                  id="classType"
                  value={classType}
                  onChange={(e) => setClassType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 transition"
                  required
                >
                  <option value="lecture">Lecture</option>
                  <option value="lab">Lab</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>

              <div>
                <label htmlFor="duration" className="block text-base font-semibold text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  id="duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-base font-semibold text-gray-700 mb-2">
                  Location (Optional)
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Room 201, Engineering Building"
                  className="w-full p-3 border border-gray-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 transition"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-3 bg-blue-800 text-white rounded-xl shadow-lg hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed mt-4 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Starting Session...
                    </span>
                  ) : (
                    'Start Session'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Session Started Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Your class session for <span className="font-semibold">{courseId}</span> has been started. Students can now mark their attendance.
              </p>
              <div className="text-gray-900 rounded-xl shadow-lg p-4 mb-6 max-w-md mx-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500">Session ID:</span>
                  <span className="font-mono font-medium">{sessionId}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500">Course:</span>
                  <span className="font-medium">{courseId}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium capitalize">{classType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium">{duration} minutes</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                <Link 
                  href={`/faculty/sessions/${sessionId}`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow transition font-semibold"
                >
                  View Session Details
                </Link>
                <Link 
                  href="/faculty/classes"
                  className="bg-gray-50 border border-gray-300 text-gray-800 hover:bg-white px-6 py-3 rounded-xl shadow transition font-semibold"
                >
                  Go to My Classes
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
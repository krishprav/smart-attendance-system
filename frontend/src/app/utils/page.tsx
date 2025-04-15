'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function UtilsPage() {
  const { user, updateUserFaceRegistration } = useAuth();
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFaceRegistered(user.faceRegistered || false);
    }
  }, [user]);

  const toggleFaceRegistration = () => {
    try {
      // Toggle face registration status
      const newStatus = !faceRegistered;
      updateUserFaceRegistration(newStatus);
      setFaceRegistered(newStatus);
      
      // Update in localStorage directly too (belt and suspenders)
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const userData = JSON.parse(userJson);
        userData.faceRegistered = newStatus;
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Also update in cookies for server-side access
        document.cookie = `user=${JSON.stringify(userData)}; path=/; max-age=86400`;
      }
      
      // Set localStorage flag
      localStorage.setItem('faceRegistered', newStatus ? 'true' : 'false');
      
      setMessage(`Face registration status set to: ${newStatus ? 'Registered' : 'Not Registered'}`);
    } catch (error) {
      console.error('Error updating face registration status:', error);
      setMessage('Error updating face registration status');
    }
  };

  const clearUserData = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('faceRegistered');
      localStorage.removeItem('faceImages');
      
      // Clear cookies
      document.cookie = 'user=; path=/; max-age=0';
      
      setMessage('User data cleared. Please log in again.');
    } catch (error) {
      console.error('Error clearing user data:', error);
      setMessage('Error clearing user data');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Utility Tools</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Face Registration Status</h2>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            Current Status: 
            <span className={`font-bold ml-2 ${faceRegistered ? 'text-green-600' : 'text-red-600'}`}>
              {faceRegistered ? 'Registered' : 'Not Registered'}
            </span>
          </p>
          
          <button
            onClick={toggleFaceRegistration}
            className={`px-4 py-2 rounded-md text-white ${
              faceRegistered ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {faceRegistered ? 'Clear Registration Status' : 'Set as Registered'}
          </button>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-medium mb-2">Clear All User Data</h3>
          <p className="text-gray-600 mb-2">
            This will clear all locally stored user data and return you to the login screen.
          </p>
          
          <button
            onClick={clearUserData}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Clear All User Data
          </button>
        </div>
        
        {message && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md border border-blue-100">
            {message}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Navigation Helpers</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <a
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
          >
            Home
          </a>
          
          <a
            href="/student/profile"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
          >
            Student Profile
          </a>
          
          <a
            href="/student/attendance"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
          >
            Student Attendance
          </a>
          
          <a
            href="/student/face-registration"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
          >
            Face Registration
          </a>
          
          <a
            href="/faculty/classes"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center"
          >
            Faculty Classes
          </a>
          
          <a
            href="/login"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-center"
          >
            Login Page
          </a>
        </div>
      </div>
    </div>
  );
}

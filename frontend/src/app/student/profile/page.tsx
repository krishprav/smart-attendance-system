'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: string;
  createdAt: string;
}

export default function StudentProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get user profile from localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setProfile({
          id: userData.id || '123456789',
          name: userData.name || 'Student User',
          email: userData.email || 'student@iiitmanipur.ac.in',
          studentId: userData.studentId || 'STUD2025001',
          role: userData.role || 'student',
          createdAt: userData.createdAt || '2023-09-01T00:00:00.000Z'
        });
      } else {
        setError('User not found. Please log in again.');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Error loading profile. Please refresh or try logging in again.');
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <Link href="/" className="block mt-2 text-blue-500 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow overflow-hidden my-8">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Student Profile</h1>
          <Link 
            href="/" 
            className="bg-white text-blue-600 px-4 py-2 rounded-lg shadow hover:bg-blue-50 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
      
      {profile && (
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-2xl font-bold">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
              <p className="text-gray-600">{profile.email}</p>
              <div className="mt-2 inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Account Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-gray-500 text-sm">Student ID</span>
                  <p className="font-medium">{profile.studentId}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Joined On</span>
                  <p className="font-medium">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Face Recognition Status</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-700 font-medium">Face ID Registered</span>
                </div>
                <p className="text-green-600 mt-2 text-sm">Your face ID is registered and active for attendance marking.</p>
                <Link 
                  href="/student/face-registration"
                  className="mt-3 inline-block bg-white text-green-600 border border-green-300 hover:bg-green-50 px-3 py-1 rounded transition"
                >
                  Update Face ID
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">Attendance Marked</span>
                  <span className="text-gray-500 text-sm">Today, 9:30 AM</span>
                </div>
                <p className="text-gray-600 text-sm mt-1">CSE101 Introduction to Computer Science</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">Attendance Marked</span>
                  <span className="text-gray-500 text-sm">Yesterday, 2:15 PM</span>
                </div>
                <p className="text-gray-600 text-sm mt-1">MATH201 Advanced Calculus</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">Face ID Updated</span>
                  <span className="text-gray-500 text-sm">3 days ago</span>
                </div>
                <p className="text-gray-600 text-sm mt-1">Face recognition profile was updated</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
              Edit Profile
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition">
              Change Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

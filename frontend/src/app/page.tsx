'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [authState, setAuthState] = useState<'student' | 'faculty' | null>(null);
  const router = useRouter();

  const handleLoginOrRegister = (role: 'student' | 'faculty', isRegister: boolean = false) => {
    if (isRegister) {
      router.push('/register');
    } else {
      router.push('/login');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-1/2 p-8 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Smart Attendance & Behavior Monitoring System
            </h1>
            <p className="text-gray-600 mb-6">
              A comprehensive system that automates student attendance tracking using facial recognition
              technology, monitors classroom behavior, and provides insights into student engagement.
            </p>
            
            {!authState && (
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => setAuthState('student')}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Student Portal
                </button>
                <button
                  onClick={() => setAuthState('faculty')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Faculty Portal
                </button>
              </div>
            )}
            
            {authState === 'student' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Student Portal</h2>
                <div className="flex flex-col space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/login" className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-lg text-center font-medium transition-colors">
                      Login
                    </Link>
                    <Link href="/register" className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-lg text-center font-medium transition-colors">
                      Register
                    </Link>
                  </div>
                  <p className="text-sm text-gray-600">After signing in, you'll be able to:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-100 p-4 rounded-lg text-center">
                      <span className="block text-gray-800 font-medium">My Attendance</span>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg text-center">
                      <span className="block text-gray-800 font-medium">My Profile</span>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg text-center">
                      <span className="block text-gray-800 font-medium">Face Registration</span>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg text-center">
                      <span className="block text-gray-800 font-medium">My Classes</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setAuthState(null)}
                  className="text-sm text-gray-500 hover:text-gray-700 mt-4"
                >
                  Back
                </button>
              </div>
            )}
            
            {authState === 'faculty' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Faculty Portal</h2>
                <div className="flex flex-col space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/login" className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 p-4 rounded-lg text-center font-medium transition-colors">
                      Login
                    </Link>
                    <Link href="/register" className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 p-4 rounded-lg text-center font-medium transition-colors">
                      Register
                    </Link>
                  </div>
                  <p className="text-sm text-gray-600">After signing in, you'll be able to:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-100 p-4 rounded-lg text-center">
                      <span className="block text-gray-800 font-medium">Start Session</span>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg text-center">
                      <span className="block text-gray-800 font-medium">My Classes</span>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg text-center">
                      <span className="block text-gray-800 font-medium">Attendance Reports</span>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg text-center">
                      <span className="block text-gray-800 font-medium">Analytics</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setAuthState(null)}
                  className="text-sm text-gray-500 hover:text-gray-700 mt-4"
                >
                  Back
                </button>
              </div>
            )}
          </div>
          
          <div className="sm:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 p-8 text-white flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-4">Key Features</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Face Recognition-Based Attendance</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>ID Card Detection & Compliance</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Mobile Phone Usage Detection</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Sentiment Analysis for Engagement</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Real-Time Alerts & Notifications</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

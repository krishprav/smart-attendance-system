'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function DebugPage() {
  const { user, updateUserFaceRegistration } = useAuth();
  const [localStorage, setLocalStorage] = useState<Record<string, any>>({});
  const [cookies, setCookies] = useState<string>('');
  const [showFixButton, setShowFixButton] = useState(false);

  useEffect(() => {
    // Get localStorage items
    const localStorageData: Record<string, any> = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        try {
          localStorageData[key] = JSON.parse(window.localStorage.getItem(key) || '');
        } catch {
          localStorageData[key] = window.localStorage.getItem(key);
        }
      }
    }
    setLocalStorage(localStorageData);

    // Get cookies
    setCookies(document.cookie);

    // Check if we need the fix button
    if (user && !document.cookie.includes('user=')) {
      setShowFixButton(true);
    }
  }, [user]);

  const fixUserCookie = () => {
    if (user) {
      document.cookie = `user=${JSON.stringify(user)}; path=/; max-age=86400`;
      setCookies(document.cookie);
      setShowFixButton(false);
      alert('User cookie has been set!');
    }
  };

  const fixFaceRegistration = () => {
    if (user) {
      updateUserFaceRegistration(true);
      document.cookie = `user=${JSON.stringify({...user, faceRegistered: true})}; path=/; max-age=86400`;
      window.location.reload();
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    document.cookie = 'user=; path=/; max-age=0';
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Authentication Debug Page</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Current User Context</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-sm">
            {user ? JSON.stringify(user, null, 2) : 'No user logged in'}
          </pre>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">LocalStorage</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-sm">
            {JSON.stringify(localStorage, null, 2)}
          </pre>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Cookies</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-sm">
            {cookies || 'No cookies found'}
          </pre>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {showFixButton && (
            <button
              onClick={fixUserCookie}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md"
            >
              Fix Missing User Cookie
            </button>
          )}
          
          <button
            onClick={fixFaceRegistration}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
          >
            Mark Face as Registered
          </button>
          
          <button
            onClick={clearAuthData}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
          >
            Clear All Auth Data
          </button>
          
          <Link 
            href="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md inline-block text-center"
          >
            Go to Login
          </Link>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Quick Navigation</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Link 
              href="/" 
              className="bg-gray-200 hover:bg-gray-300 py-2 px-3 rounded text-center"
            >
              Home
            </Link>
            <Link 
              href="/student/profile" 
              className="bg-gray-200 hover:bg-gray-300 py-2 px-3 rounded text-center"
            >
              Student Profile
            </Link>
            <Link 
              href="/student/face-registration" 
              className="bg-gray-200 hover:bg-gray-300 py-2 px-3 rounded text-center"
            >
              Face Registration
            </Link>
            <Link 
              href="/student/attendance" 
              className="bg-gray-200 hover:bg-gray-300 py-2 px-3 rounded text-center"
            >
              Student Attendance
            </Link>
            <Link 
              href="/student/classes" 
              className="bg-gray-200 hover:bg-gray-300 py-2 px-3 rounded text-center"
            >
              Student Classes
            </Link>
            <Link 
              href="/faculty/classes" 
              className="bg-gray-200 hover:bg-gray-300 py-2 px-3 rounded text-center"
            >
              Faculty Classes
            </Link>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Troubleshooting Guide</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>
              <strong>Can't access pages after login:</strong> Make sure both localStorage and cookies 
              contain the user data. Use the "Fix Missing User Cookie" button if needed.
            </li>
            <li>
              <strong>Stuck on face registration:</strong> If you've completed face registration but 
              the system still redirects you there, use the "Mark Face as Registered" button.
            </li>
            <li>
              <strong>Camera not working:</strong> Check browser permissions, make sure your camera is 
              enabled and working. Try a different browser if issues persist.
            </li>
            <li>
              <strong>Complete reset:</strong> Use the "Clear All Auth Data" button to reset everything 
              and start fresh with login.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

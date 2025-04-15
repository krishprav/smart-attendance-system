'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetFaceRegistration() {
  const router = useRouter();

  useEffect(() => {
    try {
      // Get current user from localStorage
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        
        // Set face registration to true
        user.faceRegistered = true;
        
        // Save back to localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        // Also update in cookies for server-side access
        document.cookie = `user=${JSON.stringify(user)}; path=/; max-age=86400`;
        
        // Set face registered in localStorage
        localStorage.setItem('faceRegistered', 'true');
        
        console.log('Face registration status set to true');
        
        // Also set mock face images
        const mockFaceImages = [
          { angle: 'Front', image: '/mock-face-front.jpg', status: 'success' },
          { angle: 'Left', image: '/mock-face-left.jpg', status: 'success' },
          { angle: 'Right', image: '/mock-face-right.jpg', status: 'success' },
        ];
        localStorage.setItem('faceImages', JSON.stringify(mockFaceImages));
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
    
    // Redirect to home page
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Resetting Face Registration Status</h1>
        <p className="text-gray-600">Please wait, you will be redirected shortly...</p>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

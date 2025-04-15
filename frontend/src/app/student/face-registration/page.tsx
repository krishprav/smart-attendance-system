'use client';

import { useSearchParams } from 'next/navigation';
import FaceRegistrationSimple from '@/components/face-recognition/FaceRegistrationSimple';

export default function FaceRegistrationPage() {
  const searchParams = useSearchParams();
  const isFirstTime = searchParams.get('firstTime') === 'true';
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {isFirstTime ? (
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Welcome to the Smart Attendance System</h1>
            <p className="text-gray-600">Let's set up your face recognition for seamless attendance marking</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Face Registration</h2>
            <p className="text-gray-600 mb-4">
              The system needs to register your face from multiple angles to ensure accurate recognition.
              This will help us verify your identity when marking attendance.
            </p>
            <p className="text-gray-600 mb-4">
              Your privacy is important to us. Your biometric data is encrypted and used only 
              for attendance verification purposes.
            </p>
            
            <FaceRegistrationSimple />
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-6">Face Registration</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Why Register Your Face?</h2>
            <div className="prose prose-blue">
              <p>
                Face registration is a key component of our Smart Attendance System. By registering your face,
                you can mark your attendance quickly and securely, without the need for manual verification.
              </p>
              
              <h3>Benefits:</h3>
              <ul>
                <li>Mark attendance with a simple face scan</li>
                <li>Eliminate buddy punching and proxy attendance</li>
                <li>Reduce administrative overhead for faculty</li>
                <li>Track your attendance automatically</li>
              </ul>
              
              <h3>Privacy & Security:</h3>
              <p>
                Your biometric data is encrypted and stored securely. It is only used for attendance verification
                and is never shared with third parties. You can request deletion of your biometric data at any time.
              </p>
            </div>
          </div>
          
          <FaceRegistrationSimple />
        </>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FaceRegistration from './FaceRegistration';

export default function FirstTimeFaceRegistration() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  
  const goToNextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome to the Smart Attendance System</h1>
        <p className="text-gray-600">Let's set up your face recognition for seamless attendance marking</p>
      </div>
      
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>Introduction</span>
          <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>Privacy Notice</span>
          <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>Face Registration</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome to Smart Attendance</h2>
          
          <div className="prose max-w-none mb-6">
            <p>
              The Smart Attendance System uses facial recognition technology to streamline the attendance process,
              making it quicker and more accurate than traditional methods.
            </p>
            
            <h3>How It Works:</h3>
            <ol>
              <li>Register your face from multiple angles</li>
              <li>The system securely stores your facial template (not your actual images)</li>
              <li>During class, your face is scanned to mark attendance automatically</li>
              <li>The system also analyzes compliance with ID card policies and monitors engagement</li>
            </ol>
            
            <h3>Benefits:</h3>
            <ul>
              <li>No more waiting in lines to sign attendance sheets</li>
              <li>Eliminates proxy attendance (someone else marking attendance for you)</li>
              <li>Get attendance notifications and reports instantly</li>
              <li>Verify your attendance record in real-time</li>
            </ul>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={goToNextStep}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
            >
              Next: Privacy Notice
            </button>
          </div>
        </div>
      )}
      
      {currentStep === 2 && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-4">Privacy & Data Protection</h2>
          
          <div className="prose max-w-none mb-6">
            <p>
              We take your privacy seriously. Before proceeding, please review how your biometric data
              will be handled and protected.
            </p>
            
            <h3>Data Storage and Security:</h3>
            <ul>
              <li>Your face is converted to an encrypted mathematical template, not stored as images</li>
              <li>All biometric data is encrypted and stored on secure servers</li>
              <li>Your data is only used for attendance purposes and never shared with third parties</li>
              <li>You can request deletion of your biometric data at any time</li>
            </ul>
            
            <h3>Your Rights:</h3>
            <ul>
              <li>Right to access your stored data</li>
              <li>Right to correct inaccurate data</li>
              <li>Right to delete your biometric information</li>
              <li>Right to be informed about how your data is used</li>
            </ul>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
              <p className="text-sm">
                By proceeding to the next step, you acknowledge that you have read and understand
                how your biometric data will be used and consent to its collection and processing
                for attendance verification purposes.
              </p>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={goToNextStep}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
            >
              I Consent - Proceed to Registration
            </button>
          </div>
        </div>
      )}
      
      {currentStep === 3 && (
        <div>
          <FaceRegistration />
          
          <div className="mt-6 flex justify-start">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Privacy Notice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

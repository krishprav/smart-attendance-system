'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FaceRegistration from '@/components/face/FaceRegistration';
import FaceAttendance from '@/components/face/FaceAttendance';

const FacePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('register');

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-10 px-2 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-indigo-900">Face Recognition</h1>
            <p className="text-gray-600 mt-2">
              Register your face and mark attendance using facial recognition
            </p>
          </div>

          <Tabs defaultValue="register" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="register">Face Registration</TabsTrigger>
              <TabsTrigger value="attendance">Mark Attendance</TabsTrigger>
            </TabsList>

            <TabsContent value="register" className="mt-6">
              <FaceRegistration />
            </TabsContent>

            <TabsContent value="attendance" className="mt-6">
              <FaceAttendance />
            </TabsContent>
          </Tabs>

          <div className="mt-12 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-indigo-800 mb-4">About Face Recognition</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Our face recognition system uses advanced AI to securely verify your identity for attendance.
                Your face data is encrypted and stored securely.
              </p>

              <div>
                <h3 className="font-medium text-indigo-700 mb-2">How it works:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Register your face once using the registration tab</li>
                  <li>For each class, select the active session</li>
                  <li>Capture your face to mark attendance</li>
                  <li>The system will verify your identity and mark you present</li>
                </ol>
              </div>

              <div>
                <h3 className="font-medium text-indigo-700 mb-2">Tips for best results:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Ensure good lighting - avoid backlighting</li>
                  <li>Look directly at the camera</li>
                  <li>Remove glasses, masks, or other face coverings</li>
                  <li>Keep a neutral expression</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FacePage;

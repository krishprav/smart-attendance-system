'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WebcamCapture from '@/components/camera/WebcamCapture';
import { toast } from 'react-hot-toast';
import { BiUser, BiCheckCircle, BiErrorCircle } from 'react-icons/bi';
import axios from 'axios';

// ML API URL
const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8080';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface FaceData {
  image: string;
  angle: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export default function FaceRegistration() {
  const router = useRouter();
  const [faceImages, setFaceImages] = useState<FaceData[]>([
    { angle: 'Front', image: '', status: 'pending' },
    { angle: 'Left', image: '', status: 'pending' },
    { angle: 'Right', image: '', status: 'pending' },
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentAngles, setCurrentAngles] = useState(['Front', 'Left', 'Right']);
  const [studentId, setStudentId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // Mock API call - in production, get this from an actual API
        // const response = await axios.get(`${API_URL}/api/auth/me`);
        // setStudentId(response.data.studentId);
        
        // Mock student ID for demo
        setStudentId('STUDENT123');
        
        // Check if user already has face registered
        await checkFaceRegistrationStatus();
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to fetch user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Check if user already has face registered
  const checkFaceRegistrationStatus = async () => {
    try {
      // In production, this would be a real API call
      // const response = await axios.get(`${API_URL}/api/students/${studentId}/face/status`);
      
      // Mock response for demo
      const mockRegistered = localStorage.getItem('faceRegistered') === 'true';
      setIsRegistered(mockRegistered);
      
      if (mockRegistered) {
        // Mock registered faces
        const registeredImages = JSON.parse(localStorage.getItem('faceImages') || '[]');
        if (registeredImages.length > 0) {
          setFaceImages(registeredImages);
        }
      }
    } catch (error) {
      console.error('Error checking face registration status:', error);
    }
  };

  const handleCapture = useCallback((imageSrc: string) => {
    setFaceImages(prev => {
      const newImages = [...prev];
      newImages[activeIndex] = {
        ...newImages[activeIndex],
        image: imageSrc,
        status: 'pending',
      };
      return newImages;
    });
    
    // Validate face in the image
    validateFace(imageSrc, activeIndex);
  }, [activeIndex]);

  const validateFace = async (imageSrc: string, index: number) => {
    try {
      toast.loading('Validating face...');
      
      // In production, use actual API call
      // const response = await axios.post(`${ML_API_URL}/api/face/analyze`, { image: imageSrc });
      
      // Mock API call - simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 90% success rate for demo purposes
      const isSuccessful = Math.random() < 0.9;
      
      toast.dismiss();
      
      if (isSuccessful) {
        setFaceImages(prev => {
          const newImages = [...prev];
          newImages[index] = {
            ...newImages[index],
            status: 'success',
            message: 'Face validated successfully',
          };
          return newImages;
        });
        
        toast.success(`${currentAngles[index]} face captured successfully!`);
        
        // Auto advance to next angle if not the last one
        if (index < faceImages.length - 1) {
          setTimeout(() => {
            setActiveIndex(index + 1);
          }, 1000);
        }
      } else {
        setFaceImages(prev => {
          const newImages = [...prev];
          newImages[index] = {
            ...newImages[index],
            status: 'error',
            message: 'No face detected or multiple faces detected',
          };
          return newImages;
        });
        
        toast.error('Face validation failed. Please try again with proper lighting and positioning.');
      }
    } catch (error) {
      console.error('Error validating face:', error);
      toast.error('Error validating face. Please try again.');
      
      setFaceImages(prev => {
        const newImages = [...prev];
        newImages[index] = {
          ...newImages[index],
          status: 'error',
          message: 'Error processing image',
        };
        return newImages;
      });
    }
  };

  const submitRegistration = async () => {
    try {
      setIsSubmitting(true);
      toast.loading('Registering your face...');
      
      // Check if all images are captured and validated
      const allValid = faceImages.every(img => img.status === 'success');
      if (!allValid) {
        toast.error('Please capture all required face angles successfully.');
        setIsSubmitting(false);
        return;
      }
      
      // In production, use actual API call
      // for (const faceImage of faceImages) {
      //   await axios.post(`${ML_API_URL}/api/face/register`, {
      //     studentId,
      //     image: faceImage.image
      //   });
      // }
      
      // Mock API call with delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store registration status in localStorage for demo
      localStorage.setItem('faceRegistered', 'true');
      localStorage.setItem('faceImages', JSON.stringify(faceImages));
      
      toast.dismiss();
      toast.success('Face registered successfully!');
      setIsRegistered(true);
      
      // Navigate to face verification page after successful registration
      setTimeout(() => {
        router.push('/student/attendance');
      }, 3000);
      
    } catch (error) {
      console.error('Error registering face:', error);
      toast.error('Error registering face. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetRegistration = () => {
    setFaceImages([
      { angle: 'Front', image: '', status: 'pending' },
      { angle: 'Left', image: '', status: 'pending' },
      { angle: 'Right', image: '', status: 'pending' },
    ]);
    setActiveIndex(0);
    setIsRegistered(false);
    localStorage.removeItem('faceRegistered');
    localStorage.removeItem('faceImages');
    toast.success('Face registration reset. You can now register again.');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center flex-col text-center p-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <BiCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Face Already Registered</h2>
          <p className="text-gray-600 mb-6">
            You have already registered your face for attendance. You can now use the attendance marking system.
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-6 w-full max-w-3xl">
            {faceImages.map((face, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                {face.image ? (
                  <div className="aspect-video relative">
                    <img src={face.image} alt={`Face ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2">
                      {face.angle}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <BiUser className="text-gray-400 text-3xl" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/student/attendance')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Go to Attendance
            </button>
            <button
              onClick={resetRegistration}
              className="px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
            >
              Reset Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Register Your Face</h2>
      
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {faceImages.map((face, index) => (
          <div 
            key={index} 
            className={`border rounded-lg p-4 cursor-pointer transition ${index === activeIndex ? 'border-blue-500 bg-blue-50' : face.status === 'success' ? 'border-green-500 bg-green-50' : face.status === 'error' ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            onClick={() => setActiveIndex(index)}
          >
            <div className="flex items-center mb-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${face.status === 'success' ? 'bg-green-100 text-green-600' : face.status === 'error' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                {index + 1}
              </span>
              <span className="font-medium">{face.angle} View</span>
              {face.status === 'success' && <BiCheckCircle className="text-green-500 ml-auto" />}
              {face.status === 'error' && <BiErrorCircle className="text-red-500 ml-auto" />}
            </div>
            
            {face.image ? (
              <div className="aspect-video relative">
                <img src={face.image} alt={`Face ${index + 1}`} className="w-full h-full object-cover rounded" />
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 flex items-center justify-center rounded">
                <BiUser className="text-gray-400 text-3xl" />
              </div>
            )}
            
            {face.message && (
              <p className={`mt-2 text-sm ${face.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {face.message}
              </p>
            )}
          </div>
        ))}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Capturing: {currentAngles[activeIndex]} View</h3>
        <p className="text-gray-600 text-sm mb-4">
          {activeIndex === 0 && "Please look directly at the camera with your face clearly visible."}
          {activeIndex === 1 && "Please turn your head slightly to the left, while keeping your face visible."}
          {activeIndex === 2 && "Please turn your head slightly to the right, while keeping your face visible."}
        </p>
        
        <div className="border rounded-lg overflow-hidden">
          <WebcamCapture
            onCapture={handleCapture}
            width={640}
            height={480}
            facingMode="user"
            btnClassName="bg-blue-500 hover:bg-blue-600"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={submitRegistration}
          disabled={!faceImages.every(f => f.status === 'success') || isSubmitting}
          className={`px-4 py-2 text-white rounded-lg transition ${!faceImages.every(f => f.status === 'success') || isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isSubmitting ? 'Registering...' : 'Complete Registration'}
        </button>
      </div>
    </div>
  );
}

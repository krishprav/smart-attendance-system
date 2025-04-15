'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WebcamCapture from '@/components/camera/WebcamCapture';
import { BiUser, BiCheckCircle, BiErrorCircle } from 'react-icons/bi';
import { useAuth } from '@/contexts/AuthContext';

// Simple notification function instead of toast
const notify = (message: string, type: 'success' | 'error' | 'info') => {
  console.log(`[${type.toUpperCase()}]: ${message}`);
  alert(`${message}`);
};

interface FaceData {
  image: string;
  angle: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export default function FaceRegistrationSimple() {
  const router = useRouter();
  const { user, updateUserFaceRegistration } = useAuth();
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
        
        if (user) {
          // Set student ID from user context
          setStudentId(user.studentId || 'STUDENT_ID_MISSING');
          
          // Check if user already has face registered
          setIsRegistered(user.faceRegistered || false);
          
          // Check for existing face images
          await checkFaceRegistrationStatus();
        } else {
          notify('User data not found. Please log in again.', 'error');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        notify('Failed to fetch user data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, router]);

  // Check if user already has face registered
  const checkFaceRegistrationStatus = async () => {
    try {
      if (!user) return;
      
      // Check if user has face registration status in their profile
      setIsRegistered(user.faceRegistered || false);
      
      if (user.faceRegistered) {
        // Try to load previously stored face images
        const storedImagesJson = localStorage.getItem(`faceImages_${user.email}`);
        if (storedImagesJson) {
          try {
            const registeredImages = JSON.parse(storedImagesJson);
            if (registeredImages && registeredImages.length > 0) {
              setFaceImages(registeredImages);
            }
          } catch (parseError) {
            console.error('Error parsing stored face images:', parseError);
          }
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
      notify('Validating face...', 'info');
      
      // Mock API call - simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 90% success rate for demo purposes
      const isSuccessful = Math.random() < 0.9;
      
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
        
        notify(`${currentAngles[index]} face captured successfully!`, 'success');
        
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
        
        notify('Face validation failed. Please try again with proper lighting and positioning.', 'error');
      }
    } catch (error) {
      console.error('Error validating face:', error);
      notify('Error validating face. Please try again.', 'error');
      
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
      notify('Registering your face...', 'info');
      
      // Check if all images are captured and validated
      const allValid = faceImages.every(img => img.status === 'success');
      if (!allValid) {
        notify('Please capture all required face angles successfully.', 'error');
        setIsSubmitting(false);
        return;
      }
      
      if (!user) {
        throw new Error('User not logged in');
      }
      
      // Simulate API call - in a real app, this would send the images to your backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store face images for demo purposes
      localStorage.setItem(`faceImages_${user.email}`, JSON.stringify(faceImages));
      
      // Update the user's face registration status through the auth context
      // This will update both the context state and local storage
      updateUserFaceRegistration(true);
      
      notify('Face registered successfully!', 'success');
      setIsRegistered(true);
      
      // Navigate to student profile after successful registration
      setTimeout(() => {
        router.push('/student/profile');
      }, 1500);
      
    } catch (error) {
      console.error('Error registering face:', error);
      notify('Error registering face. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetRegistration = () => {
    if (!user) {
      notify('User not logged in', 'error');
      return;
    }
    
    setFaceImages([
      { angle: 'Front', image: '', status: 'pending' },
      { angle: 'Left', image: '', status: 'pending' },
      { angle: 'Right', image: '', status: 'pending' },
    ]);
    setActiveIndex(0);
    
    // Update auth context
    updateUserFaceRegistration(false);
    
    // Remove stored face images
    localStorage.removeItem(`faceImages_${user.email}`);
    
    setIsRegistered(false);
    notify('Face registration reset. You can now register again.', 'success');
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

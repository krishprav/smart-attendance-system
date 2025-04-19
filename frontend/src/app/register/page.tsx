'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import FaceRegistrationStep from '@/components/registration/FaceRegistrationStep';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string>('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    studentId?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { register, loading, error, validateEmail, user } = useAuth();
  const router = useRouter();

  const validateStep1 = () => {
    const newErrors: {
      name?: string;
      email?: string;
      studentId?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message;
    }

    if (role === 'student' && !studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: {
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  // Track user ID after registration
  useEffect(() => {
    if (user && user.id) {
      setUserId(user.id);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 2 && validateStep2()) {
      try {
        const result = await register({
          name,
          email,
          password,
          role,
          studentId: role === 'student' ? studentId : undefined,
        });

        if (result && result.user && result.user.id) {
          setUserId(result.user.id);

          // Move to face registration step for students
          if (role === 'student') {
            setStep(3);
          } else {
            router.push('/login?registered=true');
          }
        }
      } catch (err) {
        console.error('Registration error:', err);
      }
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-gradient-to-b from-blue-600 to-blue-700 rounded-xl shadow-xl overflow-hidden transform transition-all hover:scale-[1.01]">
        <div className="p-6 text-center">
          <img src="/iiit-manipur-logo.png" alt="IIIT Manipur Logo" className="h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white drop-shadow-md">Create a new account</h2>
          <p className="text-blue-100 mt-1">Join the Smart Attendance System</p>
        </div>
        <div className="bg-white rounded-t-xl overflow-hidden border-t border-blue-200 shadow-inner">
        <div className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Registration</h1>
            <p className="text-gray-600 mt-2">Complete your profile</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div className={`w-6 h-6 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-400'} flex items-center justify-center text-white text-xs font-bold shadow-md`}>
                1
              </div>
              <div className={`flex-1 h-1.5 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'} rounded`}></div>
              <div className={`w-6 h-6 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-400'} flex items-center justify-center text-white text-xs font-bold shadow-md`}>
                2
              </div>
              <div className={`flex-1 h-1.5 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'} rounded`}></div>
              <div className={`w-6 h-6 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-400'} flex items-center justify-center text-white text-xs font-bold shadow-md`}>
                3
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs font-medium">
              <span className={`${step >= 1 ? 'text-blue-700' : 'text-gray-600'}`}>Basic Info</span>
              <span className={`${step >= 2 ? 'text-blue-700' : 'text-gray-600'}`}>Security</span>
              <span className={`${step >= 3 ? 'text-blue-700' : 'text-gray-600'}`}>Face Registration</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex mb-4 bg-gray-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                      role === 'student'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('faculty')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                      role === 'faculty'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Faculty
                  </button>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`mt-1 block w-full pl-10 px-3 py-2 border ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`mt-1 block w-full pl-10 px-3 py-2 border ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder={`${role === 'student' ? 'student' : 'faculty'}@iiitmanipur.ac.in`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                {role === 'student' && (
                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                      Student ID
                    </label>
                    <input
                      id="studentId"
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.studentId ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder="ST12345"
                    />
                    {errors.studentId && <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>}
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:translate-y-[-1px] hover:shadow-lg"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`mt-1 block w-full pl-10 px-3 py-2 border ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black`}
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`mt-1 block w-full pl-10 px-3 py-2 border ${
                        errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
                    {error}
                  </div>
                )}

                <div className="pt-4 flex space-x-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="w-1/2 flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all mr-2"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-1/2 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:translate-y-[-1px] hover:shadow-lg"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div>
                {userId ? (
                  <FaceRegistrationStep
                    userId={userId}
                    onComplete={(success) => {
                      if (success) {
                        router.push('/student/profile');
                      }
                    }}
                    onSkip={() => router.push('/student/profile')}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-red-600">User registration required before face registration.</p>
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
                    >
                      Go Back
                    </button>
                  </div>
                )}
              </div>
            )}
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-700">Already have an account?</span>{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </div>
        </div>
        </div>
      </div>
    </main>
    </>
  );
}

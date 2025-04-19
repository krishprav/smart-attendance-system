'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { authConfig } from '@/config/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [googleAuthLoaded, setGoogleAuthLoaded] = useState(false);
  const [authMessage, setAuthMessage] = useState<{text: string, type: 'error' | 'success' | 'info'} | null>(null);

  const { login, loading, error, validateEmail, user, googleLogin } = useAuth();
  const router = useRouter();

  // Check if user is already logged in and redirect to appropriate page
  useEffect(() => {
    if (user) {
      const destination = user.role === 'student' ? '/student/profile' : '/faculty/classes';
      router.push(destination);
    }
  }, [user, router]);

  // Initialize Google Auth with error handling
  const initializeGoogleAuth = useCallback(() => {
    if (window.google) {
      try {
        setGoogleAuthLoaded(true);

        window.google.accounts.id.initialize({
          client_id: authConfig.googleClientId,
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
          hosted_domain: authConfig.allowedEmailDomain, // Restrict to institutional domain
        });

        const buttonEl = document.getElementById('googleSignInButton');
        if (buttonEl) {
          window.google.accounts.id.renderButton(
            buttonEl,
            { theme: 'outline', size: 'large', width: '100%', text: 'signin_with', shape: 'rectangular' }
          );
        }
      } catch (error) {
        console.error('Error initializing Google Auth:', error);
        setAuthMessage({
          text: 'Failed to initialize Google Sign-In. Please use email login.',
          type: 'error'
        });
      }
    }
  }, []);

  // Load Google's OAuth client library
  useEffect(() => {
    // Create script for Google OAuth
    try {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      script.onerror = () => {
        console.error('Failed to load Google Sign-In script');
        setAuthMessage({
          text: 'Failed to load Google Sign-In. Please use email login.',
          type: 'error'
        });
      };
      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    } catch (error) {
      console.error('Error setting up Google Auth script:', error);
    }
  }, [initializeGoogleAuth]);

  // Handle Google callback with proper domain validation
  function handleGoogleCallback(response: any) {
    try {
      // Call the googleLogin method from AuthContext which will:
      // 1. Validate the credential
      // 2. Check if the email is from the institution
      // 3. Create an account if the user doesn't exist
      // 4. Handle the login flow
      googleLogin(response.credential);
    } catch (error) {
      console.error('Google auth error:', error);
      setAuthMessage({
        text: 'Failed to authenticate with Google. Please try again.',
        type: 'error'
      });
    }
  }

  // Helper function to parse JWT tokens
  function parseJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Clear error when user is typing
    setEmailError(null);
  };

  const validateForm = () => {
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.message);
      return false;
    }

    // Validate password
    if (!password || password.length < 6) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await login(email, password);

      // The useEffect will handle redirection based on user role
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  // If already logged in, show loading until redirect happens
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-gradient-to-b from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 transform transition-all hover:scale-[1.01]">
        <div className="mb-4">
          <img src="/iiit-manipur-logo.png" alt="IIIT Manipur Logo" className="h-16 mx-auto mb-4" />
          <h2 className="mb-2 text-center text-3xl font-extrabold text-white drop-shadow-md">Sign in to your account</h2>
          <p className="text-center text-blue-100">Smart Attendance System</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-1">Please enter your credentials</p>
          </div>

          <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
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

          {authMessage && (
            <div className={`mb-6 p-3 rounded-md text-sm ${
              authMessage.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              authMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {authMessage.text}
            </div>
          )}

          <div className="mb-6">
            <div id="googleSignInButton" className="w-full flex justify-center"></div>

            {!googleAuthLoaded && (
              <div className="w-full h-10 bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-sm text-gray-500">Loading Google Sign-In...</span>
              </div>
            )}

            <div className="text-center text-sm text-gray-600 mt-2">
              Sign in with your @iiitmanipur.ac.in email
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-700 font-medium">Or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={`${role === 'student' ? 'student' : 'faculty'}@iiitmanipur.ac.in`}
                  value={email}
                  onChange={handleEmailChange}
                  className={`appearance-none block w-full pl-10 px-3 py-2 border ${
                    emailError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-600">{emailError}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white transition-all ${
                  role === 'student'
                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:translate-y-[-1px] hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-700 font-medium">Don't have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/register"
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium transition-all hover:shadow-md ${
                  role === 'student'
                    ? 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                    : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                Create new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}

// Add TypeScript declaration for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

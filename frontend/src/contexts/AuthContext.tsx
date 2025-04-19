'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types/auth';
import { validateEmail, authStorage, parseJwt, generateStudentId, isInstitutionalEmail, getRoleFromEmail } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    studentId?: string;
  }) => Promise<{ user: User } | undefined>;
  googleLogin: (credential: string) => Promise<void>;
  validateEmail: (email: string) => { isValid: boolean; message?: string };
  updateUser: (data: Partial<User>) => void;
  updateUserFaceRegistration: (isRegistered: boolean) => void;
  isRegistered: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const router = useRouter();

  // Load user from localStorage on initial load
  useEffect(() => {
    const storedUser = authStorage.getUser();
    if (storedUser) {
      setUser(storedUser);
      setIsRegistered(storedUser.emailVerified && (storedUser.role === 'faculty' || storedUser.faceRegistered));
    }
    setLoading(false);
  }, []);

  // Update user in localStorage when user state changes
  useEffect(() => {
    if (user) {
      authStorage.setUser(user);
      setIsRegistered(user.emailVerified && (user.role === 'faculty' || user.faceRegistered));
    }
  }, [user]);

  // Update user data
  const updateUser = (data: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    authStorage.setUser(updatedUser);
  };

  // Update user face registration status
  const updateUserFaceRegistration = (isRegistered: boolean) => {
    if (!user) return;

    const updatedUser = { ...user, faceRegistered: isRegistered };
    setUser(updatedUser);
    authStorage.setUser(updatedUser);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Validate email before attempting login
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.message);
      }

      // For demo purposes, check if the user exists in localStorage
      // In a real app, this would be an API call
      const storedUser = localStorage.getItem(`registered_${email}`);

      if (!storedUser) {
        throw new Error('User not found. Please register first.');
      }

      const userData = JSON.parse(storedUser) as User;

      // Simple password check for demo
      // In a real app, this would be done server-side
      if (localStorage.getItem(`password_${email}`) !== password) {
        throw new Error('Invalid password');
      }

      // Check email verification
      if (!userData.emailVerified) {
        throw new Error('Please verify your email before logging in');
      }

      // Save user state
      setUser(userData);
      authStorage.setUser(userData);
      setIsRegistered(userData.emailVerified && (userData.role === 'faculty' || userData.faceRegistered));

      // Redirect based on user role and face registration status
      if (userData.role === 'student' && !userData.faceRegistered) {
        router.push('/student/face-registration?firstTime=true');
      } else if (userData.role === 'student') {
        router.push('/student/profile');
      } else {
        router.push('/faculty/classes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (credential: string) => {
    setLoading(true);
    setError(null);

    try {
      // Parse the JWT token from Google
      const payload = parseJwt(credential);
      if (!payload) {
        throw new Error('Invalid Google credential');
      }

      const { name, email, picture, sub } = payload;

      // Validate institutional email
      if (!isInstitutionalEmail(email)) {
        throw new Error('Please use your IIIT Manipur email (@iiitmanipur.ac.in)');
      }

      // Check if the user is already registered
      const storedUser = localStorage.getItem(`registered_${email}`);

      if (storedUser) {
        // User exists, proceed with login
        const userData = JSON.parse(storedUser) as User;

        // Update picture if changed
        if (picture && userData.picture !== picture) {
          userData.picture = picture;
          localStorage.setItem(`registered_${email}`, JSON.stringify(userData));
        }

        // Save user state
        setUser(userData);
        authStorage.setUser(userData);
        setIsRegistered(userData.emailVerified && (userData.role === 'faculty' || userData.faceRegistered));

        // Redirect based on user role and face registration status
        if (userData.role === 'student' && !userData.faceRegistered) {
          router.push('/student/face-registration?firstTime=true');
        } else if (userData.role === 'student') {
          router.push('/student/profile');
        } else {
          router.push('/faculty/classes');
        }
      } else {
        // New user, create account and proceed to registration flow
        const role = getRoleFromEmail(email);
        const studentId = role === 'student' ? generateStudentId(name, email) : undefined;

        const newUser: User = {
          id: sub,
          name,
          email,
          role,
          studentId,
          picture,
          faceRegistered: false,
          emailVerified: true, // Google OAuth emails are verified
          createdAt: new Date().toISOString()
        };

        // Save new user
        localStorage.setItem(`registered_${email}`, JSON.stringify(newUser));
        localStorage.setItem(`password_${email}`, 'google-oauth') // Placeholder password for OAuth users

        setUser(newUser);
        authStorage.setUser(newUser);
        setIsRegistered(newUser.emailVerified && (newUser.role === 'faculty' || newUser.faceRegistered));

        // Redirect to profile completion or face registration
        if (role === 'student') {
          router.push('/student/face-registration?firstTime=true');
        } else {
          router.push('/faculty/profile?firstTime=true');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google authentication failed');
      console.error('Google login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);

    try {
      // Clear auth storage
      authStorage.removeUser();

      setUser(null);
      setIsRegistered(false);

      // Redirect to home page
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    studentId?: string;
  }): Promise<{ user: User } | undefined> => {
    setLoading(true);
    setError(null);

    try {
      // Validate email before attempting registration
      const emailValidation = validateEmail(userData.email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.message);
      }

      // Check if user already exists
      if (localStorage.getItem(`registered_${userData.email}`)) {
        throw new Error('An account with this email already exists');
      }

      // Create new user
      const role = userData.role as UserRole;
      const studentId = role === 'student' ? (userData.studentId || generateStudentId(userData.name, userData.email)) : undefined;

      const newUser: User = {
        id: `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role,
        studentId,
        faceRegistered: false,
        emailVerified: false, // Requires verification
        createdAt: new Date().toISOString()
      };

      // Store user data (in a real app this would be in a database)
      localStorage.setItem(`registered_${userData.email}`, JSON.stringify(newUser));
      localStorage.setItem(`password_${userData.email}`, userData.password);

      // Simulate sending verification email
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo, auto-verify the email (in a real app, user would click a link)
      const verifiedUser = { ...newUser, emailVerified: true };
      localStorage.setItem(`registered_${userData.email}`, JSON.stringify(verifiedUser));

      // Set user state
      setUser(verifiedUser);
      authStorage.setUser(verifiedUser);
      setIsRegistered(verifiedUser.role === 'faculty'); // Students need face registration too

      // Return the user object instead of redirecting
      return { user: verifiedUser };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      console.error('Registration error:', err);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    googleLogin,
    validateEmail,
    updateUser,
    updateUserFaceRegistration,
    isRegistered
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

'use client';

import { UserRole } from '@/types/auth';

// Types for authentication
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  faceRegistered: boolean;
  emailVerified: boolean;
  picture?: string;
  createdAt: string;
}

// Check if email belongs to the institution
export function isInstitutionalEmail(email: string): boolean {
  return email.endsWith('@iiitmanipur.ac.in');
}

// Validate email format
export function validateEmail(email: string): { isValid: boolean; message?: string } {
  // Check if it's a valid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  // Check if it's from the required domain (@iiitmanipur.ac.in)
  if (!isInstitutionalEmail(email)) {
    return { 
      isValid: false, 
      message: 'Please use your IIIT Manipur email (@iiitmanipur.ac.in)'
    };
  }

  return { isValid: true };
}

// Parse JWT token
export function parseJwt(token: string) {
  try {
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
  } catch (e) {
    console.error('Error parsing JWT token:', e);
    return null;
  }
}

// Local storage operations
export const authStorage = {
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user from localStorage:', error);
      return null;
    }
  },
  
  setUser: (user: User): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
    // Also set in cookie for server-side auth
    document.cookie = `user=${JSON.stringify(user)}; path=/; max-age=86400`;
  },
  
  removeUser: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Clear auth cookie
    document.cookie = 'user=; path=/; max-age=0';
  },
  
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },
  
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
  }
};

// Generate a student ID based on name and email
export function generateStudentId(name: string, email: string): string {
  const namePart = name.substring(0, 2).toUpperCase();
  const emailPart = email.split('@')[0].substring(0, 3).toUpperCase();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `ST${namePart}${emailPart}${randomNum}`;
}

// Check if the user has completed registration
export function isRegistrationComplete(user: User | null): boolean {
  if (!user) return false;
  return !!user.emailVerified && (user.role === 'faculty' || (user.role === 'student' && !!user.faceRegistered));
}

// Determine user role from email
export function getRoleFromEmail(email: string): UserRole {
  if (email.includes('faculty') || email.includes('professor') || email.includes('admin')) {
    return 'faculty';
  }
  return 'student';
}

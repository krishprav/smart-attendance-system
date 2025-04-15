'use client';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  studentId?: string;
  faceRegistered?: boolean;
  picture?: string;
}

/**
 * Gets the current user from localStorage (client-side only)
 */
export function getUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
}

/**
 * Checks if the user is authenticated (client-side only)
 */
export function isAuthenticated(): boolean {
  return getUser() !== null;
}

/**
 * Gets the user role if authenticated (client-side only)
 */
export function getUserRole(): 'student' | 'faculty' | 'admin' | null {
  const user = getUser();
  return user ? user.role : null;
}

/**
 * Parses a JWT token
 */
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

/**
 * Redirects to login if not authenticated (client-side only)
 */
export function redirectToLogin() {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * Clear authentication data (client-side only)
 */
export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    document.cookie = 'user=; path=/; max-age=0';
  }
}

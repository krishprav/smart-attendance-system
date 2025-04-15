export type UserRole = 'student' | 'faculty' | 'admin';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  studentId?: string;
}

import axios from 'axios';

// Create an Axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired, invalid, etc.)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login page
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication APIs
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logout = async () => {
  const response = await api.get('/auth/logout');
  return response.data;
};

// Student APIs
export const registerFace = async (studentId: string, image: string) => {
  const response = await api.post(`/students/${studentId}/face`, { image });
  return response.data;
};

export const getFaceRegistrationStatus = async (studentId: string) => {
  const response = await api.get(`/students/${studentId}/face/status`);
  return response.data;
};

// Attendance APIs
export const markAttendance = async (sessionId: string, image: string) => {
  const response = await api.post(`/attendance/sessions/${sessionId}/mark`, { image });
  return response.data;
};

export const getStudentAttendance = async (studentId: string) => {
  const response = await api.get(`/attendance/history/${studentId}`);
  return response.data;
};

// For faculty
export const startSession = async (sessionData: any) => {
  const response = await api.post('/attendance/sessions', sessionData);
  return response.data;
};

export const endSession = async (sessionId: string) => {
  const response = await api.put(`/attendance/sessions/${sessionId}/end`);
  return response.data;
};

export const getActiveSessions = async () => {
  const response = await api.get('/attendance/sessions/active');
  return response.data;
};

export const getSessionDetails = async (sessionId: string) => {
  const response = await api.get(`/attendance/sessions/${sessionId}`);
  return response.data;
};

export const getSessionAttendance = async (sessionId: string) => {
  const response = await api.get(`/attendance/sessions/${sessionId}/attendance`);
  return response.data;
};

// Compliance APIs
export const detectIdCard = async (sessionId: string, image: string) => {
  const response = await api.post(`/compliance/sessions/${sessionId}/idcard`, { image });
  return response.data;
};

export const detectPhone = async (sessionId: string, studentId: string, image: string) => {
  const response = await api.post(`/compliance/sessions/${sessionId}/phone`, { studentId, image });
  return response.data;
};

// Analytics APIs
export const getAttendanceAnalytics = async () => {
  const response = await api.get('/analytics/attendance');
  return response.data;
};

export const getComplianceAnalytics = async () => {
  const response = await api.get('/analytics/compliance');
  return response.data;
};

export const getEngagementAnalytics = async () => {
  const response = await api.get('/analytics/engagement');
  return response.data;
};

export const getDashboardSummary = async () => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};

export default api;
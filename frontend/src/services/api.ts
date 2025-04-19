import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/auth
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or cookies
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData: any) => 
    api.post('/auth/register', userData),
  
  logout: () => 
    api.post('/auth/logout'),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
};

// Faculty API
export const facultyAPI = {
  // Classes
  getClasses: () => 
    api.get('/faculty/classes'),
  
  getClassById: (classId: string) => 
    api.get(`/faculty/classes/${classId}`),
  
  // Sessions
  getSessions: (filters?: any) => 
    api.get('/faculty/sessions', { params: filters }),
  
  getSessionById: (sessionId: string) => 
    api.get(`/faculty/sessions/${sessionId}`),
  
  createSession: (sessionData: any) => 
    api.post('/faculty/sessions', sessionData),
  
  updateSession: (sessionId: string, sessionData: any) => 
    api.put(`/faculty/sessions/${sessionId}`, sessionData),
  
  endSession: (sessionId: string) => 
    api.post(`/faculty/sessions/${sessionId}/end`),
  
  // Attendance
  getAttendance: (sessionId: string) => 
    api.get(`/faculty/sessions/${sessionId}/attendance`),
  
  markAttendance: (sessionId: string, attendanceData: any) => 
    api.post(`/faculty/sessions/${sessionId}/attendance`, attendanceData),
  
  updateAttendance: (sessionId: string, studentId: string, attendanceData: any) => 
    api.put(`/faculty/sessions/${sessionId}/attendance/${studentId}`, attendanceData),
  
  // Analytics
  getAnalytics: (filters?: any) => 
    api.get('/faculty/analytics', { params: filters }),
  
  getClassAnalytics: (classId: string, filters?: any) => 
    api.get(`/faculty/analytics/class/${classId}`, { params: filters }),
  
  getStudentAnalytics: (studentId: string, filters?: any) => 
    api.get(`/faculty/analytics/student/${studentId}`, { params: filters }),
  
  // Reports
  getReports: (filters?: any) => 
    api.get('/faculty/reports', { params: filters }),
  
  generateReport: (reportData: any) => 
    api.post('/faculty/reports/generate', reportData),
  
  downloadReport: (reportId: string) => 
    api.get(`/faculty/reports/${reportId}/download`, { responseType: 'blob' }),
};

// Student API
export const studentAPI = {
  getProfile: () => 
    api.get('/students/profile'),
  
  getAttendance: (filters?: any) => 
    api.get('/students/attendance', { params: filters }),
  
  getClasses: () => 
    api.get('/students/classes'),
  
  markAttendance: (sessionId: string, attendanceData: any) => 
    api.post(`/students/sessions/${sessionId}/attendance`, attendanceData),
};

// Face Recognition API
export const faceAPI = {
  registerFace: (imageData: string) => 
    api.post('/face/register', { image: imageData }),
  
  verifyFace: (sessionId: string, imageData: string) => 
    api.post('/face/verify', { sessionId, image: imageData }),
  
  analyzeFace: (imageData: string) => 
    api.post('/face/analyze', { image: imageData }),
};

export default api;

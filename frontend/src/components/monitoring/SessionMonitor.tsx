'use client';

import { useState, useEffect } from 'react';

interface Student {
  id: string;
  name: string;
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'pending';
  faceVerified: boolean;
  idCardVisible: boolean;
  phoneDetected: boolean;
  engagement: number;
  attention: number;
  dominantEmotion: string;
  lastUpdated: string;
}

interface SessionMonitorProps {
  sessionId: string;
  totalStudents: number;
}

export default function SessionMonitor({ sessionId, totalStudents }: SessionMonitorProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    pending: 0,
    complianceIssues: 0,
    avgEngagement: 0,
  });
  
  // Fetch students data for this session
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, we would fetch from the API
        // const response = await fetch(`/api/attendance/sessions/${sessionId}/students`);
        // const data = await response.json();
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock student data
        const mockStudents: Student[] = Array.from({ length: totalStudents }).map((_, index) => {
          // Generate different statuses
          const statusOptions: ('present' | 'absent' | 'late' | 'pending')[] = ['present', 'absent', 'late', 'pending'];
          const weightedStatus = index < totalStudents * 0.7 ? 'present' : 
                               index < totalStudents * 0.8 ? 'late' : 
                               index < totalStudents * 0.9 ? 'absent' : 
                               'pending';
          
          // Generate random engagement and attention values
          const engagement = weightedStatus === 'present' ? Math.random() * 0.5 + 0.5 : // 0.5 to 1.0
                          weightedStatus === 'late' ? Math.random() * 0.3 + 0.3 : // 0.3 to 0.6
                          Math.random() * 0.3; // 0.0 to 0.3
          
          const attention = weightedStatus === 'present' ? Math.random() * 0.6 + 0.4 : // 0.4 to 1.0
                         weightedStatus === 'late' ? Math.random() * 0.4 + 0.3 : // 0.3 to 0.7
                         Math.random() * 0.3; // 0.0 to 0.3
          
          // Generate random emotion
          const emotions = ['neutral', 'happy', 'engaged', 'confused', 'bored'];
          const dominantEmotion = emotions[Math.floor(Math.random() * emotions.length)];
          
          // Phone and ID card compliance
          const idCardVisible = Math.random() > 0.2; // 80% have ID card visible
          const phoneDetected = Math.random() < 0.15; // 15% have phone detected
          
          return {
            id: `student-${index + 1}`,
            name: `Student ${index + 1}`,
            studentId: `ST${100000 + index}`,
            status: weightedStatus,
            faceVerified: weightedStatus === 'present' || weightedStatus === 'late',
            idCardVisible,
            phoneDetected,
            engagement: parseFloat(engagement.toFixed(2)),
            attention: parseFloat(attention.toFixed(2)),
            dominantEmotion,
            lastUpdated: new Date(Date.now() - Math.random() * 30 * 60000).toISOString(), // Within last 30 minutes
          };
        });
        
        setStudents(mockStudents);
        
        // Calculate stats
        const present = mockStudents.filter(s => s.status === 'present').length;
        const absent = mockStudents.filter(s => s.status === 'absent').length;
        const late = mockStudents.filter(s => s.status === 'late').length;
        const pending = mockStudents.filter(s => s.status === 'pending').length;
        const complianceIssues = mockStudents.filter(s => s.phoneDetected || !s.idCardVisible).length;
        const avgEngagement = parseFloat((mockStudents.reduce((sum, s) => sum + s.engagement, 0) / mockStudents.length).toFixed(2));
        
        setStats({
          present,
          absent,
          late,
          pending,
          complianceIssues,
          avgEngagement,
        });
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (sessionId) {
      fetchData();
      
      // In a real app, we would set up a polling or websocket connection
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [sessionId, totalStudents]);
  
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  };
  
  const handleCloseDetails = () => {
    setSelectedStudent(null);
  };
  
  const handleStatusChange = (studentId: string, newStatus: 'present' | 'absent' | 'late' | 'pending') => {
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.id === studentId 
          ? { ...student, status: newStatus, lastUpdated: new Date().toISOString() } 
          : student
      )
    );
    
    // Update stats
    const updatedStudents = students.map(student => 
      student.id === studentId 
        ? { ...student, status: newStatus } 
        : student
    );
    
    const present = updatedStudents.filter(s => s.status === 'present').length;
    const absent = updatedStudents.filter(s => s.status === 'absent').length;
    const late = updatedStudents.filter(s => s.status === 'late').length;
    const pending = updatedStudents.filter(s => s.status === 'pending').length;
    
    setStats(prevStats => ({
      ...prevStats,
      present,
      absent,
      late,
      pending,
    }));
    
    // Update selected student if it's the one being changed
    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent({ ...selectedStudent, status: newStatus, lastUpdated: new Date().toISOString() });
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Stats */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Session Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.present}</p>
            <p className="text-sm text-gray-600">Present</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{stats.late}</p>
            <p className="text-sm text-gray-600">Late</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
            <p className="text-sm text-gray-600">Absent</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-gray-600">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">{stats.complianceIssues}</p>
            <p className="text-sm text-gray-600">Compliance Issues</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.avgEngagement}</p>
            <p className="text-sm text-gray-600">Avg. Engagement</p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Student List */}
        <div className="w-full md:w-2/3 p-6 overflow-auto max-h-[600px]">
          <h3 className="text-lg font-semibold mb-4">Students ({students.length})</h3>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {students.map(student => (
                <div
                  key={student.id}
                  className={`py-4 px-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedStudent?.id === student.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleStudentSelect(student)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                          student.status === 'present' ? 'bg-green-500' :
                          student.status === 'late' ? 'bg-yellow-500' :
                          student.status === 'absent' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`}>
                          {student.name.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.studentId}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {/* Status Badge */}
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.status === 'present' ? 'bg-green-100 text-green-800' :
                        student.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                        student.status === 'absent' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                      
                      {/* Compliance Indicators */}
                      <div className="ml-2 flex items-center space-x-1">
                        {!student.idCardVisible && (
                          <span title="ID Card not visible" className="text-orange-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12zm0-9a1 1 0 011 1v3a1 1 0 11-2 0V8a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                        {student.phoneDetected && (
                          <span title="Phone detected" className="text-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Student Details */}
        <div className="w-full md:w-1/3 p-6 border-t md:border-t-0 md:border-l border-gray-200">
          {selectedStudent ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">Student Details</h3>
                <button
                  onClick={handleCloseDetails}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                    selectedStudent.status === 'present' ? 'bg-green-500' :
                    selectedStudent.status === 'late' ? 'bg-yellow-500' :
                    selectedStudent.status === 'absent' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`}>
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="text-lg font-medium text-gray-900">{selectedStudent.name}</div>
                    <div className="text-gray-500">{selectedStudent.studentId}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedStudent.status === 'present' ? 'bg-green-100 text-green-800' :
                      selectedStudent.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      selectedStudent.status === 'absent' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedStudent.status.charAt(0).toUpperCase() + selectedStudent.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Face Verified:</span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedStudent.faceVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedStudent.faceVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ID Card Visible:</span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedStudent.idCardVisible ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {selectedStudent.idCardVisible ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Phone Detected:</span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedStudent.phoneDetected ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedStudent.phoneDetected ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="text-gray-800 text-sm">
                      {new Date(selectedStudent.lastUpdated).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <h4 className="font-medium mb-2">Engagement Metrics</h4>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Engagement:</span>
                    <span className="text-sm font-medium">{(selectedStudent.engagement * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        selectedStudent.engagement > 0.7 ? 'bg-green-500' :
                        selectedStudent.engagement > 0.4 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${selectedStudent.engagement * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Attention:</span>
                    <span className="text-sm font-medium">{(selectedStudent.attention * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        selectedStudent.attention > 0.7 ? 'bg-green-500' :
                        selectedStudent.attention > 0.4 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${selectedStudent.attention * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Dominant Emotion:</span>
                  <span className="ml-2 text-sm font-medium capitalize">{selectedStudent.dominantEmotion}</span>
                </div>
              </div>
              
              <h4 className="font-medium mb-2">Update Status</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStatusChange(selectedStudent.id, 'present')}
                  className={`py-2 px-4 text-sm font-medium rounded-md ${
                    selectedStudent.status === 'present'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  Present
                </button>
                <button
                  onClick={() => handleStatusChange(selectedStudent.id, 'late')}
                  className={`py-2 px-4 text-sm font-medium rounded-md ${
                    selectedStudent.status === 'late'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  }`}
                >
                  Late
                </button>
                <button
                  onClick={() => handleStatusChange(selectedStudent.id, 'absent')}
                  className={`py-2 px-4 text-sm font-medium rounded-md ${
                    selectedStudent.status === 'absent'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  Absent
                </button>
                <button
                  onClick={() => handleStatusChange(selectedStudent.id, 'pending')}
                  className={`py-2 px-4 text-sm font-medium rounded-md ${
                    selectedStudent.status === 'pending'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-center">Select a student to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

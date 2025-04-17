'use client';

import React, { useState, useEffect } from 'react';

interface ComplianceStats {
  idCardVisible: number;
  idCardHidden: number;
  phoneDetected: number;
  phoneNotDetected: number;
  totalStudents: number;
  complianceRate: number;
  phoneUsageRate: number;
  history: Array<{
    timestamp: string;
    complianceRate: number;
    phoneUsageRate: number;
  }>;
  nonCompliantStudents: Array<{
    id: string;
    name: string;
    studentId: string;
    issue: 'id_card' | 'phone' | 'both';
    lastDetected: string;
  }>;
}

interface IDCardComplianceMonitorProps {
  sessionId: string;
  refreshInterval?: number;
}

const IDCardComplianceMonitor: React.FC<IDCardComplianceMonitorProps> = ({
  sessionId,
  refreshInterval = 30000 // Default to 30 seconds
}) => {
  const [stats, setStats] = useState<ComplianceStats>({
    idCardVisible: 0,
    idCardHidden: 0,
    phoneDetected: 0,
    phoneNotDetected: 0,
    totalStudents: 0,
    complianceRate: 0,
    phoneUsageRate: 0,
    history: [],
    nonCompliantStudents: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // const response = await fetch(`/api/compliance/session/${sessionId}/stats`);
        // const data = await response.json();
        
        // For demo purposes, generate mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const totalStudents = Math.floor(Math.random() * 30) + 20; // Between 20-50 students
        const idCardHidden = Math.floor(Math.random() * 8); // 0-7 students
        const phoneDetected = Math.floor(Math.random() * 5); // 0-4 students
        
        const idCardVisible = totalStudents - idCardHidden;
        const phoneNotDetected = totalStudents - phoneDetected;
        
        const complianceRate = parseFloat((idCardVisible / totalStudents * 100).toFixed(1));
        const phoneUsageRate = parseFloat((phoneDetected / totalStudents * 100).toFixed(1));
        
        // Generate history data (last 10 points)
        const history = Array.from({ length: 10 }, (_, i) => {
          const timeOffset = (10 - i) * 5; // 5 minute intervals going back
          const timestamp = new Date(Date.now() - timeOffset * 60000).toISOString();
          
          // Random values that trend toward the current values
          const historyComplianceRate = Math.max(70, 
            Math.min(100, complianceRate + (Math.random() * 10 - 5)));
          
          const historyPhoneUsageRate = Math.max(0,
            Math.min(30, phoneUsageRate + (Math.random() * 6 - 3)));
            
          return {
            timestamp,
            complianceRate: parseFloat(historyComplianceRate.toFixed(1)),
            phoneUsageRate: parseFloat(historyPhoneUsageRate.toFixed(1))
          };
        });
        
        // Generate non-compliant students
        const nonCompliantCount = Math.min(idCardHidden + phoneDetected, 10);
        const nonCompliantStudents = Array.from({ length: nonCompliantCount }, (_, i) => {
          const issue: 'id_card' | 'phone' | 'both' = 
            i < Math.min(2, phoneDetected) ? 'both' :
            i < idCardHidden ? 'id_card' : 'phone';
          
          return {
            id: `student-${i + 1}`,
            name: `Student ${i + 1}`,
            studentId: `ST${100000 + i}`,
            issue,
            lastDetected: new Date(Date.now() - Math.floor(Math.random() * 15) * 60000).toISOString()
          };
        });
        
        setStats({
          idCardVisible,
          idCardHidden,
          phoneDetected,
          phoneNotDetected,
          totalStudents,
          complianceRate,
          phoneUsageRate,
          history,
          nonCompliantStudents
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching compliance data:', err);
        setError('Failed to load compliance data. Please try again later.');
        setLoading(false);
      }
    };

    fetchComplianceData();
    const interval = setInterval(fetchComplianceData, refreshInterval);
    
    return () => clearInterval(interval);
  }, [sessionId, refreshInterval]);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getIssueLabel = (issue: 'id_card' | 'phone' | 'both') => {
    switch (issue) {
      case 'id_card':
        return 'No ID Card';
      case 'phone':
        return 'Phone Usage';
      case 'both':
        return 'No ID Card + Phone Usage';
      default:
        return 'Unknown Issue';
    }
  };

  const getIssueColor = (issue: 'id_card' | 'phone' | 'both') => {
    switch (issue) {
      case 'id_card':
        return 'bg-orange-100 text-orange-800';
      case 'phone':
        return 'bg-red-100 text-red-800';
      case 'both':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceStatusColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPhoneUsageStatusColor = (rate: number) => {
    if (rate <= 5) return 'text-green-600';
    if (rate <= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Compliance Monitoring</h3>
        {loading && (
          <div className="h-5 w-5 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        )}
      </div>

      {loading && stats.totalStudents === 0 ? (
        <div className="h-48 flex items-center justify-center">
          <div className="h-8 w-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-2">
                <div className="text-sm text-gray-500">ID Card Compliance Rate</div>
                <div className="flex items-center mt-1">
                  <span className={`text-2xl font-bold ${getComplianceStatusColor(stats.complianceRate)}`}>
                    {stats.complianceRate}%
                  </span>
                  <span className="ml-2 text-sm text-gray-600">
                    ({stats.idCardVisible}/{stats.totalStudents} students)
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className={`h-2.5 rounded-full ${
                    stats.complianceRate >= 90 ? 'bg-green-500' : 
                    stats.complianceRate >= 75 ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}
                  style={{ width: `${stats.complianceRate}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-2">
                <div className="text-sm text-gray-500">Phone Usage Rate</div>
                <div className="flex items-center mt-1">
                  <span className={`text-2xl font-bold ${getPhoneUsageStatusColor(stats.phoneUsageRate)}`}>
                    {stats.phoneUsageRate}%
                  </span>
                  <span className="ml-2 text-sm text-gray-600">
                    ({stats.phoneDetected}/{stats.totalStudents} students)
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className={`h-2.5 rounded-full ${
                    stats.phoneUsageRate <= 5 ? 'bg-green-500' : 
                    stats.phoneUsageRate <= 15 ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}
                  style={{ width: `${stats.phoneUsageRate}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {stats.nonCompliantStudents.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Non-Compliant Students</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Student
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Issue
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Last Detected
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.nonCompliantStudents.map(student => (
                      <tr key={student.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.name} <span className="text-gray-500 ml-1">({student.studentId})</span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getIssueColor(student.issue)}`}>
                            {getIssueLabel(student.issue)}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(student.lastDetected)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-4 text-right">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </>
      )}
    </div>
  );
};

export default IDCardComplianceMonitor;

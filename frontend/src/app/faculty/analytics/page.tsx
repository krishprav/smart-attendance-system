'use client';

import Layout from '@/components/layout/Layout';
import { useState } from 'react';

export default function FacultyAnalyticsPage() {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('semester');
  
  // Mock data for analytics
  const analytics = {
    totalStudents: 120,
    averageAttendance: 82.5,
    classes: [
      { id: 'cs101', name: 'CS101 - Introduction to Programming' },
      { id: 'cs201', name: 'CS201 - Data Structures' },
      { id: 'cs301', name: 'CS301 - Algorithms' },
      { id: 'cs401', name: 'CS401 - Database Systems' },
    ],
    attendanceTrend: [
      { week: 'Week 1', rate: 92 },
      { week: 'Week 2', rate: 88 },
      { week: 'Week 3', rate: 85 },
      { week: 'Week 4', rate: 79 },
      { week: 'Week 5', rate: 81 },
      { week: 'Week 6', rate: 83 },
    ],
    engagementStats: {
      highEngagement: 65,
      mediumEngagement: 25,
      lowEngagement: 10,
    },
    behavioralInsights: [
      { id: 1, type: 'Mobile Phone Usage', count: 15, trend: 'decreasing' },
      { id: 2, type: 'ID Card Compliance', count: 95, trend: 'stable' },
      { id: 3, type: 'Attention Level', count: 78, trend: 'increasing' },
    ],
    topStudents: [
      { id: 1, name: 'Alex Johnson', attendance: 98, engagement: 'High' },
      { id: 2, name: 'Priya Sharma', attendance: 96, engagement: 'High' },
      { id: 3, name: 'Michael Chang', attendance: 95, engagement: 'Medium' },
      { id: 4, name: 'Sarah Williams', attendance: 93, engagement: 'High' },
      { id: 5, name: 'Raj Patel', attendance: 92, engagement: 'High' },
    ],
    atRiskStudents: [
      { id: 1, name: 'James Wilson', attendance: 65, engagement: 'Low', issues: ['Frequent absences', 'Low attention'] },
      { id: 2, name: 'Emma Davis', attendance: 68, engagement: 'Low', issues: ['Mobile usage', 'Low participation'] },
      { id: 3, name: 'Tomas Garcia', attendance: 70, engagement: 'Medium', issues: ['Late arrivals'] },
    ],
  };
  
  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') {
      return (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    } else if (trend === 'decreasing') {
      return (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" />
        </svg>
      );
    }
  };
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600 mb-6">Insights and trends from your classes</p>
        
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="all">All Classes</option>
              {analytics.classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="semester">This Semester</option>
            </select>
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
            Export Report
          </button>
        </div>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Total Students</h3>
            <p className="text-3xl font-bold">{analytics.totalStudents}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Average Attendance</h3>
            <p className="text-3xl font-bold">{analytics.averageAttendance}%</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm font-medium mb-1">High Engagement</h3>
            <p className="text-3xl font-bold">{analytics.engagementStats.highEngagement}%</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm font-medium mb-1">ID Card Compliance</h3>
            <p className="text-3xl font-bold">{analytics.behavioralInsights[1].count}%</p>
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Attendance Trend</h2>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-600">Attendance trend visualization</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Engagement Metrics</h2>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-600">Engagement metrics visualization</p>
            </div>
          </div>
        </div>
        
        {/* Behavioral Insights */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Behavioral Insights</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.behavioralInsights.map((insight) => (
                  <tr key={insight.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{insight.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{insight.count}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        {getTrendIcon(insight.trend)}
                        <span className="ml-2 capitalize">{insight.trend}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Student Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Top Performing Students</h2>
            <div className="overflow-y-auto max-h-80">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analytics.topStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{student.attendance}%</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{student.engagement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">At-Risk Students</h2>
            <div className="overflow-y-auto max-h-80">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analytics.atRiskStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{student.attendance}%</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <ul className="list-disc list-inside">
                          {student.issues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

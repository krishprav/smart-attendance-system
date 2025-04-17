import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// This is a placeholder component since we don't have actual engagement data yet
// In a real implementation, this would use actual data from the API

interface EngagementMetricsChartProps {
  loading?: boolean;
}

const EngagementMetricsChart: React.FC<EngagementMetricsChartProps> = ({ loading = false }) => {
  if (loading) {
    return (
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4"></div>
          <p className="text-gray-500">Loading chart data...</p>
        </div>
      </div>
    );
  }

  // Mock data for demonstration
  const mockData = [
    { name: 'Week 1', attention: 75, engagement: 65, emotion: 80 },
    { name: 'Week 2', attention: 68, engagement: 72, emotion: 75 },
    { name: 'Week 3', attention: 82, engagement: 80, emotion: 85 },
    { name: 'Week 4', attention: 78, engagement: 76, emotion: 72 },
    { name: 'Week 5', attention: 85, engagement: 82, emotion: 88 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={mockData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#6b7280' }}
          tickLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis 
          tickFormatter={(value) => `${value}%`}
          domain={[0, 100]}
          tick={{ fill: '#6b7280' }}
          tickLine={{ stroke: '#e5e7eb' }}
        />
        <Tooltip 
          formatter={(value) => [`${value}%`, '']}
          contentStyle={{ 
            backgroundColor: 'white', 
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: 'none'
          }}
        />
        <Legend />
        <Bar 
          dataKey="attention" 
          name="Attention" 
          fill="#4f46e5" 
          radius={[4, 4, 0, 0]}
          animationDuration={1500}
        />
        <Bar 
          dataKey="engagement" 
          name="Engagement" 
          fill="#10b981" 
          radius={[4, 4, 0, 0]}
          animationDuration={1500}
        />
        <Bar 
          dataKey="emotion" 
          name="Positive Emotion" 
          fill="#f59e0b" 
          radius={[4, 4, 0, 0]}
          animationDuration={1500}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EngagementMetricsChart;

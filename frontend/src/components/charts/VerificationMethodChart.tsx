import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface VerificationMethod {
  method: string;
  count: number;
}

interface VerificationMethodChartProps {
  data: VerificationMethod[];
  loading?: boolean;
}

// Custom colors for different verification methods
const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// Method name mapping for better display
const METHOD_NAMES: Record<string, string> = {
  'face': 'Face Recognition',
  'idcard': 'ID Card',
  'manual': 'Manual',
  'qrcode': 'QR Code',
  'rfid': 'RFID'
};

const VerificationMethodChart: React.FC<VerificationMethodChartProps> = ({ data, loading = false }) => {
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

  if (!data || data.length === 0) {
    return (
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No verification method data available</p>
      </div>
    );
  }

  // Format data for better display
  const formattedData = data.map(item => ({
    ...item,
    name: METHOD_NAMES[item.method] || item.method,
    value: item.count
  }));

  // Calculate total for percentage
  const total = formattedData.reduce((sum, item) => sum + item.count, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={formattedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          innerRadius={60}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          animationDuration={1500}
        >
          {formattedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value} (${((value as number / total) * 100).toFixed(1)}%)`, 'Count']}
          contentStyle={{ 
            backgroundColor: 'white', 
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: 'none'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default VerificationMethodChart;

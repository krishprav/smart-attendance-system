'use client';

import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string | number;
  className?: string;
}

const DashboardCard = ({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className = '',
}: DashboardCardProps) => {
  const getTrendIcon = () => {
    if (trend === 'up') {
      return (
        <svg
          className="w-4 h-4 text-green-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      );
    }
    if (trend === 'down') {
      return (
        <svg
          className="w-4 h-4 text-red-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-4 h-4 text-gray-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 12h14"
        />
      </svg>
    );
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-500';
    if (trend === 'down') return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow ${className}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {trendValue && (
              <span className={`ml-2 text-sm font-medium ${getTrendColor()}`}>
                {trendValue}
              </span>
            )}
          </div>
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
        {icon && <div className="p-3 bg-blue-50 rounded-lg">{icon}</div>}
      </div>

      {trend && trendValue && (
        <div className="mt-4 flex items-center">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()} ml-1`}>
            {trend === 'up' ? 'Increased' : trend === 'down' ? 'Decreased' : 'No change'} by{' '}
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;

import React from 'react';

interface AnalyticsCardProps {
  title: string;
  value: string | number | React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  icon,
  loading = false,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-indigo-800 text-sm font-semibold mb-1 uppercase tracking-wide flex items-center gap-1">
            {icon}
            {title}
          </h3>
          {loading ? (
            <div className="animate-pulse mt-2">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <p className="text-3xl font-extrabold text-gray-800">{value}</p>
          )}
        </div>
        <div className="bg-indigo-50 p-2 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCard;

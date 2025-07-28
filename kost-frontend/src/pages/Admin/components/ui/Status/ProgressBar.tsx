// File: src/pages/Admin/components/ui/Status/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  color = 'blue',
  showLabel = false,
  label,
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500'
  };

  // Auto color based on percentage
  let autoColor = color;
  if (color === 'blue') {
    if (percentage >= 80) autoColor = 'red';
    else if (percentage >= 60) autoColor = 'yellow';
    else autoColor = 'green';
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{label || 'Progress'}</span>
          <span className="font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div 
          className={`${sizeClasses[size]} rounded-full transition-all duration-300 ${colorClasses[autoColor]}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
import React from 'react';
import { Loader2, Home } from 'lucide-react';

export default function LoadingScreen({ message = 'Loading...', fullScreen = true }) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Logo */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
          <Home className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">Potuna Kost</span>
      </div>

      {/* Loading Spinner */}
      <div className="relative">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>

      {/* Loading Message */}
      <p className="text-sm text-gray-600 animate-pulse">{message}</p>

      {/* Loading Dots */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
}

// Component for inline loading states
export function InlineLoader({ size = 'sm', message }) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex items-center space-x-2">
      <Loader2 className={`${sizeClasses[size]} text-primary-600 animate-spin`} />
      {message && <span className="text-sm text-gray-600">{message}</span>}
    </div>
  );
}

// Component for button loading states
export function ButtonLoader({ size = 'sm' }) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return <Loader2 className={`${sizeClasses[size]} animate-spin`} />;
}

// Component for table loading states
export function TableLoader({ rows = 5, columns = 4 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 p-4 border-b border-gray-200">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="flex-1 h-4 bg-gray-300 rounded"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Component for card loading states
export function CardLoader() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow p-6">
      <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        <div className="h-4 bg-gray-300 rounded w-4/6"></div>
      </div>
    </div>
  );
}
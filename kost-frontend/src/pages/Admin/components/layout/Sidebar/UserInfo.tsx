// File: src/pages/Admin/components/layout/Sidebar/UserInfo.tsx
import React from 'react';

interface UserInfoProps {
  user: {
    name?: string;
    email?: string;
    role?: string;
    avatar?: string;
  } | null;
}

export const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
  const getInitials = (name?: string) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="px-6 py-5 border-b border-slate-200/80 bg-gradient-to-b from-slate-50 to-white">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-sm">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-full h-full rounded-xl object-cover"
            />
          ) : (
            getInitials(user?.name)
          )}
        </div>
        <div className="ml-4">
          <p className="text-sm font-semibold text-slate-800">
            {user?.name || 'Admin User'}
          </p>
          <p className="text-xs text-slate-500 capitalize">
            {user?.role || 'Administrator'}
          </p>
          <div className="flex items-center mt-1">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span className="text-xs text-green-600 font-medium">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};
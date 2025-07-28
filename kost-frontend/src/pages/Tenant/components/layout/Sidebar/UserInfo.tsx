// File: src/pages/Tenant/components/layout/Sidebar/UserInfo.tsx
import React from 'react';
import { MapPin, User, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User as UserType } from '../../../types/common';
import { TenantInfo } from '../../../types/dashboard';
import { StatusBadge } from '../../ui/Status';
import { getInitials, mergeClasses } from '../../../utils/helpers';
import { formatCurrency } from '../../../utils/formatters';

interface UserInfoProps {
  user?: UserType;
  tenantInfo?: TenantInfo;
  className?: string;
}

const UserInfo: React.FC<UserInfoProps> = ({
  user,
  tenantInfo,
  className = '',
}) => {
  if (!user || !tenantInfo) {
    return (
      <div className={mergeClasses('animate-pulse', className)}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'terminated':
        return 'error';
      default:
        return 'neutral';
    }
  };

  return (
    <Link 
      to="/tenant/profile"
      className={mergeClasses(
        'block group hover:bg-white rounded-xl p-3 transition-all duration-200',
        'hover:shadow-sm border border-transparent hover:border-blue-100',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {user.profile_photo ? (
            <img
              src={user.profile_photo}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
              {getInitials(user.name)}
            </div>
          )}
          
          {/* Status indicator */}
          <div className={mergeClasses(
            'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white',
            tenantInfo.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
          )} />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate text-sm">
              {user.name}
            </h3>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600 truncate">
              Room {tenantInfo.room_number}
            </span>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <StatusBadge
              status={getStatusVariant(tenantInfo.status)}
              label={tenantInfo.status}
              size="sm"
            />
            
            <span className="text-xs font-medium text-blue-600">
              {formatCurrency(tenantInfo.monthly_rent)}/mo
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default UserInfo;
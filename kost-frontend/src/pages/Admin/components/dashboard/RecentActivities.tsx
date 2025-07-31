// File: src/pages/Admin/components/dashboard/RecentActivities.tsx
import React, { useState } from 'react';
import { 
  Activity, User, CreditCard, DollarSign, AlertTriangle, 
  CheckCircle, Eye, ChevronRight
} from 'lucide-react';
import type { ActivityItem } from '../../types/dashboard';

interface RecentActivitiesProps {
  activities: ActivityItem[];
}

// Helper function to get activity icon
const getActivityIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'payment':
    case 'billing':
      return DollarSign;
    case 'rfid':
    case 'card':
      return CreditCard;
    case 'user':
    case 'tenant':
      return User;
    case 'access':
    case 'door':
      return CheckCircle;
    case 'alert':
    case 'warning':
      return AlertTriangle;
    default:
      return Activity;
  }
};

// Helper function to get activity color
const getActivityColor = (type: string, priority?: string) => {
  if (priority === 'high') {
    return { bg: 'bg-red-50', icon: 'bg-red-600', text: 'text-red-600' };
  }
  
  switch (type.toLowerCase()) {
    case 'payment':
      return { bg: 'bg-green-50', icon: 'bg-green-600', text: 'text-green-600' };
    case 'rfid':
      return { bg: 'bg-blue-50', icon: 'bg-blue-600', text: 'text-blue-600' };
    case 'user':
      return { bg: 'bg-purple-50', icon: 'bg-purple-600', text: 'text-purple-600' };
    case 'alert':
      return { bg: 'bg-red-50', icon: 'bg-red-600', text: 'text-red-600' };
    default:
      return { bg: 'bg-gray-50', icon: 'bg-gray-600', text: 'text-gray-600' };
  }
};

// Helper function to format relative time
const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Baru saja';
  if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam lalu`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} hari lalu`;
  
  return time.toLocaleDateString('id-ID', { 
    month: 'short', 
    day: 'numeric' 
  });
};

// Simplified Activity Item Component
const ActivityItemComponent: React.FC<{ activity: ActivityItem }> = ({ activity }) => {
  const Icon = getActivityIcon(activity.type);
  const colors = getActivityColor(activity.type, activity.priority);
  
  return (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors group">
      <div className={`p-2 rounded-lg ${colors.icon} flex-shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">
              {activity.title}
            </p>
            <p className="text-sm text-gray-600 line-clamp-2">
              {activity.description}
            </p>
            
            {activity.user && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-gray-500">
                  {activity.user.name}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <span className="text-xs text-gray-500">
              {formatRelativeTime(activity.timestamp)}
            </span>
            {activity.priority === 'high' && (
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            )}
            <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12 space-y-3">
    <div className="p-3 bg-gray-100 rounded-full">
      <Activity className="w-8 h-8 text-gray-400" />
    </div>
    <div className="text-center">
      <h3 className="text-sm font-medium text-gray-900 mb-1">Belum Ada Aktivitas</h3>
      <p className="text-xs text-gray-500">Aktivitas sistem akan muncul di sini</p>
    </div>
  </div>
);

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => {
  const [showAll, setShowAll] = useState(false);
  const displayLimit = 6;
  const displayedActivities = showAll ? activities : activities.slice(0, displayLimit);
  const hasMore = activities.length > displayLimit;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h3>
            <p className="text-sm text-gray-500">
              {activities.length > 0 
                ? `${activities.length} aktivitas sistem`
                : 'Belum ada aktivitas'
              }
            </p>
          </div>
        </div>
        
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showAll ? 'Tampilkan Sedikit' : `Lihat Semua (${activities.length})`}
          </button>
        )}
      </div>

      {/* Activities List */}
      <div className="max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-gray-50">
            {displayedActivities.map((activity) => (
              <ActivityItemComponent key={activity.id} activity={activity} />
            ))}
            
            {!showAll && hasMore && (
              <div className="p-4">
                <button
                  onClick={() => setShowAll(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Tampilkan {activities.length - displayLimit} aktivitas lainnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
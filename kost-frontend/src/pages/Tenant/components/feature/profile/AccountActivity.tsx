// File: src/pages/Tenant/components/feature/profile/AccountActivity.tsx
import React, { useState } from 'react';
import { Activity, User, CreditCard, Key, Bell, Shield, Calendar, Filter, Download } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button, IconButton } from '../../ui/Buttons';
import { Select } from '../../ui/Forms';
import { StatusBadge } from '../../ui/Status';
import { formatDateTime, formatTimeAgo } from '../../../utils/formatters';
import { mergeClasses } from '../../../utils/helpers';

interface ActivityItem {
  id: string;
  type: 'login' | 'password_change' | 'profile_update' | 'payment' | 'rfid_request' | 'access' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  metadata?: {
    ip_address?: string;
    device?: string;
    location?: string;
    amount?: number;
    card_id?: string;
  };
}

interface AccountActivityProps {
  className?: string;
}

// Mock data - in real app, this would come from API
const mockActivityData: ActivityItem[] = [
  {
    id: '1',
    type: 'login',
    title: 'Successful Login',
    description: 'Logged in to tenant portal',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    status: 'success',
    metadata: {
      ip_address: '192.168.1.100',
      device: 'Chrome on Windows',
      location: 'Jakarta, Indonesia'
    }
  },
  {
    id: '2',
    type: 'access',
    title: 'Room Access',
    description: 'Accessed Room 101 using RFID card',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'success',
    metadata: {
      card_id: 'RFID-001'
    }
  },
  {
    id: '3',
    type: 'payment',
    title: 'Payment Completed',
    description: 'Monthly rent payment processed',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'success',
    metadata: {
      amount: 2500000
    }
  },
  {
    id: '4',
    type: 'profile_update',
    title: 'Profile Updated',
    description: 'Updated phone number and emergency contact',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'success'
  },
  {
    id: '5',
    type: 'rfid_request',
    title: 'RFID Card Request',
    description: 'Requested replacement for lost card',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending'
  },
  {
    id: '6',
    type: 'login',
    title: 'Failed Login Attempt',
    description: 'Invalid password entered',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'failed',
    metadata: {
      ip_address: '203.78.121.45',
      device: 'Unknown Browser',
      location: 'Unknown Location'
    }
  }
];

const AccountActivity: React.FC<AccountActivityProps> = ({
  className = '',
}) => {
  const [activities] = useState<ActivityItem[]>(mockActivityData);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const typeOptions = [
    { value: 'all', label: 'All Activities' },
    { value: 'login', label: 'Login Activities' },
    { value: 'payment', label: 'Payments' },
    { value: 'access', label: 'Room Access' },
    { value: 'profile_update', label: 'Profile Updates' },
    { value: 'rfid_request', label: 'RFID Requests' },
    { value: 'notification', label: 'Notifications' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'success', label: 'Successful' },
    { value: 'failed', label: 'Failed' },
    { value: 'pending', label: 'Pending' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return User;
      case 'payment':
        return CreditCard;
      case 'access':
        return Key;
      case 'profile_update':
        return User;
      case 'rfid_request':
        return Key;
      case 'notification':
        return Bell;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string, status: string) => {
    if (status === 'failed') return 'text-red-600 bg-red-100';
    if (status === 'pending') return 'text-yellow-600 bg-yellow-100';
    
    switch (type) {
      case 'login':
        return 'text-blue-600 bg-blue-100';
      case 'payment':
        return 'text-green-600 bg-green-100';
      case 'access':
        return 'text-purple-600 bg-purple-100';
      case 'profile_update':
        return 'text-indigo-600 bg-indigo-100';
      case 'rfid_request':
        return 'text-orange-600 bg-orange-100';
      case 'notification':
        return 'text-cyan-600 bg-cyan-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const typeMatch = filterType === 'all' || activity.type === filterType;
    const statusMatch = filterStatus === 'all' || activity.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const handleExport = () => {
    // Export functionality
    console.log('Exporting activity log...');
  };

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Account Activity</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <IconButton
            icon={Download}
            onClick={handleExport}
            variant="secondary"
            size="sm"
            aria-label="Export activity log"
            className="hidden sm:inline-flex"
          />
          <IconButton
            icon={Filter}
            variant="secondary"
            size="sm"
            aria-label="Filter activities"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Select
          label="Activity Type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          options={typeOptions}
          variant="filled"
        />
        
        <Select
          label="Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={statusOptions}
          variant="filled"
        />
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">No activities found</h4>
            <p className="text-gray-500">
              No activities match your current filters.
            </p>
          </div>
        ) : (
          filteredActivities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colorClasses = getActivityColor(activity.type, activity.status);
            
            return (
              <div
                key={activity.id}
                className={mergeClasses(
                  'relative flex items-start gap-4 p-4 rounded-lg border transition-all duration-200',
                  'hover:shadow-md hover:border-blue-200',
                  activity.status === 'failed' ? 'bg-red-50 border-red-200' :
                  activity.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-white border-gray-200'
                )}
              >
                {/* Timeline line */}
                {index < filteredActivities.length - 1 && (
                  <div className="absolute left-8 top-12 w-0.5 h-8 bg-gray-200"></div>
                )}
                
                {/* Icon */}
                <div className={mergeClasses(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  colorClasses
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                      
                      {/* Metadata */}
                      {activity.metadata && (
                        <div className="mt-2 space-y-1">
                          {activity.metadata.ip_address && (
                            <div className="text-xs text-gray-500">
                              IP: {activity.metadata.ip_address}
                            </div>
                          )}
                          {activity.metadata.device && (
                            <div className="text-xs text-gray-500">
                              Device: {activity.metadata.device}
                            </div>
                          )}
                          {activity.metadata.location && (
                            <div className="text-xs text-gray-500">
                              Location: {activity.metadata.location}
                            </div>
                          )}
                          {activity.metadata.amount && (
                            <div className="text-xs text-gray-500">
                              Amount: Rp {activity.metadata.amount.toLocaleString('id-ID')}
                            </div>
                          )}
                          {activity.metadata.card_id && (
                            <div className="text-xs text-gray-500">
                              Card: {activity.metadata.card_id}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge
                        status={activity.status === 'success' ? 'success' : 
                               activity.status === 'failed' ? 'error' : 'warning'}
                        label={activity.status}
                        size="sm"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>{formatDateTime(activity.timestamp)}</span>
                    <span>{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load More */}
      {filteredActivities.length > 0 && (
        <div className="text-center pt-6 border-t border-gray-200">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {/* Load more functionality */}}
          >
            Load More Activities
          </Button>
        </div>
      )}

      {/* Activity Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-green-600">
              {activities.filter(a => a.status === 'success').length}
            </div>
            <div className="text-xs text-gray-500">Successful</div>
          </div>
          
          <div>
            <div className="text-lg font-semibold text-red-600">
              {activities.filter(a => a.status === 'failed').length}
            </div>
            <div className="text-xs text-gray-500">Failed</div>
          </div>
          
          <div>
            <div className="text-lg font-semibold text-yellow-600">
              {activities.filter(a => a.status === 'pending').length}
            </div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {activities.length}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Security Notice</p>
            <p>
              This log shows your recent account activities. If you notice any suspicious activities 
              that you didn't perform, please contact support immediately.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AccountActivity;
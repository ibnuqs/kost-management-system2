// File: src/pages/Admin/components/feature/access-logs/AccessLogStats.tsx
import React from 'react';
import { Shield, CheckCircle, XCircle, Clock } from 'lucide-react';

import type { AccessLogStats as AccessLogStatsData } from '../../../types/accessLog';

interface AccessLogStatsProps {
  stats: AccessLogStatsData;
}

export const AccessLogStats: React.FC<AccessLogStatsProps> = ({ stats }) => {
  const statItems = [
    {
      label: 'Today Total',
      value: stats.total_today.toLocaleString(),
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Granted Today',
      value: stats.granted_today.toLocaleString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Denied Today',
      value: stats.denied_today.toLocaleString(),
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      label: 'This Week',
      value: stats.total_week.toLocaleString(),
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
              <div className={`p-3 rounded-full ${item.bgColor}`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
            </div>
            {item.label === 'Granted Today' && (
              <div className="mt-2">
                <span className="text-sm text-gray-500">
                  Success Rate: {stats.total_today > 0 ? ((stats.granted_today / stats.total_today) * 100).toFixed(1) : 0}%
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
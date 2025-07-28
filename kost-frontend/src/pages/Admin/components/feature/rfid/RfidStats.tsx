// File: src/pages/Admin/components/feature/rfid/RfidStats.tsx
import React from 'react';
import { CreditCard, CheckCircle, Users, AlertCircle } from 'lucide-react';

interface RfidStatsData {
  total: number;
  active: number;
  assigned: number;
  unassigned: number;
}

interface RfidStatsProps {
  stats: RfidStatsData;
}

export const RfidStats: React.FC<RfidStatsProps> = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Cards',
      value: stats.total,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Active Cards',
      value: stats.active,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Assigned',
      value: stats.assigned,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Unassigned',
      value: stats.unassigned,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="p-6 border-b">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">RFID Card Statistics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{item.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                </div>
                <div className={`p-3 rounded-full ${item.bgColor}`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
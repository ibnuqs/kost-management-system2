// File: src/pages/Admin/components/dashboard/StatsCards.tsx
import React from 'react';
import { 
  Building, Users, DollarSign, Sun, UserCheck, UserX,
  TrendingUp, TrendingDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { Card } from '../ui';
import type { DashboardStats } from '../../types';

interface StatsCardsProps {
  stats: DashboardStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const netTenantGrowth = (stats.new_tenants_this_month ?? 0) - (stats.moved_out_this_month ?? 0);
  
  const formatCurrency = (amount: number): string => {
    if (amount >= 1_000_000_000) {
      return `Rp ${(amount / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
    }
    if (amount >= 1_000_000) {
      return `Rp ${(amount / 1_000_000).toFixed(1).replace('.', ',')} Jt`;
    }
    if (amount >= 1_000) {
      return `Rp ${(amount / 1_000).toFixed(0)} Rb`;
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const statCards = [
    { 
      label: 'Occupancy Rate', 
      value: `${(stats.occupancy_percentage ?? 0).toFixed(1)}%`, 
      icon: Building, 
      detail: `${stats.occupied_rooms ?? 0} / ${stats.total_rooms ?? 0} Rooms`,
      color: (stats.occupancy_percentage ?? 0) > 80 ? 'text-emerald-600' : 'text-amber-600',
      bgColor: (stats.occupancy_percentage ?? 0) > 80 ? 'bg-emerald-50' : 'bg-amber-50',
      iconColor: (stats.occupancy_percentage ?? 0) > 80 ? 'text-emerald-600' : 'text-amber-600',
      trend: (stats.occupancy_percentage ?? 0) > 75 ? 'up' : 'down'
    },
    { 
      label: 'Net Tenants', 
      value: `${netTenantGrowth > 0 ? '+' : ''}${netTenantGrowth}`, 
      icon: netTenantGrowth >= 0 ? UserCheck : UserX, 
      detail: `+${stats.new_tenants_this_month ?? 0} in, -${stats.moved_out_this_month ?? 0} out`,
      color: netTenantGrowth >= 0 ? 'text-emerald-600' : 'text-red-600',
      bgColor: netTenantGrowth >= 0 ? 'bg-emerald-50' : 'bg-red-50',
      iconColor: netTenantGrowth >= 0 ? 'text-emerald-600' : 'text-red-600',
      trend: netTenantGrowth >= 0 ? 'up' : 'down'
    },
    { 
      label: 'Monthly Revenue', 
      value: formatCurrency(stats.monthly_revenue ?? 0), 
      icon: DollarSign, 
      detail: `${(stats.collection_rate ?? 0).toFixed(1)}% Collection Rate`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trend: (stats.collection_rate ?? 0) > 90 ? 'up' : 'stable'
    },
    { 
      label: 'Peak Access', 
      value: stats.peak_hour ?? '00:00', 
      icon: Sun, 
      detail: `${stats.today_activities ?? 0} entries today`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      trend: 'stable'
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <ArrowUp className="w-3 h-3 text-gray-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={`stat-card-${stat.label}-${index}`} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  {getTrendIcon(stat.trend)}
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.detail}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
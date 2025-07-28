import React from 'react';
import { 
  Building, Users, DollarSign, CreditCard,
  TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import type { DashboardStats as DashboardStatsType } from '../../types/dashboard';

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

// Helper functions
const formatCurrency = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}Jt`;
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)}K`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

const formatPercentage = (value: number): string => `${value.toFixed(0)}%`;

// Simplified Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'stable';
  colorScheme: 'blue' | 'green' | 'orange' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, value, subtitle, icon: Icon, trend, colorScheme 
}) => {
  const colorClasses = {
    blue: { 
      bg: 'bg-blue-50', 
      icon: 'bg-blue-600 text-white',
      text: 'text-blue-600',
      border: 'border-blue-100'
    },
    green: { 
      bg: 'bg-green-50', 
      icon: 'bg-green-600 text-white',
      text: 'text-green-600',
      border: 'border-green-100'
    },
    orange: { 
      bg: 'bg-orange-50', 
      icon: 'bg-orange-600 text-white',
      text: 'text-orange-600',
      border: 'border-orange-100'
    },
    purple: { 
      bg: 'bg-purple-50', 
      icon: 'bg-purple-600 text-white',
      text: 'text-purple-600',
      border: 'border-purple-100'
    }
  };

  const colors = colorClasses[colorScheme];

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${colors.border} p-6 hover:shadow-md transition-all duration-200`}>
      {/* Header with icon */}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className="flex items-center">
            {getTrendIcon()}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
};

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  // Calculate derived values safely - using flat structure
  const occupancyRate = stats?.occupancy_percentage ?? 0;
  const totalActive = stats?.total_active_tenants ?? 0;
  const monthlyRevenue = stats?.monthly_revenue ?? 0;
  const collectionRate = stats?.collection_rate ?? 0;
  const totalCards = stats?.total_rfid_cards ?? 0;
  const assignedCards = stats?.assigned_cards ?? 0;
  
  // Get room counts - using flat structure
  const occupiedRooms = stats?.occupied_rooms ?? 0;
  const totalRooms = stats?.total_rooms ?? 0;
  const availableRooms = stats?.available_rooms ?? 0;
  
  // Get payment info - using flat structure
  const paidThisMonth = stats?.paid_this_month ?? 0;
  const totalThisMonth = stats?.total_payments_this_month ?? 0;

  const statCards: StatCardProps[] = [
    {
      title: 'Tingkat Hunian',
      value: formatPercentage(occupancyRate),
      subtitle: `${occupiedRooms}/${totalRooms} kamar terisi`,
      icon: Building,
      trend: occupancyRate > 80 ? 'up' : occupancyRate > 60 ? 'stable' : 'down',
      colorScheme: occupancyRate > 80 ? 'green' : 'orange'
    },
    {
      title: 'Penyewa Aktif',
      value: (totalActive || 0).toLocaleString('id-ID'),
      subtitle: `${availableRooms} kamar tersedia`,
      icon: Users,
      trend: totalActive > 0 ? 'up' : 'stable',
      colorScheme: 'blue'
    },
    {
      title: 'Pendapatan Bulanan',
      value: formatCurrency(monthlyRevenue),
      subtitle: `${formatPercentage(collectionRate)} terkumpul`,
      icon: DollarSign,
      trend: collectionRate > 90 ? 'up' : collectionRate > 70 ? 'stable' : 'down',
      colorScheme: 'green'
    },
    {
      title: 'Kartu RFID',
      value: (totalCards || 0).toLocaleString('id-ID'),
      subtitle: `${assignedCards} kartu aktif`,
      icon: CreditCard,
      trend: assignedCards > 0 ? 'up' : 'stable',
      colorScheme: 'purple'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
};
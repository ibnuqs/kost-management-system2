// File: src/pages/Admin/components/feature/rooms/RoomStats.tsx
import React from 'react';
import { 
  Building, Home, Wrench, CheckCircle, Archive, Clock,
  TrendingUp, TrendingDown 
} from 'lucide-react';
import type { RoomStats as RoomStatsType } from '../../../types/room';

interface RoomStatsProps {
  stats: RoomStatsType;
}

// Helper function to get occupancy status
const getOccupancyStatus = (rate: number) => {
  if (rate >= 85) return { color: 'text-green-600', bg: 'bg-green-50', trend: 'up', status: 'Sangat Baik' };
  if (rate >= 70) return { color: 'text-blue-600', bg: 'bg-blue-50', trend: 'up', status: 'Baik' };
  if (rate >= 50) return { color: 'text-yellow-600', bg: 'bg-yellow-50', trend: 'stable', status: 'Cukup' };
  return { color: 'text-red-600', bg: 'bg-red-50', trend: 'down', status: 'Rendah' };
};

// Stat card component
interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  colorScheme: 'blue' | 'green' | 'orange' | 'purple' | 'gray';
  trend?: 'up' | 'down' | 'stable';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, value, subtitle, icon: Icon, colorScheme, trend 
}) => {
  const colorClasses = {
    blue: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    green: { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    orange: { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    gray: { text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' }
  };

  const colors = colorClasses[colorScheme];

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${colors.border} p-6 hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {getTrendIcon()}
          </div>
          <p className={`text-3xl font-bold ${colors.text} mb-1`}>
            {(value || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        
        <div className={`p-3 rounded-full ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
      </div>
    </div>
  );
};

export const RoomStats: React.FC<RoomStatsProps> = ({ stats }) => {
  const occupancyStatus = getOccupancyStatus(stats.occupancy_rate || 0);
  
  // Primary stats that admin cares most about
  const primaryStats = [
    {
      title: 'Total Kamar',
      value: stats.total_rooms || 0,
      subtitle: 'Total inventori',
      icon: Building,
      colorScheme: 'blue' as const
    },
    {
      title: 'Siap Huni',
      value: stats.available_rooms || 0,
      subtitle: 'Dapat dipesan',
      icon: CheckCircle,
      colorScheme: 'green' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Primary Stats - Main metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Occupancy Overview - Enhanced */}
        <div className="md:col-span-2 lg:col-span-2">
          <div className={`${occupancyStatus.bg} rounded-xl p-6 border-2 ${occupancyStatus.color.replace('text-', 'border-')} h-full`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Tingkat Hunian
                </h3>
                <p className="text-sm text-gray-600">
                  Performa hunian keseluruhan
                </p>
              </div>
              
              <div className="text-right">
                <div className={`text-4xl font-bold ${occupancyStatus.color}`}>
                  {(stats.occupancy_rate || 0).toFixed(1)}%
                </div>
                <div className={`text-sm font-semibold ${occupancyStatus.color} flex items-center gap-1 justify-end`}>
                  {occupancyStatus.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                  {occupancyStatus.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                  {occupancyStatus.status}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-700 ${occupancyStatus.color.replace('text-', 'bg-')}`}
                  style={{ width: `${Math.min(stats.occupancy_rate || 0, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span className="font-medium">Target 85%</span>
                <span>100%</span>
              </div>
            </div>
            
            {/* Quick Summary */}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.occupied_rooms || 0}</div>
                <div className="text-xs text-gray-600">Terisi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.available_rooms || 0}</div>
                <div className="text-xs text-gray-600">Tersedia</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Total Rooms */}
        <StatCard 
          title="Total Kamar"
          value={stats.total_rooms || 0}
          subtitle="Total inventori"
          icon={Building}
          colorScheme="blue"
        />
        
        {/* Monthly Revenue */}
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-600">Revenue Bulanan</p>
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-1">
                {stats.total_revenue !== undefined && stats.total_revenue > 0 
                  ? new Intl.NumberFormat('id-ID', { 
                      style: 'currency', 
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(stats.total_revenue)
                  : 'Rp 0'
                }
              </p>
              <p className="text-sm text-gray-500">
                {(stats.occupied_rooms || 0) > 0 
                  ? `Dari ${stats.occupied_rooms} kamar terisi`
                  : 'Belum ada kamar terisi'
                }
              </p>
            </div>
            
            <div className="p-3 rounded-full bg-blue-50">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Secondary Stats - Better organized metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Reserved Rooms */}
        <div className="bg-white rounded-xl border border-purple-200 p-4 hover:shadow-md hover:border-purple-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-2xl font-bold text-purple-600 mb-1">{stats.reserved_rooms || 0}</div>
              <div className="text-sm font-medium text-gray-600">Direservasi</div>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        
        {/* Maintenance Rooms */}
        <div className="bg-white rounded-xl border border-orange-200 p-4 hover:shadow-md hover:border-orange-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-2xl font-bold text-orange-600 mb-1">{stats.maintenance_rooms || 0}</div>
              <div className="text-sm font-medium text-gray-600">Perawatan</div>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <Wrench className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
        
        {/* Archived Rooms */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-600 mb-1">{stats.archived_rooms || 0}</div>
              <div className="text-sm font-medium text-gray-600">Diarsipkan</div>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <Archive className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Average Price */}
        <div className="bg-white rounded-xl border border-emerald-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-lg font-bold text-emerald-600 mb-1">
                {stats.average_monthly_price 
                  ? new Intl.NumberFormat('id-ID', { 
                      style: 'currency', 
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(stats.average_monthly_price)
                  : 'N/A'
                }
              </div>
              <div className="text-sm font-medium text-gray-600">Rata-rata Harga</div>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
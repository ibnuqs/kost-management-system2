// File: src/pages/Admin/components/features/iot/DeviceStats.tsx
import React from 'react';
import { Monitor, Wifi, WifiOff, DoorOpen , CreditCard, TrendingUp, Activity } from 'lucide-react';

interface DeviceStatsProps {
  stats: {
    total: number;
    online: number;
    offline: number;
    door_locks: number;
    card_scanners: number;
  };
}

const DeviceStats: React.FC<DeviceStatsProps> = ({ stats }) => {
  const uptimePercentage = stats.total > 0 ? ((stats.online / stats.total) * 100).toFixed(1) : 0;
  
  const statItems = [
    {
      label: 'Total Perangkat',
      value: stats.total.toLocaleString(),
      icon: Monitor,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Semua perangkat terdaftar'
    },
    {
      label: 'Perangkat Terhubung',
      value: stats.online.toLocaleString(),
      icon: Wifi,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Sedang aktif',
      percentage: stats.total > 0 ? `${((stats.online / stats.total) * 100).toFixed(1)}%` : '0%'
    },
    {
      label: 'Perangkat Terputus',
      value: stats.offline.toLocaleString(),
      icon: WifiOff,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'Perlu perhatian',
      percentage: stats.total > 0 ? `${((stats.offline / stats.total) * 100).toFixed(1)}%` : '0%'
    },
    {
      label: 'Kunci Pintu',
      value: stats.door_locks.toLocaleString(),
      icon: DoorOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'Perangkat kontrol akses'
    },
    {
      label: 'Pembaca Kartu',
      value: stats.card_scanners.toLocaleString(),
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      description: 'Pembaca RFID'
    }
  ];

  const getHealthStatus = () => {
    const uptime = parseFloat(uptimePercentage.toString());
    if (uptime >= 95) return { label: 'Sangat Baik', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (uptime >= 85) return { label: 'Baik', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (uptime >= 70) return { label: 'Cukup', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { label: 'Buruk', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="space-y-6">
      {/* Main Stats Grid - Improved Mobile Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div 
              key={index} 
              className={`${item.bgColor} ${item.borderColor} border-2 rounded-xl p-4 lg:p-6 transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-2 lg:mb-3">
                <div className={`p-1.5 lg:p-2 rounded-lg ${item.bgColor} ${item.borderColor} border`}>
                  <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${item.color}`} />
                </div>
                {item.percentage && (
                  <span className={`text-xs font-medium px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-full ${item.bgColor} ${item.color}`}>
                    {item.percentage}
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                <h3 className="font-semibold text-xs lg:text-sm text-gray-600 leading-tight">{item.label}</h3>
                <p className={`text-lg lg:text-2xl font-bold ${item.color} mb-1`}>{item.value}</p>
                <p className="text-xs text-gray-500 leading-tight">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Health Overview - Improved Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* System Health */}
        <div className="bg-white rounded-xl border-2 border-gray-100 p-4 lg:p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">🎯 Kesehatan Sistem</h3>
            <Activity className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Tingkat Uptime</span>
                <span className={`text-lg lg:text-xl font-bold ${healthStatus.color}`}>
                  {uptimePercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    parseFloat(uptimePercentage.toString()) >= 95 ? 'bg-green-500' :
                    parseFloat(uptimePercentage.toString()) >= 85 ? 'bg-blue-500' :
                    parseFloat(uptimePercentage.toString()) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${uptimePercentage}%` }}
                />
              </div>
            </div>
            
            <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${healthStatus.bgColor} ${healthStatus.color} w-full justify-center`}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Status: {healthStatus.label}
            </div>
          </div>
        </div>

        {/* Device Distribution */}
        <div className="bg-white rounded-xl border-2 border-gray-100 p-4 lg:p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">📱 Tipe Perangkat</h3>
            <Monitor className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-1.5 bg-purple-100 rounded-lg mr-3">
                  <DoorOpen  className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm text-gray-600">Kunci Pintu</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-purple-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${stats.total > 0 ? (stats.door_locks / stats.total) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-bold text-purple-600 min-w-[2rem]">
                  {stats.door_locks}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-1.5 bg-orange-100 rounded-lg mr-3">
                  <CreditCard className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm text-gray-600">Pembaca RFID</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${stats.total > 0 ? (stats.card_scanners / stats.total) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-bold text-orange-600 min-w-[2rem]">
                  {stats.card_scanners}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats - Enhanced */}
        <div className="bg-white rounded-xl border-2 border-gray-100 p-4 lg:p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">⚡ Statistik Cepat</h3>
            <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Tingkat Online
              </span>
              <span className="text-sm font-bold text-green-600">
                {uptimePercentage}%
              </span>
            </div>
            
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Total Perangkat
              </span>
              <span className="text-sm font-bold text-blue-600">
                {stats.total.toLocaleString()}
              </span>
            </div>
            
            <div className={`flex justify-between items-center p-2 rounded-lg ${
              stats.offline > 0 ? 'bg-red-50' : 'bg-green-50'
            }`}>
              <span className="text-sm text-gray-600 flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  stats.offline > 0 ? 'bg-red-500' : 'bg-green-500'
                }`}></div>
                Masalah Sistem
              </span>
              <span className={`text-sm font-bold ${
                stats.offline > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {stats.offline > 0 ? `${stats.offline} terputus` : 'Semua Baik ✅'}
              </span>
            </div>
            
            <div className="pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 text-center bg-gray-50 py-2 rounded">
                🕐 Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceStats;
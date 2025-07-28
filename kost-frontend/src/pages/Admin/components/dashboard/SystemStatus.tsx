// File: src/pages/Admin/components/dashboard/SystemStatus.tsx
import React from 'react';
import { 
  Server, 
  Database, 
  Wifi, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  RefreshCw
} from 'lucide-react';

interface SystemStatusProps {
  isLoading: boolean;
  stats?: any;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ isLoading, stats }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 border">
        <div className="flex items-center gap-3 mb-4">
          <Server className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Status Sistem</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // System health berdasarkan data real dari backend
  const systemHealth = {
    api: {
      name: 'API Backend',
      status: stats ? 'online' : 'offline',
      value: stats ? 'Connected' : 'Disconnected',
      icon: Server
    },
    database: {
      name: 'Database SQLite',
      status: stats?.total_rooms !== undefined ? 'online' : 'offline',
      value: stats ? `${stats.total_rooms || 0} rooms loaded` : 'No data',
      icon: Database
    },
    users: {
      name: 'User Management',
      status: stats?.total_active_tenants !== undefined ? 'online' : 'offline',
      value: stats ? `${stats.total_active_tenants || 0} active users` : 'No users',
      icon: Shield
    },
    payments: {
      name: 'Payment System',
      status: stats?.total_payments_this_month !== undefined ? 'online' : 'offline',
      value: stats ? `${stats.total_payments_this_month || 0} payments this month` : 'No data',
      icon: Wifi
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-50';
      case 'offline': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return CheckCircle;
      case 'offline': return AlertCircle;
      default: return Clock;
    }
  };

  const onlineCount = Object.values(systemHealth).filter(s => s.status === 'online').length;
  const totalCount = Object.values(systemHealth).length;
  const overallStatus = onlineCount === totalCount 
    ? `Semua sistem berjalan normal (${onlineCount}/${totalCount})` 
    : `${onlineCount}/${totalCount} sistem online`;

  return (
    <div className="bg-white rounded-lg p-6 border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Server className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold">Status Sistem</h3>
            <p className="text-xs text-gray-500">Monitoring kesehatan sistem real-time</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <RefreshCw className="w-3 h-3" />
          <span>Auto-refresh</span>
        </div>
      </div>

      {/* Overall Status */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">Status Keseluruhan</p>
            <p className="text-sm text-blue-700">{overallStatus}</p>
          </div>
        </div>
      </div>

      {/* System Components */}
      <div className="space-y-4">
        {Object.entries(systemHealth).map(([key, component]) => {
          const StatusIcon = getStatusIcon(component.status);
          const IconComponent = component.icon;

          return (
            <div key={key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <IconComponent className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{component.name}</p>
                  <p className="text-xs text-gray-500">{component.value}</p>
                </div>
              </div>
              
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(component.status)}`}>
                <StatusIcon className="w-3 h-3" />
                <span className="capitalize">{component.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Stats - Data Real */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-gray-600">Total Kamar</p>
          <p className="text-lg font-semibold text-green-600">{stats?.total_rooms || 0}</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600">Penyewa Aktif</p>
          <p className="text-lg font-semibold text-blue-600">{stats?.total_active_tenants || 0}</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-xs text-gray-600">RFID Cards</p>
          <p className="text-lg font-semibold text-purple-600">{stats?.active_rfid_cards || 0}</p>
        </div>
      </div>
    </div>
  );
};

export { SystemStatus };
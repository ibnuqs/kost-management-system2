// File: src/pages/Admin/pages/Dashboard.tsx
import React, { useState } from 'react';
import {
  RefreshCw, TrendingUp, Users, CreditCard, AlertCircle,
  Building2, Wifi, WifiOff, Clock, Eye, Shield, Zap,
  DollarSign, Settings, Activity
} from 'lucide-react';
import { useDashboard } from '../hooks';
import { useIoTDevices } from '../hooks/useIoTDevices';
import {
  RevenueChart,
  SystemStatus,
  AccessHistoryChart,
  PaymentTrendsChart,
  RecentActivities,
  SystemHealthPanel
} from '../components/dashboard';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

// Simplified Loading Component
const DashboardLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-600">Memuat dashboard...</p>
    </div>
  </div>
);

// Simplified Error Component
const DashboardError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center space-y-4 max-w-sm">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Gagal Memuat Data</h3>
        <p className="text-sm text-gray-600 mb-4">Terjadi kesalahan saat memuat dashboard.</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      </div>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const {
    stats,
    activities,
    revenueData,
    accessHistoryData,
    paymentTrendsData,
    // occupancyHistoryData not available in current hook
    loading,
    lastUpdated,
    loadRevenueData,
    refresh
  } = useDashboard();

  // Get real IoT device data
  const { devices: iotDevices } = useIoTDevices();

  const [revenuePeriod, setRevenuePeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-refresh revenue data when period changes
  React.useEffect(() => {
    loadRevenueData(revenuePeriod);
  }, [revenuePeriod, loadRevenueData]);

  // Handle period change with auto-refresh
  const handlePeriodChange = (newPeriod: 'monthly' | 'yearly') => {
    setRevenuePeriod(newPeriod);
    // loadRevenueData will be called automatically by useEffect
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh(revenuePeriod);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Show loading state on initial load
  if (loading.stats && !stats) {
    return (
      <div className="p-6">
        <DashboardLoading />
      </div>
    );
  }

  // Show error state if stats failed to load
  if (!loading.stats && !stats) {
    return (
      <div className="p-6">
        <DashboardError onRetry={() => refresh(revenuePeriod)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin Kost</h1>
                <p className="text-sm text-gray-600">
                  {currentTime.toLocaleDateString('id-ID', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} - Data Real Time
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                {currentTime.toLocaleTimeString('id-ID', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="text-xs text-gray-500">
                Update: {lastUpdated.toLocaleTimeString('id-ID', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Memperbarui...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      
        {/* Simple Stats Cards without Gradients */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Occupancy Rate */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium">Tingkat Hunian</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{stats.occupancy_percentage}%</p>
                  <p className="text-blue-600 text-sm mt-1">{stats.occupied_rooms} dari {stats.total_rooms} kamar</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Revenue This Month */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">Pendapatan Bulan Ini</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">Rp {(stats.monthly_revenue || 0).toLocaleString('id-ID')}</p>
                  <div className="flex items-center text-green-600 text-sm mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{stats.revenue_growth || 0}% dari bulan lalu
                  </div>
                </div>
                <div className="p-3 bg-green-500 rounded-lg">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Device Status - Using real IoT data */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 text-sm font-medium">Perangkat IoT</p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">
                    {iotDevices ? iotDevices.filter(d => d.status === 'online').length : 0}/{iotDevices ? iotDevices.length : 0}
                  </p>
                  <div className="flex items-center text-purple-600 text-sm mt-1">
                    {iotDevices && iotDevices.length > 0 ? (
                      <>
                        <Wifi className="w-3 h-3 mr-1" />
                        {Math.round((iotDevices.filter(d => d.status === 'online').length / iotDevices.length) * 100)}% Online
                      </>
                    ) : (
                      <><WifiOff className="w-3 h-3 mr-1" />Tidak ada perangkat</>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-700 text-sm font-medium">Aktivitas Hari Ini</p>
                  <p className="text-3xl font-bold text-orange-900 mt-1">{stats.today_activities || 0}</p>
                  <p className="text-orange-600 text-sm mt-1">Akses pintu & pembayaran</p>
                </div>
                <div className="p-3 bg-orange-500 rounded-lg">
                  <Eye className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Aksi Cepat</h3>
            <div className="text-xs text-gray-500">Shortcut untuk tugas harian</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {onNavigate && (
              <>
                <button
                  onClick={() => onNavigate('tenants')}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200 group"
                >
                  <div className="p-3 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm text-center">Kelola Penyewa</p>
                </button>
                
                <button
                  onClick={() => onNavigate('rooms')}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-200 group"
                >
                  <div className="p-3 bg-green-600 rounded-lg group-hover:bg-green-700 transition-colors mb-3">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm text-center">Kelola Kamar</p>
                </button>
                
                <button
                  onClick={() => onNavigate('payments')}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-200 group"
                >
                  <div className="p-3 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors mb-3">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm text-center">Kelola Pembayaran</p>
                </button>

                <button
                  onClick={() => onNavigate('smart-access')}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition-all duration-200 group"
                >
                  <div className="p-3 bg-orange-600 rounded-lg group-hover:bg-orange-700 transition-colors mb-3">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm text-center">Smart Access</p>
                </button>

                <button
                  onClick={() => onNavigate('iot-devices')}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-xl transition-all duration-200 group"
                >
                  <div className="p-3 bg-red-600 rounded-lg group-hover:bg-red-700 transition-colors mb-3">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm text-center">Hub IoT</p>
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl transition-all duration-200 group disabled:opacity-50"
                >
                  <div className="p-3 bg-gray-600 rounded-lg group-hover:bg-gray-700 transition-colors mb-3">
                    <Settings className={`w-6 h-6 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
                  </div>
                  <p className="font-medium text-gray-900 text-sm text-center">Refresh Data</p>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Simple Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart 
            data={revenueData} 
            period={revenuePeriod} 
            onPeriodChange={handlePeriodChange}
            isLoading={loading.revenue}
          />
          
          <SystemStatus 
            isLoading={loading.stats}
            stats={stats}
          />
          
          <AccessHistoryChart 
            data={accessHistoryData}
            isLoading={loading.accessHistory}
            totalAllTime={stats?.total_access_all_time}
          />
          
          <PaymentTrendsChart 
            data={paymentTrendsData}
            isLoading={loading.paymentTrends}
          />
        </div>
        
        {/* Enhanced Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <RecentActivities activities={activities} />
        </div>
        
        {/* System Health Panel */}
        <SystemHealthPanel />
      </div>
    </div>
  );
};

export default Dashboard;
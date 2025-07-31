import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Shield } from 'lucide-react';

interface AccessData {
  period: string;
  date?: string;
  total_access: number;
  successful_access: number;
  failed_access: number;
  unique_users: number;
  success_rate?: number;
}

interface AccessHistoryChartProps {
  data: AccessData[];
  isLoading: boolean;
  totalAllTime?: number;
}

const AccessHistoryChart: React.FC<AccessHistoryChartProps> = ({ data, isLoading, totalAllTime }) => {
  const hasData = data && data.length > 0;
  
  // Calculate stats - should get total from backend, not sum of daily data
  // Weekly totals from chart data (7 days)
  const weeklyTotalAccess = hasData ? data.reduce((sum, item) => sum + (item.total_access || 0), 0) : 0;
  const weeklySuccessfulAccess = hasData ? data.reduce((sum, item) => sum + (item.successful_access || 0), 0) : 0;
  
  const successRate = weeklyTotalAccess > 0 ? Math.round((weeklySuccessfulAccess / weeklyTotalAccess) * 100) : 0;
  
  // Format data for chart
  const chartData = hasData ? data.map(item => ({
    ...item,
    date: item.period || item.date || 'Unknown',
    success_rate: item.total_access > 0 ? Math.round((item.successful_access / item.total_access) * 100) : 0
  })) : [];


  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
            <Shield className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Riwayat Akses Harian</h3>
            <p className="text-sm text-gray-600">Data akses pintu 7 hari terakhir</p>
          </div>
        </div>
        {hasData && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">Akses Berhasil</span>
            <div className="w-3 h-3 bg-red-400 rounded-full ml-3"></div>
            <span className="text-gray-600">Gagal</span>
          </div>
        )}
      </div>
      
      {hasData && !isLoading && (
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-600">Total Akses</p>
            <p className="text-lg font-semibold text-purple-600">{(totalAllTime || weeklyTotalAccess).toLocaleString()}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-600">Berhasil (7 hari)</p>
            <p className="text-lg font-semibold text-green-600">{weeklySuccessfulAccess.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600">Success Rate</p>
            <p className="text-lg font-semibold text-blue-600">{successRate}%</p>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg animate-pulse">
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-5 bg-gray-200 rounded"></div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg animate-pulse">
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-5 bg-gray-200 rounded"></div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg animate-pulse">
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-5 bg-gray-200 rounded"></div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Memuat data akses...</p>
          </div>
        </div>
      ) : hasData ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={Math.ceil(chartData.length / 8)}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: '#1e293b', fontWeight: '600' }}
                formatter={(value: number | string | Array<number | string>, name: string) => {
                  const labels: { [key: string]: string } = {
                    successful_access: 'Akses Berhasil',
                    failed_access: 'Akses Gagal',
                    total_access: 'Total Akses',
                    unique_users: 'Pengguna Unik'
                  };
                  return [value, labels[name] || name];
                }}
              />
              <Line 
                type="monotone" 
                dataKey="successful_access" 
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2 }}
                name="successful_access"
              />
              <Line 
                type="monotone" 
                dataKey="failed_access" 
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, fill: '#ef4444', strokeWidth: 2 }}
                name="failed_access"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-600">Belum Ada Data Akses</p>
              <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                Chart akan menampilkan data real-time setelah ada aktivitas scan RFID
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { AccessHistoryChart };
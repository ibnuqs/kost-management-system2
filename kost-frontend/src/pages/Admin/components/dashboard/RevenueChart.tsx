// File: src/pages/Admin/components/dashboard/RevenueChart.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { RevenueData } from '../../types/dashboard';

interface RevenueChartProps {
  data: RevenueData[];
  period: 'monthly' | 'yearly';
  onPeriodChange: (period: 'monthly' | 'yearly') => void;
  isLoading: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ 
  data = [], 
  period, 
  onPeriodChange, 
  isLoading
}) => {
  const hasData = data && data.length > 0;
  
  // Calculate stats
  const totalRevenue = hasData ? data.reduce((sum, item) => sum + (item.revenue || 0), 0) : 0;
  const avgRevenue = hasData ? totalRevenue / data.length : 0;
  const currentMonth = hasData ? data[data.length - 1]?.revenue || 0 : 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 border">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Pendapatan</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold">Pendapatan</h3>
            <p className="text-xs text-gray-500">Tren pendapatan {period === 'monthly' ? 'bulanan' : 'tahunan'}</p>
          </div>
        </div>
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => onPeriodChange('monthly')}
            disabled={isLoading}
            className={`px-3 py-1 text-sm rounded-md transition-colors disabled:opacity-50 ${
              period === 'monthly' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {isLoading && period === 'monthly' && (
              <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin inline-block mr-1" />
            )}
            Bulanan
          </button>
          <button
            onClick={() => onPeriodChange('yearly')}
            disabled={isLoading}
            className={`px-3 py-1 text-sm rounded-md transition-colors disabled:opacity-50 ${
              period === 'yearly' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {isLoading && period === 'yearly' && (
              <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin inline-block mr-1" />
            )}
            Tahunan
          </button>
        </div>
      </div>

      {hasData && !isLoading && (
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-lg font-semibold text-blue-600">Rp {totalRevenue.toLocaleString('id-ID')}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-600">Rata-rata</p>
            <p className="text-lg font-semibold text-green-600">Rp {avgRevenue.toLocaleString('id-ID')}</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-600">{period === 'monthly' ? 'Bulan Ini' : 'Tahun Ini'}</p>
            <p className="text-lg font-semibold text-purple-600">Rp {currentMonth.toLocaleString('id-ID')}</p>
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Memuat data {period === 'monthly' ? 'bulanan' : 'tahunan'}...</p>
          </div>
        </div>
      ) : hasData ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}M`}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">Belum ada data pendapatan</p>
            <p className="text-sm text-gray-400 mt-1">Data akan muncul setelah ada transaksi pembayaran</p>
          </div>
        </div>
      )}
    </div>
  );
};
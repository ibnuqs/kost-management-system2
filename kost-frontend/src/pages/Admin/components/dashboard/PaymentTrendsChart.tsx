// File: src/pages/Admin/components/dashboard/PaymentTrendsChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { CreditCard } from 'lucide-react';

interface PaymentData {
  month: string;
  total_payments: number;
  paid_count: number;
  pending_count: number;
  overdue_count: number;
  total_amount: number;
  paid_amount: number;
}

interface PaymentTrendsChartProps {
  data: PaymentData[];
  isLoading: boolean;
}

const PaymentTrendsChart: React.FC<PaymentTrendsChartProps> = ({ data, isLoading }) => {
  const hasData = data && data.length > 0;
  
  // Calculate stats
  const currentData = hasData ? data[data.length - 1] : null;
  const totalPayments = currentData?.total_payments || 0;
  const paidCount = currentData?.paid_count || 0;
  const pendingCount = currentData?.pending_count || 0;
  const collectionRate = totalPayments > 0 ? Math.round((paidCount / totalPayments) * 100) : 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 border">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold">Pembayaran</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border">
      <div className="flex items-center gap-3 mb-4">
        <CreditCard className="w-5 h-5 text-orange-600" />
        <div>
          <h3 className="text-lg font-semibold">Pembayaran</h3>
          <p className="text-xs text-gray-500">Status pembayaran bulanan penyewa</p>
        </div>
      </div>
      
      {!isLoading && (
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-600">Lunas</p>
            <p className="text-lg font-semibold text-green-600">{hasData ? paidCount : 0}</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-gray-600">Pending</p>
            <p className="text-lg font-semibold text-yellow-600">{hasData ? pendingCount : 0}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600">Collection Rate</p>
            <p className="text-lg font-semibold text-blue-600">{hasData ? collectionRate : 0}%</p>
          </div>
        </div>
      )}

      {hasData ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              />
              <Bar 
                dataKey="paid_count" 
                fill="#f97316"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">Belum ada data pembayaran</p>
            <p className="text-sm text-gray-400 mt-1">Data akan muncul setelah backend menyediakan data pembayaran</p>
          </div>
        </div>
      )}
    </div>
  );
};

export { PaymentTrendsChart };
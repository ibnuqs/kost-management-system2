import React from 'react';
import { CreditCard, DollarSign, Clock, AlertTriangle, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import type { PaymentStats as PaymentStatsType } from '../../../types';
import { Card } from '../../ui';

export const PaymentStats: React.FC<{ 
  stats: PaymentStatsType | null;
  loading?: boolean;
  error?: string | null;
}> = ({ stats, loading, error }) => {
  const formatCurrency = (amount: number | string) => {
    const num = parseInt(amount?.toString() || '0');
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-4 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="w-11 h-11 bg-gray-200 rounded-xl ml-3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Gagal memuat statistik pembayaran: {error}</span>
          </div>
        </Card>
      </div>
    );
  }

  // Show empty state if no stats
  if (!stats) {
    return (
      <div className="mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-center text-gray-500">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Data statistik tidak tersedia</span>
          </div>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Pembayaran',
      value: stats.total_payments,
      icon: CreditCard,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      description: 'Semua transaksi'
    },
    {
      title: 'Lunas Bulan Ini',
      value: stats.paid_this_month,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      description: 'Pembayaran selesai'
    },
    {
      title: 'Menunggu Bayar',
      value: stats.pending_this_month,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      description: 'Belum dibayar'
    },
    {
      title: 'Terlambat',
      value: stats.overdue_count,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      description: 'Melewati tenggat'
    },
    {
      title: 'Pendapatan Bulan Ini',
      value: formatCurrency(stats.total_revenue_this_month || 0),
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      description: 'Total diterima bulan ini'
    },
    {
      title: 'Total Pendapatan',
      value: formatCurrency(stats.total_revenue_all_time || 0),
      icon: TrendingUp,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      description: 'Seluruh waktu'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor} ml-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
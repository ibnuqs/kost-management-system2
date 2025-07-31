// ===== FIXED PaymentStats.tsx =====
// File: src/pages/Tenant/components/feature/payments/PaymentStats.tsx
import React from 'react';
import { TrendingUp, DollarSign, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { PaymentStats as PaymentStatsType } from '../../../types/payment';
import { StatCard, Card } from '../../ui/Card';
import { ProgressBar } from '../../ui/Status';
import { formatCurrency } from '../../../utils/formatters';
import { mergeClasses, getResponsiveColumns } from '../../../utils/helpers';

interface PaymentStatsProps {
  stats?: PaymentStatsType;
  isLoading?: boolean;
  className?: string;
}

const PaymentStats: React.FC<PaymentStatsProps> = ({
  stats,
  isLoading = false,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={mergeClasses('space-y-6', className)}>
        {/* Stats Cards Skeleton */}
        <div className={mergeClasses('grid gap-4', getResponsiveColumns(4))}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Chart Skeleton */}
        <div className="bg-white p-6 rounded-xl border animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className={className}>
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Tidak ada statistik pembayaran tersedia</p>
        </div>
      </Card>
    );
  }

  const statsCards = [
    {
      title: 'Total Pembayaran',
      value: stats.total_payments,
      subtitle: 'Sepanjang waktu',
      icon: Calendar,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      title: 'Pembayaran Dibayar',
      value: stats.total_paid,
      subtitle: `${Math.round(stats.payment_rate || 0)}% tingkat keberhasilan`,
      icon: CheckCircle,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      trend: {
        value: stats.payment_rate || 0,
        label: 'tingkat keberhasilan',
        isPositive: (stats.payment_rate || 0) >= 80,
      },
    },
    {
      title: 'Jumlah Dibayar',
      value: formatCurrency(stats.total_amount_paid || 0),
      subtitle: 'Total dibayar',
      icon: DollarSign,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
    },
    {
      title: 'Menunggu',
      value: stats.total_pending || 0,
      subtitle: formatCurrency(stats.total_amount_pending || 0),
      icon: Clock,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
    },
  ];

  return (
    <div className={mergeClasses('space-y-6', className)}>
      {/* Stats Cards */}
      <div className={mergeClasses('grid gap-4', getResponsiveColumns(4))}>
        {statsCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            iconColor={stat.iconColor}
            iconBg={stat.iconBg}
            trend={stat.trend}
            className="hover:shadow-lg transition-shadow duration-200"
          />
        ))}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Performance */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Payment Performance</h3>
          </div>
          
          <div className="space-y-6">
            {/* Success Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Success Rate</span>
                <span className="text-sm font-bold text-green-600">
                  {Math.round(stats.payment_rate || 0)}%
                </span>
              </div>
              <ProgressBar
                value={stats.payment_rate || 0}
                max={100}
                color="green"
                size="md"
                animated
              />
            </div>

            {/* Average Payment Time */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Avg. Payment Time</span>
                <span className="text-sm font-bold text-blue-600">
                  {stats.average_payment_time ? `${Math.round(stats.average_payment_time)} days` : 'N/A'}
                </span>
              </div>
              <ProgressBar
                value={Math.min((stats.average_payment_time || 0), 30)}
                max={30}
                color={stats.average_payment_time && stats.average_payment_time <= 7 ? 'green' : 'yellow'}
                size="md"
                animated
              />
              <p className="text-xs text-gray-500 mt-1">
                {stats.average_payment_time && stats.average_payment_time <= 7 
                  ? 'Excellent payment timing' 
                  : 'Consider paying earlier'
                }
              </p>
            </div>

            {/* Payment Breakdown */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900">{stats.total_paid}</p>
                <p className="text-xs text-gray-500">Paid</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900">{stats.total_pending}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900">{stats.total_failed}</p>
                <p className="text-xs text-gray-500">Failed</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Financial Summary */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Financial Summary</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-800">Total Paid</span>
              <span className="font-bold text-green-600">
                {formatCurrency(stats.total_amount_paid || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-yellow-800">Pending Amount</span>
              <span className="font-bold text-yellow-600">
                {formatCurrency(stats.total_amount_pending || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-800">Average Payment</span>
              <span className="font-bold text-blue-600">
                {stats.total_paid > 0 
                  ? formatCurrency((stats.total_amount_paid || 0) / stats.total_paid)
                  : formatCurrency(0)
                }
              </span>
            </div>

            {/* Payment Insights */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Insights</h4>
              <div className="space-y-2 text-sm">
                {stats.payment_rate >= 90 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Excellent payment record!</span>
                  </div>
                )}
                
                {stats.total_pending > 0 && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Clock className="w-4 h-4" />
                    <span>{stats.total_pending} payments pending</span>
                  </div>
                )}
                
                {stats.total_failed > 0 && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{stats.total_failed} failed payments need attention</span>
                  </div>
                )}
                
                {stats.average_payment_time && stats.average_payment_time <= 3 && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>Fast payment processing</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentStats;

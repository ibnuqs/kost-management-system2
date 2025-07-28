// Optimized Payment Status Component
import React, { memo, useCallback, useMemo } from 'react';
import { CreditCard, AlertCircle, CheckCircle, Clock, ChevronRight, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTenantDashboard } from '../../hooks/useTenantDashboard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Buttons';
import { StatusBadge } from '../ui/Status';
import { getPaymentStatusColor, getPaymentStatusLabel } from '../../types/payment';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { mergeClasses } from '../../utils/helpers';

interface PaymentStatusProps {
  className?: string;
}

const PaymentStatus: React.FC<PaymentStatusProps> = memo(({
  className = '',
}) => {
  const { dashboardData, isLoading } = useTenantDashboard();
  const navigate = useNavigate();
  
  const paymentInfo = dashboardData?.payment_info;
  const currentPaymentData = paymentInfo?.current;
  const nextPaymentData = paymentInfo?.next;
  const overduePayments = paymentInfo?.overdue || [];
  const summary = paymentInfo?.payment_history_summary;

  // Memoize helper functions
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'paid':
      case 'success':
        return CheckCircle;
      case 'pending':
        return Clock;
      default:
        return AlertCircle;
    }
  }, []);

  const getStatusVariant = useCallback((status: string) => {
    if (['paid', 'success', 'settlement', 'capture'].includes(status)) return 'success';
    if (['pending', 'authorize'].includes(status)) return 'warning';
    return 'error';
  }, []);

  // Handle payment - redirect to payment page
  const handlePayment = useCallback((paymentId: string) => {
    navigate('/tenant/payments', { 
      state: { 
        highlightPayment: paymentId,
        autoOpenPayment: true 
      } 
    });
  }, [navigate]);

  if (isLoading) {
    return (
      <Card className={mergeClasses('animate-pulse', className)}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <>
    <Card className={className}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Status Pembayaran</h3>
        </div>
        
        <Link
          to="/tenant/payments"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <span className="hidden sm:inline">Lihat Semua</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Overdue Payments Alert */}
      {overduePayments.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              {overduePayments.length} Pembayaran Terlambat
            </span>
          </div>
          <p className="text-xs text-red-600 mb-2">
            Total: {formatCurrency(overduePayments.reduce((sum, p) => sum + p.amount, 0))}
          </p>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handlePayment(overduePayments[0].id)}
            loading={isProcessing}
            className="w-full"
          >
            Bayar Sekarang
          </Button>
        </div>
      )}

      {/* Current Month Payment */}
      {currentPaymentData && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Bulan Ini ({currentPaymentData.payment_month})
              </p>
              <p className="text-xs text-gray-500">
                Dibuat: {formatDate(currentPaymentData.created_at || '')}
              </p>
            </div>
            
            <StatusBadge
              status={getStatusVariant(currentPaymentData.status)}
              label={getPaymentStatusLabel(currentPaymentData.status)}
              size="sm"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(currentPaymentData.amount)}
            </span>
            
            {currentPaymentData.status === 'pending' && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => handlePayment(currentPaymentData.id)}
              >
                Bayar Sekarang
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Next Payment */}
      {nextPaymentData && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Pembayaran Selanjutnya ({nextPaymentData.payment_month})
              </p>
              <p className="text-xs text-blue-600">
                Dibuat: {formatDate(nextPaymentData.created_at || '')}
              </p>
            </div>
            
            <span className="text-sm font-bold text-blue-900">
              {formatCurrency(nextPaymentData.amount)}
            </span>
          </div>
        </div>
      )}

      {/* Payment Summary */}
      {summary && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Dibayar</p>
              <p className="font-semibold text-green-600 text-sm sm:text-base">
                {formatCurrency(summary.total_paid)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Tingkat Sukses</p>
              <p className="font-semibold text-blue-600 text-sm sm:text-base">
                {Math.round(summary.success_rate || 0)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Belum Dibayar</p>
              <p className="font-semibold text-red-600 text-sm sm:text-base">
                {formatCurrency(paymentInfo?.total_unpaid || 0)}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link 
          to="/tenant/payments" 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
        >
          Lihat Semua Pembayaran
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </Card>
    
    </>
  );
});

export default PaymentStatus;
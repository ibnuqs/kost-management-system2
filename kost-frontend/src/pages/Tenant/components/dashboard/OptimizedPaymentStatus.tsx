// Optimized Payment Status Component
import React, { memo, useCallback } from 'react';
import { AlertCircle, CheckCircle, Clock, ChevronRight, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTenantDashboard } from '../../hooks/useTenantDashboard';
import { usePaymentActions } from '../../hooks/usePaymentActions';

// Memoized payment card component
interface PaymentCardProps {
  title: string;
  amount: number;
  status: string;
  dueDate?: string;
  month?: string;
  onPayNow?: () => void;
  isOverdue?: boolean;
  loading?: boolean;
}

const PaymentCard = memo(({ title, amount, status, dueDate, month, onPayNow, isOverdue, loading }: PaymentCardProps) => {
  const getStatusColor = (status: string) => {
    if (['paid', 'success', 'settlement'].includes(status)) return 'bg-green-100 text-green-800';
    if (['pending', 'authorize'].includes(status)) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (status: string) => {
    if (['paid', 'success', 'settlement'].includes(status)) return CheckCircle;
    if (['pending', 'authorize'].includes(status)) return Clock;
    return AlertCircle;
  };

  const StatusIcon = getStatusIcon(status);
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 p-4 ${
      isOverdue ? 'border-l-red-500' : 
      status === 'paid' ? 'border-l-green-500' : 'border-l-yellow-500'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          {month && <p className="text-sm text-gray-500">{month}</p>}
          {dueDate && (
            <p className="text-xs text-gray-500 mt-1">
              Due: {new Date(dueDate).toLocaleDateString('id-ID')}
            </p>
          )}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          <StatusIcon className="w-3 h-3" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold text-gray-900">
          {formatCurrency(amount)}
        </span>
        {onPayNow && (status === 'pending' || isOverdue) && (
          <button
            onClick={onPayNow}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isOverdue 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Pay Now
          </button>
        )}
      </div>
    </div>
  );
});

PaymentCard.displayName = 'PaymentCard';

// Memoized payment summary component
const PaymentSummary = memo<{
  totalPaid: number;
  successRate: number;
  totalUnpaid: number;
  loading?: boolean;
}>(({ totalPaid, successRate, totalUnpaid, loading }) => {
  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 mt-4">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="h-3 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Paid</p>
          <p className="font-semibold text-green-600">{formatCurrency(totalPaid)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Success Rate</p>
          <p className="font-semibold text-blue-600">{Math.round(successRate)}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Outstanding</p>
          <p className="font-semibold text-red-600">{formatCurrency(totalUnpaid)}</p>
        </div>
      </div>
    </div>
  );
});

PaymentSummary.displayName = 'PaymentSummary';

const OptimizedPaymentStatus = memo(() => {
  const { data, isLoading } = useTenantDashboard();
  const { handlePayNow, isProcessing } = usePaymentActions();
  
  const paymentInfo = data?.payment_info;
  const currentPayment = paymentInfo?.current;
  const nextPayment = paymentInfo?.next;
  const overduePayments = paymentInfo?.overdue || [];
  const summary = paymentInfo?.payment_history_summary;

  const handlePayment = useCallback((paymentId: string) => {
    if (!isProcessing) {
      handlePayNow(paymentId);
    }
  }, [handlePayNow, isProcessing]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded"></div>
            <div className="h-5 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <PaymentCard
              key={i}
              title=""
              amount={0}
              status=""
              loading={true}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Payment Status</h3>
        </div>
        <Link
          to="/tenant/payments"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {/* Overdue Payments */}
        {overduePayments.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h4 className="font-medium text-red-900">
                {overduePayments.length} Overdue Payment{overduePayments.length > 1 ? 's' : ''}
              </h4>
            </div>
            <div className="space-y-2">
              {overduePayments.slice(0, 2).map((payment) => (
                <PaymentCard
                  key={payment.id}
                  title={`Overdue - ${payment.payment_month}`}
                  amount={payment.amount}
                  status={payment.status}
                  dueDate={payment.due_date}
                  month={payment.payment_month}
                  onPayNow={currentPayment.status === 'pending' ? () => handlePayment(payment.id) : undefined}
                  isOverdue={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Current Payment */}
        {currentPayment && (
          <PaymentCard
            title="Current Month"
            amount={currentPayment.amount}
            status={currentPayment.status}
            dueDate={currentPayment.due_date}
            month={currentPayment.payment_month}
            onPayNow={currentPayment.status === 'pending' ? () => handlePayment(currentPayment.id) : undefined}
          />
        )}

        {/* Next Payment */}
        {nextPayment && (
          <PaymentCard
            title="Next Month"
            amount={nextPayment.amount}
            status={nextPayment.status}
            dueDate={nextPayment.due_date}
            month={nextPayment.payment_month}
          />
        )}

        {/* Payment Summary */}
        {summary && (
          <PaymentSummary
            totalPaid={summary.total_paid}
            successRate={summary.success_rate}
            totalUnpaid={paymentInfo?.total_unpaid || 0}
          />
        )}
      </div>
    </div>
  );
});

OptimizedPaymentStatus.displayName = 'OptimizedPaymentStatus';

export default OptimizedPaymentStatus;
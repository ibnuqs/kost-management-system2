// File: src/pages/Tenant/components/feature/payments/PaymentCard.tsx
import React, { useState } from 'react';
import { Calendar, CreditCard, AlertCircle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Payment, getPaymentStatusLabel } from '../../../types/payment';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Buttons';
import { StatusBadge } from '../../ui/Status';
import Modal from '../../ui/Modal/Modal';
import { SnapPayment } from './SnapPayment';
import { paymentService } from '../../../services/paymentService';
import { receiptService } from '../../../services/receiptService';
import { formatCurrency, formatDate, formatPaymentMonth } from '../../../utils/formatters';
import { mergeClasses } from '../../../utils/helpers';

// Snap payment result types
interface SnapPaymentResult {
  transaction_id: string;
  status_code: string;
  payment_type: string;
  order_id: string;
  gross_amount: string;
  transaction_status: string;
  signature_key?: string;
}

interface SnapPaymentData {
  snap_token: string;
  client_key: string;
  is_production: boolean;
  payment_data: {
    order_id: string;
    gross_amount: number;
    payment_id: number;
  };
  expires_at: string;
}

interface PaymentCardProps {
  payment: Payment;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
  onPaymentSuccess?: () => void;
  onPaymentUpdate?: () => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  showActions = true,
  compact = false,
  className = '',
  onPaymentSuccess,
  onPaymentUpdate,
}) => {
  const navigate = useNavigate();
  const [showSnapModal, setShowSnapModal] = useState(false);
  const [snapData, setSnapData] = useState<SnapPaymentData | null>(null);
  const [snapLoading, setSnapLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const isOverdue = payment.due_date && new Date(payment.due_date) < new Date() && !['paid', 'success'].includes(payment.status);
  const isPending = ['pending', 'authorize'].includes(payment.status);
  const isPaid = ['paid', 'success', 'settlement', 'capture'].includes(payment.status);
  const isFailed = ['failed', 'failure', 'cancel', 'deny', 'expire'].includes(payment.status);
  const canPay = ['pending', 'unpaid', 'failed'].includes(payment.status);

  const getCardStyle = () => {
    if (isOverdue) return 'border-red-200 bg-red-50';
    if (isPending) return 'border-yellow-200 bg-yellow-50';
    if (isPaid) return 'border-green-200 bg-green-50';
    if (isFailed) return 'border-red-200 bg-gray-50';
    return 'border-gray-200 bg-white';
  };

  const getStatusIcon = () => {
    if (isPaid) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (isPending) return <Clock className="w-4 h-4 text-yellow-600" />;
    if (isFailed) return <AlertCircle className="w-4 h-4 text-red-600" />;
    return <AlertCircle className="w-4 h-4 text-gray-400" />;
  };

  // Handle Snap payment initiation
  const handleSnapPayment = async () => {
    try {
      setSnapLoading(true);
      console.log('🔄 Initiating Snap payment for:', payment.id);
      
      const data = await paymentService.getSnapPaymentData(payment.id);
      
      console.log('✅ Snap data loaded:', data);
      setSnapData(data);
      setShowSnapModal(true);
      
    } catch (error: unknown) {
      console.error('❌ Failed to load Snap payment:', error);
      toast.error('Gagal memuat pembayaran. Silakan coba lagi.');
    } finally {
      setSnapLoading(false);
    }
  };

  // Handle legacy payment (fallback)
  const handleLegacyPayment = async () => {
    try {
      setSnapLoading(true);
      
      const { payment_url } = await paymentService.initiatePayment(payment.id);
      window.open(payment_url, '_blank');
      
    } catch (error: unknown) {
      console.error('❌ Legacy payment failed:', error);
      toast.error('Gagal membuka pembayaran. Silakan coba pembayaran Snap.');
    } finally {
      setSnapLoading(false);
    }
  };

  // Handle payment status check
  const handleCheckStatus = async () => {
    try {
      setCheckingStatus(true);
      
      const updatedPayment = await paymentService.checkPaymentStatus(payment.id);
      toast.success(`Status pembayaran: ${updatedPayment.status}`);
      
      if (onPaymentUpdate) {
        onPaymentUpdate();
      }
      
    } catch (error: unknown) {
      console.error('❌ Failed to check status:', error);
      toast.error('Gagal memeriksa status pembayaran');
    } finally {
      setCheckingStatus(false);
    }
  };

  // Handle Snap payment success
  const handleSnapSuccess = async (result: SnapPaymentResult) => {
    try {
      console.log('✅ Snap payment successful:', result);
      
      await paymentService.handleSnapSuccess(result);
      toast.success('Pembayaran berhasil! 🎉');
      
      setShowSnapModal(false);
      
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      
      // Navigate to success page
      setTimeout(() => {
        navigate(`/tenant/payments/success?order_id=${result.order_id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error handling Snap success:', error);
      toast.error('Pembayaran selesai tetapi ada masalah. Silakan hubungi dukungan.');
    }
  };

  // Handle Snap payment pending
  const handleSnapPending = async (result: SnapPaymentResult) => {
    try {
      console.log('⏳ Snap payment pending:', result);
      
      await paymentService.handleSnapPending(result);
      toast.loading('Pembayaran sedang diproses. Anda akan diberitahu setelah selesai.', {
        duration: 4000
      });
      
      setShowSnapModal(false);
      
      if (onPaymentUpdate) {
        onPaymentUpdate();
      }
      
    } catch (error) {
      console.error('Error handling Snap pending:', error);
    }
  };

  // Handle Snap payment error
  const handleSnapError = async (result: SnapPaymentResult) => {
    try {
      console.error('❌ Snap payment error:', result);
      
      await paymentService.handleSnapError(result);
      toast.error(`Pembayaran gagal: ${result.status_message || 'Kesalahan tidak diketahui'}`);
      
    } catch (error) {
      console.error('Error handling Snap error:', error);
    }
  };

  // Handle Snap popup close
  const handleSnapClose = () => {
    console.log('🔒 Snap popup closed by user');
    toast('Pembayaran dibatalkan. Anda dapat mencoba lagi kapan saja.');
  };

  // Handle receipt download
  const handleDownloadReceipt = async () => {
    try {
      setSnapLoading(true);
      
      // Check if receipt is available
      const availability = await receiptService.checkReceiptAvailability(payment.id);
      
      if (!availability.available) {
        toast.error(availability.reason || 'Kwitansi tidak tersedia untuk pembayaran ini');
        return;
      }
      
      // Download receipt
      await receiptService.downloadReceipt(payment.id);
      toast.success('Kwitansi berhasil diunduh! 📄');
      
    } catch (error: unknown) {
      console.error('❌ Failed to download receipt:', error);
      toast.error('Gagal mengunduh kwitansi. Silakan coba lagi.');
    } finally {
      setSnapLoading(false);
    }
  };

  return (
    <>
      <Card className={mergeClasses(getCardStyle(), className)} padding={compact ? 'sm' : 'md'}>
        <div className="space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className={mergeClasses(
                'w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                isPaid ? 'bg-green-100' : isPending ? 'bg-yellow-100' : 'bg-gray-100'
              )}>
                <CreditCard className={mergeClasses(
                  'w-4 h-4 sm:w-5 sm:h-5',
                  isPaid ? 'text-green-600' : isPending ? 'text-yellow-600' : 'text-gray-600'
                )} />
              </div>
              
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                  {formatPaymentMonth(payment.payment_month)}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  ID: {payment.order_id}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 flex-shrink-0">
              <div className="sm:hidden">{getStatusIcon()}</div>
              <StatusBadge
                status={isPaid ? 'success' : isPending ? 'warning' : 'error'}
                label={getPaymentStatusLabel(payment.status)}
                size="sm"
              />
            </div>
          </div>

          {/* Amount and Due Date */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {formatCurrency(payment.amount)}
              </p>
              {payment.due_date && (
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className={mergeClasses(
                    'text-xs sm:text-sm',
                    isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'
                  )}>
                    <span className="hidden sm:inline">Jatuh Tempo: </span>
                    <span className="sm:hidden">Tempo: </span>
                    {formatDate(payment.due_date)}
                    {isOverdue && (
                      <>
                        <span className="hidden sm:inline"> (Terlambat)</span>
                        <span className="sm:hidden"> ⚠️</span>
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
            
            {payment.paid_at && (
              <div className="text-left sm:text-right flex-shrink-0">
                <p className="text-xs sm:text-sm text-gray-500">Dibayar pada</p>
                <p className="text-xs sm:text-sm font-medium text-green-600">
                  {formatDate(payment.paid_at)}
                </p>
              </div>
            )}
          </div>

          {/* Payment Method */}
          {payment.payment_method && (
            <div className="text-xs sm:text-sm text-gray-600">
              <span className="font-medium">Metode:</span> {payment.payment_method}
            </div>
          )}

          {/* Failure Reason */}
          {payment.failure_reason && (
            <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-red-800">Pembayaran Gagal</span>
              </div>
              <p className="text-xs sm:text-sm text-red-600 mt-1">{payment.failure_reason}</p>
            </div>
          )}

          {/* Snap.js Benefits (only for unpaid payments) */}
          {!compact && canPay && (
            <div className="p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 text-base sm:text-lg flex-shrink-0">🚀</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-blue-800">
                    <span className="hidden sm:inline">Baru: Pembayaran Instan dengan Snap</span>
                    <span className="sm:hidden">Pembayaran Instan</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    <span className="hidden sm:inline">Pembayaran popup cepat dan aman - tidak perlu redirect! Berfungsi bahkan di balik firewall.</span>
                    <span className="sm:hidden">Popup cepat dan aman - tidak perlu redirect!</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && !compact && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-2 border-t border-gray-200">
              {canPay && (
                <>
                  {/* Primary: Snap Payment */}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSnapPayment}
                    loading={snapLoading}
                    className="flex-1 min-h-[44px] text-xs sm:text-sm"
                    icon={CreditCard}
                  >
                    {snapLoading ? 'Memuat...' : (
                      <>
                        <span className="hidden sm:inline">Bayar Sekarang (Direkomendasikan)</span>
                        <span className="sm:hidden">Bayar Sekarang</span>
                      </>
                    )}
                  </Button>

                  {/* Alternative: Legacy Payment - Hidden on mobile */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleLegacyPayment}
                    loading={snapLoading}
                    icon={ExternalLink}
                    className="hidden sm:flex min-h-[44px] text-xs sm:text-sm"
                  >
                    Alternatif
                  </Button>
                </>
              )}
              
              <div className="flex gap-2 sm:gap-3">
                {/* Check Status */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCheckStatus}
                  loading={checkingStatus}
                  className={mergeClasses(
                    'min-h-[44px] text-xs sm:text-sm',
                    canPay ? 'flex-1 sm:flex-initial' : 'flex-1'
                  )}
                >
                  <span className="hidden sm:inline">Periksa Status</span>
                  <span className="sm:hidden">Status</span>
                </Button>
                
                {isPaid && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 sm:flex-initial min-h-[44px] text-xs sm:text-sm"
                    onClick={() => handleDownloadReceipt()}
                    loading={snapLoading}
                  >
                    <span className="hidden sm:inline">Unduh Kwitansi</span>
                    <span className="sm:hidden">Unduh</span>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Compact Actions */}
          {showActions && compact && canPay && (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSnapPayment}
                loading={snapLoading}
                className="flex-1 min-h-[44px] text-xs sm:text-sm"
              >
                {snapLoading ? 'Memuat...' : (
                  <>
                    <span className="hidden sm:inline">Bayar Sekarang</span>
                    <span className="sm:hidden">Bayar</span>
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCheckStatus}
                loading={checkingStatus}
                className="min-w-[44px] min-h-[44px] text-xs sm:text-sm"
              >
                Status
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Snap Payment Modal */}
      <Modal
        isOpen={showSnapModal}
        onClose={() => setShowSnapModal(false)}
        title="Pembayaran Aman"
        size="lg"
        className="sm:max-w-md"
      >
        <div className="p-3 sm:p-4">
          {snapData ? (
            <SnapPayment
              snapToken={snapData.snap_token}
              clientKey={snapData.client_key}
              isProduction={snapData.is_production}
              paymentData={snapData.payment_data}
              onSuccess={handleSnapSuccess}
              onPending={handleSnapPending}
              onError={handleSnapError}
              onClose={handleSnapClose}
            />
          ) : (
            <div className="text-center py-6 sm:py-8">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Memuat gateway pembayaran...</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default PaymentCard;
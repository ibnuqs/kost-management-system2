// File: src/pages/Tenant/components/feature/payments/PaymentActions.tsx
import React, { useState } from 'react';
import { CreditCard, Download, RefreshCw, Filter, Search, ExternalLink, RotateCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton } from '../../ui/Buttons';
import { SearchInput } from '../../ui/Forms';
import Modal from '../../ui/Modal/Modal';
import { SnapPayment } from './SnapPayment';
import { paymentService } from '../../../services/paymentService';
import { mergeClasses } from '../../../utils/helpers';
import type { Payment } from '../../../types/payment';

interface PaymentActionsProps {
  payment?: Payment;
  onRefresh?: () => void;
  onFilter?: () => void;
  onSearch?: (query: string) => void;
  onExport?: () => void;
  onPaymentSuccess?: () => void;
  onPaymentUpdate?: () => void;
  searchValue?: string;
  isLoading?: boolean;
  selectedPayments?: number[];
  className?: string;
  showBulkActions?: boolean;
  showSnapPayment?: boolean;
}

const PaymentActions: React.FC<PaymentActionsProps> = ({
  payment,
  onRefresh,
  onFilter,
  onSearch,
  onExport,
  onPaymentSuccess,
  onPaymentUpdate,
  searchValue = '',
  isLoading = false,
  selectedPayments = [],
  className = '',
  showBulkActions = true,
  showSnapPayment = false,
}) => {
  const navigate = useNavigate();
  const [showSnapModal, setShowSnapModal] = useState(false);
  const [snapData, setSnapData] = useState<any>(null);
  const [snapLoading, setSnapLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Handle Snap payment initiation
  const handleSnapPayment = async (paymentId: number | string) => {
    try {
      setSnapLoading(true);
      console.log('🔄 Initiating Snap payment for:', paymentId);
      
      // Get Snap payment data
      const data = await paymentService.getSnapPaymentData(paymentId);
      
      console.log('✅ Snap data loaded:', data);
      setSnapData(data);
      setShowSnapModal(true);
      
    } catch (error: any) {
      console.error('❌ Failed to load Snap payment:', error);
      toast.error('Gagal memuat pembayaran. Silakan coba lagi.');
    } finally {
      setSnapLoading(false);
    }
  };

  // Handle legacy payment (fallback)
  const handleLegacyPayment = async (paymentId: number | string) => {
    try {
      setSnapLoading(true);
      
      const { payment_url } = await paymentService.initiatePayment(paymentId);
      window.open(payment_url, '_blank');
      
    } catch (error: any) {
      console.error('❌ Legacy payment failed:', error);
      toast.error('Gagal membuka pembayaran. Silakan coba pembayaran Snap.');
    } finally {
      setSnapLoading(false);
    }
  };

  // Handle payment status check
  const handleCheckStatus = async (paymentId: number | string) => {
    try {
      setCheckingStatus(true);
      
      const updatedPayment = await paymentService.checkPaymentStatus(paymentId);
      toast.success(`Status pembayaran: ${updatedPayment.status}`);
      
      if (onPaymentUpdate) {
        onPaymentUpdate();
      }
      
    } catch (error: any) {
      console.error('❌ Failed to check status:', error);
      toast.error('Gagal memeriksa status pembayaran');
    } finally {
      setCheckingStatus(false);
    }
  };

  // Handle payment status sync with Midtrans
  const handleSyncStatus = async (paymentId: number | string) => {
    try {
      setCheckingStatus(true);
      
      const result = await paymentService.syncPaymentStatus(paymentId);
      
      if (result.old_status !== result.new_status) {
        toast.success(`Status diperbarui: ${result.old_status} → ${result.new_status} ✅`);
      } else {
        toast.success('Status sudah terbaru ✅');
      }
      
      if (onPaymentUpdate) {
        onPaymentUpdate();
      }
      
    } catch (error: any) {
      console.error('❌ Failed to sync status:', error);
      toast.error('Gagal sinkronisasi status dengan Midtrans');
    } finally {
      setCheckingStatus(false);
    }
  };

  // Handle bulk status check
  const handleBulkStatusCheck = async () => {
    if (selectedPayments.length === 0) return;
    
    try {
      setCheckingStatus(true);
      
      // Check status for each selected payment
      const promises = selectedPayments.map(id => 
        paymentService.checkPaymentStatus(id).catch(err => ({ id, error: err }))
      );
      
      const results = await Promise.all(promises);
      const successes = results.filter(r => !('error' in r));
      const failures = results.filter(r => 'error' in r);
      
      if (successes.length > 0) {
        toast.success(`Berhasil memperbarui ${successes.length} status pembayaran`);
      }
      
      if (failures.length > 0) {
        toast.error(`Gagal memperbarui ${failures.length} pembayaran`);
      }
      
      if (onPaymentUpdate) {
        onPaymentUpdate();
      }
      
    } catch (error: any) {
      console.error('❌ Bulk status check failed:', error);
      toast.error('Gagal memeriksa status pembayaran');
    } finally {
      setCheckingStatus(false);
    }
  };

  // Handle Snap payment success
  const handleSnapSuccess = async (result: any) => {
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
  const handleSnapPending = async (result: any) => {
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
  const handleSnapError = async (result: any) => {
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

  return (
    <div className={mergeClasses(
      'flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4',
      className
    )}>
      {/* Search */}
      {onSearch && (
        <div className="w-full sm:w-auto sm:min-w-[300px]">
          <SearchInput
            placeholder="Cari pembayaran..."
            value={searchValue}
            onSearch={onSearch}
            className="w-full"
          />
        </div>
      )}

      {/* Single Payment Actions */}
      {payment && showSnapPayment && (
        <div className="flex items-center gap-2">
          {['pending', 'unpaid', 'failed'].includes(payment.status) && (
            <>
              {/* Primary: Snap Payment */}
              <Button
                variant="primary"
                size="md"
                onClick={() => handleSnapPayment(payment.id)}
                loading={snapLoading}
                icon={CreditCard}
              >
                {snapLoading ? 'Memuat...' : 'Bayar Sekarang (Snap)'}
              </Button>

              {/* Alternative: Legacy Payment */}
              <IconButton
                icon={ExternalLink}
                onClick={() => handleLegacyPayment(payment.id)}
                variant="secondary"
                size="md"
                tooltip="Buka pembayaran di tab baru"
                disabled={snapLoading}
              />
            </>
          )}

          {/* Check Status */}
          <IconButton
            icon={RefreshCw}
            onClick={() => handleCheckStatus(payment.id)}
            variant="ghost"
            size="md"
            loading={checkingStatus}
            tooltip="Periksa status pembayaran"
          />

          {/* Sync Status with Midtrans */}
          <IconButton
            icon={RotateCw}
            onClick={() => handleSyncStatus(payment.id)}
            variant="ghost"
            size="md"
            loading={checkingStatus}
            tooltip="Sinkronisasi status dengan Midtrans"
          />
        </div>
      )}

      {/* Bulk Actions */}
      {showBulkActions && selectedPayments.length > 0 && (
        <div className="flex items-center gap-2 mr-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm font-medium text-blue-700">
            {selectedPayments.length} dipilih
          </span>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBulkStatusCheck}
            loading={checkingStatus}
            icon={RefreshCw}
          >
            Periksa Status
          </Button>
        </div>
      )}

      {/* General Action Buttons */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {/* Filter Button */}
        {onFilter && (
          <IconButton
            icon={Filter}
            onClick={onFilter}
            variant="secondary"
            size="md"
            aria-label="Filter pembayaran"
            className="flex-shrink-0"
          />
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <IconButton
            icon={RefreshCw}
            onClick={onRefresh}
            loading={isLoading}
            variant="secondary"
            size="md"
            aria-label="Muat ulang pembayaran"
            className="flex-shrink-0"
          />
        )}

        {/* Export Button */}
        {onExport && (
          <IconButton
            icon={Download}
            onClick={onExport}
            variant="secondary"
            size="md"
            aria-label="Ekspor pembayaran"
            className="flex-shrink-0"
          />
        )}
      </div>

      {/* Snap Payment Modal */}
      <Modal
        isOpen={showSnapModal}
        onClose={() => setShowSnapModal(false)}
        title="Pembayaran Aman"
        size="lg"
      >
        <div className="p-4">
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
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat gateway pembayaran...</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PaymentActions;
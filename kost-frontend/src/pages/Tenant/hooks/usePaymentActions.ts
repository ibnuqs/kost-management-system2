// File: src/pages/Tenant/hooks/usePaymentActions.ts
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';

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

export const usePaymentActions = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [snapData, setSnapData] = useState<SnapPaymentData | null>(null);

  /**
   * NEW: Get Snap payment data (recommended method)
   */
  const getSnapPaymentData = async (paymentId: number | string): Promise<SnapPaymentData> => {
    try {
      setIsProcessing(true);
      
      const data = await paymentService.getSnapPaymentData(paymentId);
      setSnapData(data);
      
      return data;
    } catch (error: unknown) {
      console.error('Failed to get Snap payment data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load payment data';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * LEGACY: Handle pay now action (redirect method)
   * @deprecated Use getSnapPaymentData + SnapPayment component instead
   */
  const handlePayNow = async (paymentId: number | string): Promise<void> => {
    try {
      setIsProcessing(true);
      
      // Get Snap token instead of opening URL directly
      const response = await paymentService.getSnapPaymentData(paymentId);
      
      return response; // Return response so component can handle Snap modal
      
    } catch (error: unknown) {
      console.error('Failed to initiate payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get payment data';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle payment status check
   */
  const handleCheckStatus = async (paymentId: number | string): Promise<void> => {
    try {
      setIsCheckingStatus(true);
      
      const payment = await paymentService.checkPaymentStatus(paymentId);
      
      toast.success(`Payment status: ${payment.status}`);
      
      // If payment is completed, you might want to refresh the page or redirect
      if (['paid', 'success', 'settlement', 'capture'].includes(payment.status)) {
        toast.success('Payment completed successfully!');
        // Optional: trigger a refresh or callback
      }
      
    } catch (error: unknown) {
      console.error('Failed to check payment status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to check payment status';
      toast.error(errorMessage);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  /**
   * Handle payment status sync
   */
  const handleSyncStatus = async (paymentId: number | string): Promise<void> => {
    try {
      setIsCheckingStatus(true);
      
      const result = await paymentService.syncPaymentStatus(paymentId);
      
      toast.success(`Status synced: ${result.status}`);
      
    } catch (error: unknown) {
      console.error('Failed to sync payment status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync payment status';
      toast.error(errorMessage);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  /**
   * Handle bulk status check for multiple payments
   */
  const handleBulkStatusCheck = async (paymentIds: (number | string)[]): Promise<void> => {
    try {
      setIsCheckingStatus(true);
      
      const promises = paymentIds.map(id => 
        paymentService.checkPaymentStatus(id).catch(err => ({ id, error: err }))
      );
      
      const results = await Promise.all(promises);
      const successes = results.filter(r => !('error' in r));
      const failures = results.filter(r => 'error' in r);
      
      if (successes.length > 0) {
        toast.success(`Updated ${successes.length} payment status(es)`);
      }
      
      if (failures.length > 0) {
        toast.error(`Failed to update ${failures.length} payment(s)`);
      }
      
    } catch (error: unknown) {
      console.error('Failed to check bulk payment status:', error);
      toast.error('Failed to check payment statuses');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  /**
   * SNAP.JS SPECIFIC: Handle successful payment callback
   */
  const handleSnapSuccess = async (result: unknown, onSuccess?: () => void): Promise<void> => {
    try {
      console.log('✅ Payment successful:', result);
      
      await paymentService.handleSnapSuccess(result);
      
      toast.success('Payment successful! 🎉');
      
      // Call custom success handler
      if (onSuccess) {
        onSuccess();
      } else {
        // Default: navigate to success page
        const orderId = result && typeof result === 'object' && 'order_id' in result ? result.order_id : 'unknown';
        navigate(`/tenant/payments/success?order_id=${orderId}`);
      }
      
    } catch (error) {
      console.error('Error handling payment success:', error);
      toast.error('Payment completed but there was an issue. Please contact support.');
    }
  };

  /**
   * SNAP.JS SPECIFIC: Handle pending payment callback
   */
  const handleSnapPending = async (result: unknown, onPending?: () => void): Promise<void> => {
    try {
      console.log('⏳ Payment pending:', result);
      
      await paymentService.handleSnapPending(result);
      
      toast.loading('Payment is being processed. You will be notified once completed.', {
        duration: 4000
      });
      
      // Call custom pending handler
      if (onPending) {
        onPending();
      }
      
    } catch (error) {
      console.error('Error handling payment pending:', error);
    }
  };

  /**
   * SNAP.JS SPECIFIC: Handle payment error callback
   */
  const handleSnapError = async (result: unknown, onError?: () => void): Promise<void> => {
    try {
      console.error('❌ Payment error:', result);
      
      await paymentService.handleSnapError(result);
      
      const statusMessage = result && typeof result === 'object' && 'status_message' in result 
        ? String(result.status_message) 
        : 'Unknown error';
      toast.error(`Payment failed: ${statusMessage}`);
      
      // Call custom error handler
      if (onError) {
        onError();
      }
      
    } catch (error) {
      console.error('Error handling payment error:', error);
    }
  };

  /**
   * SNAP.JS SPECIFIC: Handle payment popup close
   */
  const handleSnapClose = (onClose?: () => void): void => {
    console.log('🔒 Payment popup closed by user');
    
    toast('Payment cancelled. You can try again anytime.');
    
    // Call custom close handler
    if (onClose) {
      onClose();
    }
  };

  /**
   * Export payments
   */
  const handleExportPayments = async (filters?: unknown): Promise<void> => {
    try {
      setIsProcessing(true);
      
      await paymentService.exportPayments(filters);
      
      toast.success('Payment data exported successfully!');
      
    } catch (error: unknown) {
      console.error('Failed to export payments:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to export payments';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Retry failed payment
   */
  const handleRetryPayment = async (paymentId: number | string): Promise<SnapPaymentData> => {
    try {
      console.log('🔄 Retrying payment:', paymentId);
      
      // Same as getting new payment data
      return await getSnapPaymentData(paymentId);
      
    } catch (error: unknown) {
      console.error('Failed to retry payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to retry payment';
      toast.error(errorMessage);
      throw error;
    }
  };

  return {
    // State
    isProcessing,
    isCheckingStatus,
    snapData,
    
    // NEW Snap.js methods (recommended)
    getSnapPaymentData,
    handleSnapSuccess,
    handleSnapPending,
    handleSnapError,
    handleSnapClose,
    
    // Legacy methods (still supported)
    handlePayNow,
    handleRetryPayment,
    
    // Status methods
    handleCheckStatus,
    handleSyncStatus,
    handleBulkStatusCheck,
    
    // Utility methods
    handleExportPayments,
  };
};
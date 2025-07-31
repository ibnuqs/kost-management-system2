// File: src/pages/Tenant/services/paymentService.ts
import api, { endpoints, ApiResponse } from '../../../utils/api';
import { 
  Payment, 
  PaymentFilters,
} from '../types/payment';

interface PaymentUrlResponse {
  payment_url: string;
  snap_token?: string;
  expires_at?: string;
}

interface ResponseData {
  snap_token?: string;
  frontend_config?: {
    snap_token: string;
    client_key: string;
    is_production: boolean;
    transaction_details: {
      order_id: string;
      gross_amount: number;
    };
  };
  client_key?: string;
  is_production?: boolean;
  order_id?: string;
  amount?: number;
  payment_id?: number | string;
  expires_at?: string;
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

class PaymentService {
  /**
   * NEW: Get payment data for Snap.js integration (NO REDIRECT)
   */
  async getSnapPaymentData(paymentId: number | string): Promise<SnapPaymentData> {
    try {
      console.log('🔄 Getting Snap payment data for:', paymentId);

      const response = await api.get<ApiResponse<ResponseData>>(
        endpoints.tenant.payments.paymentUrl(paymentId)
      );

      console.log('✅ Snap payment response:', response.data);

      // Handle response structure safely
      const apiData = response.data;
      if ('success' in apiData && apiData.success === false) {
        throw new Error((apiData as ApiResponse<unknown> & { message?: string }).message || 'Failed to get payment data');
      }

      const data = (apiData as ApiResponse<ResponseData>).data || (apiData as ResponseData);

      // Extract Snap data for frontend integration
      return {
        snap_token: data.snap_token || data.frontend_config?.snap_token || '',
        client_key: data.frontend_config?.client_key || data.client_key || '',
        is_production: data.frontend_config?.is_production || false,
        payment_data: {
          order_id: data.frontend_config?.transaction_details?.order_id || data.order_id || '',
          gross_amount: data.frontend_config?.transaction_details?.gross_amount || data.amount || 0,
          payment_id: Number(data.payment_id || paymentId)
        },
        expires_at: data.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

    } catch (error: unknown) {
      console.error('❌ PaymentService.getSnapPaymentData error:', error);
      
      // Enhanced error handling for 405 errors
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 405) {
        console.warn('🔄 Method not allowed, trying POST method...');
        
        try {
          // FALLBACK: Try POST method if GET doesn't work
          const postResponse = await api.post<ApiResponse<ResponseData>>(
            endpoints.tenant.payments.paymentUrl(paymentId),
            {}
          );
          
          const postData = postResponse.data;
          if ('success' in postData && postData.success === false) {
            throw new Error((postData as ApiResponse<unknown> & { message?: string }).message || 'Failed to get payment data');
          }

          const data = (postData as ApiResponse<ResponseData>).data || (postData as ResponseData);
          
          return {
            snap_token: data.snap_token || data.frontend_config?.snap_token,
            client_key: data.frontend_config?.client_key || data.client_key,
            is_production: data.frontend_config?.is_production || false,
            payment_data: {
              order_id: data.frontend_config?.transaction_details?.order_id || data.order_id,
              gross_amount: data.frontend_config?.transaction_details?.gross_amount || data.amount,
              payment_id: data.payment_id || paymentId
            },
            expires_at: data.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          };
        } catch (postError) {
          console.warn('🔄 POST method also failed');
          throw postError;
        }
      }
      
      throw error;
    }
  }

  /**
   * LEGACY: For backward compatibility - returns payment URL
   */
  async initiatePayment(paymentId: number | string): Promise<PaymentUrlResponse> {
    console.log('⚠️ DEPRECATED: Using legacy payment URL. Consider using getSnapPaymentData() for better UX');
    
    const snapData = await this.getSnapPaymentData(paymentId);
      
    // Return legacy format
    return {
      payment_url: `https://app.${snapData.is_production ? '' : 'sandbox.'}midtrans.com/snap/v1/transactions/${snapData.snap_token}`,
      snap_token: snapData.snap_token,
      expires_at: snapData.expires_at
    };
  }

  /**
   * Check payment status after Snap.js payment
   */
  async checkPaymentStatus(paymentId: number | string): Promise<Payment> {
    const response = await api.get<ApiResponse<Payment>>(
      endpoints.tenant.payments.status(paymentId)
    );
      
    const apiData = response.data;
    if ('success' in apiData && apiData.success === false) {
      throw new Error((apiData as ApiResponse<unknown> & { message?: string }).message || 'Failed to check payment status');
    }

    return (apiData as ApiResponse<Payment>).data || (apiData as Payment);
  }

  /**
   * Sync payment status with Midtrans after popup payment
   */
  async syncPaymentStatus(paymentId: number | string): Promise<{ old_status: string; new_status: string; updated_at: string }> {
    const response = await api.post<ApiResponse<{ old_status: string; new_status: string; updated_at: string }>>(
      endpoints.tenant.payments.syncStatus(paymentId),
      {}
    );
      
    const apiData = response.data;
    if ('success' in apiData && apiData.success === false) {
      throw new Error((apiData as ApiResponse<unknown> & { message?: string }).message || 'Failed to sync payment status');
    }

    return (apiData as ApiResponse<{ old_status: string; new_status: string; updated_at: string }>).data || (apiData as { old_status: string; new_status: string; updated_at: string });
  }

  /**
   * Get payments list with filtering
   */
  async getPayments(params?: PaymentFilters & {
    page?: number;
    limit?: number;
  }): Promise<{ payments: Payment[]; total: number; current_page?: number; last_page?: number }> {
    const response = await api.get<ApiResponse<Payment[]>>(
      endpoints.tenant.payments.index, 
      { params }
    );
      
    // Handle both paginated and non-paginated responses
    const apiData = response.data;
    if ('success' in apiData && apiData.success === false) {
      throw new Error((apiData as ApiResponse<unknown> & { message?: string }).message || 'Failed to fetch payments');
    }

    // Check if it's a paginated response
    const data = (apiData as ApiResponse<Payment[] | { data: Payment[]; total: number; current_page?: number; last_page?: number }>).data || (apiData as Payment[] | { data: Payment[]; total: number; current_page?: number; last_page?: number });
    if (Array.isArray(data)) {
      // Non-paginated response
      return {
        payments: data,
        total: data.length
      };
    } else if (data && 'data' in data && Array.isArray(data.data)) {
      // Paginated response
      return {
        payments: data.data,
        total: data.total || data.data.length,
        current_page: data.current_page,
        last_page: data.last_page
      };
    } else {
      throw new Error('Invalid response format');
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: number | string): Promise<Payment> {
    const response = await api.get<ApiResponse<Payment>>(`/tenant/payments/${paymentId}`);
      
    const apiData = response.data;
    if ('success' in apiData && apiData.success === false) {
      throw new Error((apiData as ApiResponse<unknown> & { message?: string }).message || 'Failed to fetch payment');
    }

    return (apiData as ApiResponse<Payment>).data || (apiData as Payment);
  }

  /**
   * Get payment history with filters
   */
  async getPaymentHistory(filters?: PaymentFilters): Promise<Payment[]> {
    const response = await api.get<ApiResponse<Payment[]>>(
      endpoints.tenant.payments.history,
      { params: filters }
    );
      
    const apiData = response.data;
    if ('success' in apiData && apiData.success === false) {
      throw new Error((apiData as ApiResponse<unknown> & { message?: string }).message || 'Failed to fetch payment history');
    }

    return (apiData as ApiResponse<Payment[]>).data || (apiData as Payment[]) || [];
  }

  /**
   * Get payment summary/statistics
   */
  async getPaymentSummary(): Promise<{
    current_month: Payment | null;
    next_payment: Payment | null;
    recent_payments: Payment[];
    total_unpaid: number;
    payment_history_summary: {
      total_payments: number;
      total_paid: number;
      success_rate: number;
    };
  }> {
    type SummaryData = {
      current_month: Payment | null;
      next_payment: Payment | null;
      recent_payments: Payment[];
      total_unpaid: number;
      payment_history_summary: {
        total_payments: number;
        total_paid: number;
        success_rate: number;
      };
    };
    
    const response = await api.get<ApiResponse<SummaryData>>(
      endpoints.tenant.payments.summary
    );
      
    const apiData = response.data;
    if ('success' in apiData && apiData.success === false) {
      throw new Error((apiData as ApiResponse<unknown> & { message?: string }).message || 'Failed to fetch payment summary');
    }

    return (apiData as ApiResponse<SummaryData>).data || (apiData as SummaryData);
  }

  /**
   * SNAP.JS SPECIFIC: Handle payment success callback
   */
  async handleSnapSuccess(result: {
    order_id: string;
    transaction_status: string;
    payment_id?: string | number;
    [key: string]: unknown;
  }): Promise<void> {
    try {
      console.log('✅ Handling Snap success:', result);
      
      // Extract payment info from Snap result
      const orderId = result.order_id;
      const transactionStatus = result.transaction_status;
      
      console.log(`Payment ${orderId} completed with status: ${transactionStatus}`);
      
      // Optional: Sync with backend to ensure consistency
      if (result.payment_id || orderId) {
        try {
          // Try to extract payment ID from order_id if needed
          const paymentId = result.payment_id || this.extractPaymentIdFromOrderId(orderId);
          if (paymentId) {
            await this.syncPaymentStatus(paymentId);
          }
        } catch (syncError) {
          console.warn('Failed to sync payment status, but payment was successful:', syncError);
        }
      }
      
    } catch (error) {
      console.error('Error handling Snap success:', error);
    }
  }

  /**
   * SNAP.JS SPECIFIC: Handle payment pending callback
   */
  async handleSnapPending(result: {
    order_id: string;
    transaction_status: string;
    payment_id?: string | number;
    [key: string]: unknown;
  }): Promise<void> {
    try {
      console.log('⏳ Handling Snap pending:', result);
      
      const orderId = result.order_id;
      console.log(`Payment ${orderId} is pending processing`);
      
      // Optional: Sync with backend
      if (result.payment_id || orderId) {
        try {
          const paymentId = result.payment_id || this.extractPaymentIdFromOrderId(orderId);
          if (paymentId) {
            await this.syncPaymentStatus(paymentId);
          }
        } catch (syncError) {
          console.warn('Failed to sync payment status for pending payment:', syncError);
        }
      }
      
    } catch (error) {
      console.error('Error handling Snap pending:', error);
    }
  }

  /**
   * SNAP.JS SPECIFIC: Handle payment error callback
   */
  async handleSnapError(result: {
    order_id: string;
    status_message: string;
    payment_id?: string | number;
    [key: string]: unknown;
  }): Promise<void> {
    try {
      console.error('❌ Handling Snap error:', result);
      
      const orderId = result.order_id;
      const statusMessage = result.status_message;
      
      console.error(`Payment ${orderId} failed: ${statusMessage}`);
      
      // Optional: Log error to backend or analytics
      // await this.logPaymentError(result);
      
    } catch (error) {
      console.error('Error handling Snap error:', error);
    }
  }

  /**
   * Helper: Extract payment ID from order ID
   * Override this method based on your order ID format
   */
  private extractPaymentIdFromOrderId(orderId: string): string | null {
    try {
      // Example: if order_id format is "KOST-{payment_id}-{timestamp}"
      const parts = orderId.split('-');
      if (parts.length >= 2) {
        return parts[1];
      }
      
      // Or if order_id is just the payment_id
      if (/^\d+$/.test(orderId)) {
        return orderId;
      }
      
      return null;
    } catch {
      console.warn('Failed to extract payment ID from order ID:', orderId);
      return null;
    }
  }

  /**
   * Export payments data
   */
  async exportPayments(filters?: PaymentFilters): Promise<void> {
    const response = await api.get('/tenant/payments/export', {
      params: filters,
      responseType: 'blob',
    });
      
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
      
    // Get filename from response headers or use default
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : `payments-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
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

      const response = await api.get<ApiResponse<any>>(
        endpoints.tenant.payments.paymentUrl(paymentId)
      );

      console.log('✅ Snap payment response:', response.data);

      // Handle response structure safely
      const apiData = response.data;
      if ('success' in apiData && apiData.success === false) {
        throw new Error((apiData as any).message || 'Failed to get payment data');
      }

      const data = apiData.data || apiData;

      // Extract Snap data for frontend integration
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

    } catch (error: any) {
      console.error('❌ PaymentService.getSnapPaymentData error:', error);
      
      // Enhanced error handling for 405 errors
      if (error.response?.status === 405) {
        console.warn('🔄 Method not allowed, trying POST method...');
        
        try {
          // FALLBACK: Try POST method if GET doesn't work
          const postResponse = await api.post<ApiResponse<any>>(
            endpoints.tenant.payments.paymentUrl(paymentId),
            {}
          );
          
          const postData = postResponse.data;
          if ('success' in postData && postData.success === false) {
            throw new Error((postData as any).message || 'Failed to get payment data');
          }

          const data = postData.data || postData;
          
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
    
    try {
      const snapData = await this.getSnapPaymentData(paymentId);
      
      // Return legacy format
      return {
        payment_url: `https://app.${snapData.is_production ? '' : 'sandbox.'}midtrans.com/snap/v1/transactions/${snapData.snap_token}`,
        snap_token: snapData.snap_token,
        expires_at: snapData.expires_at
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check payment status after Snap.js payment
   */
  async checkPaymentStatus(paymentId: number | string): Promise<Payment> {
    try {
      const response = await api.get<ApiResponse<Payment>>(
        endpoints.tenant.payments.status(paymentId)
      );
      
      const apiData = response.data;
      if ('success' in apiData && apiData.success === false) {
        throw new Error((apiData as any).message || 'Failed to check payment status');
      }

      return (apiData as any).data || apiData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sync payment status with Midtrans after popup payment
   */
  async syncPaymentStatus(paymentId: number | string): Promise<{ old_status: string; new_status: string; updated_at: string }> {
    try {
      const response = await api.post<ApiResponse<{ old_status: string; new_status: string; updated_at: string }>>(
        endpoints.tenant.payments.syncStatus(paymentId),
        {}
      );
      
      const apiData = response.data;
      if ('success' in apiData && apiData.success === false) {
        throw new Error((apiData as any).message || 'Failed to sync payment status');
      }

      return (apiData as any).data || apiData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get payments list with filtering
   */
  async getPayments(params?: PaymentFilters & {
    page?: number;
    limit?: number;
  }): Promise<{ payments: Payment[]; total: number; current_page?: number; last_page?: number }> {
    try {
      const response = await api.get<ApiResponse<Payment[]>>(
        endpoints.tenant.payments.index, 
        { params }
      );
      
      // Handle both paginated and non-paginated responses
      const apiData = response.data;
      if ('success' in apiData && apiData.success === false) {
        throw new Error((apiData as any).message || 'Failed to fetch payments');
      }

      // Check if it's a paginated response
      const data = (apiData as any).data || apiData;
      if (Array.isArray(data)) {
        // Non-paginated response
        return {
          payments: data,
          total: data.length
        };
      } else if (data.data && Array.isArray(data.data)) {
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
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: number | string): Promise<Payment> {
    try {
      const response = await api.get<ApiResponse<Payment>>(`/tenant/payments/${paymentId}`);
      
      const apiData = response.data;
      if ('success' in apiData && apiData.success === false) {
        throw new Error((apiData as any).message || 'Failed to fetch payment');
      }

      return (apiData as any).data || apiData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get payment history with filters
   */
  async getPaymentHistory(filters?: PaymentFilters): Promise<Payment[]> {
    try {
      const response = await api.get<ApiResponse<Payment[]>>(
        endpoints.tenant.payments.history,
        { params: filters }
      );
      
      const apiData = response.data;
      if ('success' in apiData && apiData.success === false) {
        throw new Error((apiData as any).message || 'Failed to fetch payment history');
      }

      return (apiData as any).data || apiData || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get payment summary/statistics
   */
  async getPaymentSummary(): Promise<any> {
    try {
      const response = await api.get<ApiResponse<any>>(
        endpoints.tenant.payments.summary
      );
      
      const apiData = response.data;
      if ('success' in apiData && apiData.success === false) {
        throw new Error((apiData as any).message || 'Failed to fetch payment summary');
      }

      return (apiData as any).data || apiData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * SNAP.JS SPECIFIC: Handle payment success callback
   */
  async handleSnapSuccess(result: any): Promise<void> {
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
  async handleSnapPending(result: any): Promise<void> {
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
  async handleSnapError(result: any): Promise<void> {
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
    } catch (error) {
      console.warn('Failed to extract payment ID from order ID:', orderId);
      return null;
    }
  }

  /**
   * Export payments data
   */
  async exportPayments(filters?: PaymentFilters): Promise<void> {
    try {
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
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
// File: src/pages/Tenant/services/receiptService.ts

import api, { endpoints } from '../../../utils/api';
import type { ApiResponse } from '../../../utils/api';

export interface ReceiptAvailabilityResponse {
  available: boolean;
  payment_id: number;
  status: string;
  paid_at: string | null;
  reason: string;
}

export interface ReceiptUrlResponse {
  receipt_url: string;
  payment_id: number;
  order_id: string;
  amount: number;
  paid_at: string;
}

export interface ReceiptVerificationResponse {
  valid: boolean;
  receipt_number: string;
  payment_id?: number;
  order_id?: string;
  amount?: number;
  paid_at?: string;
  tenant_name?: string;
  room_number?: string;
  verification_timestamp: string;
  message: string;
}

class ReceiptService {
  /**
   * Check if receipt is available for a payment
   */
  async checkReceiptAvailability(paymentId: number): Promise<ReceiptAvailabilityResponse> {
    const response = await api.get<ApiResponse<ReceiptAvailabilityResponse>>(
      endpoints.tenant.payments.receipt.check(paymentId)
    );
    return response.data.data || (response.data as ReceiptAvailabilityResponse);
  }

  /**
   * Get receipt URL for a payment
   */
  async getReceiptUrl(paymentId: number): Promise<ReceiptUrlResponse> {
    const response = await api.get<ApiResponse<ReceiptUrlResponse>>(
      endpoints.tenant.payments.receipt.url(paymentId)
    );
    return response.data.data || (response.data as ReceiptUrlResponse);
  }

  /**
   * Download receipt for a payment
   */
  async downloadReceipt(paymentId: number): Promise<void> {
    try {
      const response = await api.get(endpoints.tenant.payments.receipt.download(paymentId), {
        responseType: 'blob',
      });

      // Create blob URL
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `kwitansi_${paymentId}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      throw error;
    }
  }

  /**
   * Verify receipt authenticity
   */
  async verifyReceipt(receiptNumber: string): Promise<ReceiptVerificationResponse> {
    const response = await api.get<ApiResponse<ReceiptVerificationResponse>>(`/receipt/verify/${receiptNumber}`);
    return response.data.data || (response.data as ReceiptVerificationResponse);
  }
}

export const receiptService = new ReceiptService();
export default receiptService;
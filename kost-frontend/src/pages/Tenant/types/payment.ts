// File: src/pages/Tenant/types/payment.ts
import { BaseEntity } from './common';

// Updated to match database schema: pending, paid, overdue
export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'overdue'
  | 'failed'
  | 'cancelled'
  | 'success'
  | 'settlement'
  | 'capture'
  | 'authorize'
  | 'failure'
  | 'cancel'
  | 'deny'
  | 'expire';

// Updated to match database schema from kost_management_latest.sql
export interface Payment extends BaseEntity {
  order_id: string;
  tenant_id: number;
  payment_month?: string;  // nullable in DB
  amount: number;
  status: PaymentStatus;
  payment_method?: string;
  snap_token?: string;
  paid_at?: string;
  // Removed non-existent fields: due_date, payment_url, transaction_id, failure_reason, failed_at
}

export interface PaymentStatusResponse {
  payment: Payment;
  midtrans_status?: string;
}

export interface PaymentUrlResponse {
  payment_url: string;
  snap_token: string;
  data: {
    payment: Payment;
    snap_token: string;
  };
}

export interface PaymentFilters {
  status?: PaymentStatus | 'all';
  month?: string;
  year?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'due_date' | 'amount' | 'payment_month';
  sort_order?: 'asc' | 'desc';
}

export interface PaymentStats {
  total_payments: number;
  total_paid: number;
  total_pending: number;
  total_failed: number;
  total_amount_paid: number;
  total_amount_pending: number;
  payment_rate: number;
  average_payment_time: number;
}

export interface PaymentSummary {
  current_month: Payment | null;
  next_payment: Payment | null;
  recent_payments: Payment[];
  stats: PaymentStats;
}

// Utility functions
// Updated to include overdue status
export const getPaymentStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case 'paid':
    case 'success':
    case 'settlement':
    case 'capture':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'pending':
    case 'authorize':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'overdue':
      return 'text-red-600 bg-red-100 border-red-200';
    case 'failed':
    case 'failure':
    case 'cancel':
    case 'deny':
    case 'expire':
      return 'text-red-600 bg-red-100 border-red-200';
    case 'cancelled':
      return 'text-gray-600 bg-gray-100 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

// Updated to Indonesian language and database schema
export const getPaymentStatusLabel = (status: PaymentStatus): string => {
  switch (status) {
    case 'paid':
    case 'success':
    case 'settlement':
    case 'capture':
      return 'Lunas';
    case 'pending':
      return 'Menunggu';
    case 'overdue':
      return 'Terlambat';
    case 'authorize':
      return 'Terotorisasi';
    case 'failed':
    case 'failure':
      return 'Gagal';
    case 'cancel':
    case 'cancelled':
      return 'Dibatalkan';
    case 'deny':
      return 'Ditolak';
    case 'expire':
      return 'Kadaluarsa';
    default:
      return 'Tidak Diketahui';
  }
};

// Updated to include overdue status
export const getPaymentStatusIcon = (status: PaymentStatus): string => {
  switch (status) {
    case 'paid':
    case 'success':
    case 'settlement':
    case 'capture':
      return 'CheckCircle';
    case 'pending':
    case 'authorize':
      return 'Clock';
    case 'overdue':
      return 'AlertCircle';
    case 'failed':
    case 'failure':
    case 'cancel':
    case 'deny':
    case 'expire':
      return 'AlertCircle';
    case 'cancelled':
      return 'XCircle';
    default:
      return 'AlertCircle';
  }
};
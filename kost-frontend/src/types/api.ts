// src/types/api.ts - Centralized API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  code?: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface QueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  filter?: Record<string, any>;
}

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
}

// Request/Response wrappers
export type ApiPromise<T> = Promise<ApiResponse<T>>;
export type PaginatedApiPromise<T> = Promise<ApiResponse<PaginatedResponse<T>>>;

// Common status types
export type Status = 'active' | 'inactive' | 'pending' | 'suspended';
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'expired';
export type AccessStatus = 'granted' | 'denied' | 'expired' | 'blocked';
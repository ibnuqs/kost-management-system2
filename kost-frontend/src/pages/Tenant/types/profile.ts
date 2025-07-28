// File: src/pages/Tenant/types/profile.ts
import { User, BaseEntity } from './common';
import { RfidCard } from './rfid';
import { Payment } from './payment';

export interface TenantProfile extends BaseEntity {
  user_id: number;
  room_id: number;
  room_number: string;
  phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  id_card_number?: string;
  id_card_type?: 'ktp' | 'passport' | 'sim' | 'other';
  address?: string;
  occupation?: string;
  company_name?: string;
  monthly_income?: number;
  move_in_date: string;
  move_out_date?: string;
  lease_duration_months: number;
  security_deposit: number;
  monthly_rent: number;
  status: 'active' | 'inactive' | 'terminated' | 'pending';
  profile_photo?: string;
  notes?: string;
  user?: User;
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: string;
  occupation?: string;
  company_name?: string;
  profile_photo?: string | File;
}

export interface SecuritySettings {
  two_factor_enabled: boolean;
  login_notifications: boolean;
  payment_notifications: boolean;
  access_notifications: boolean;
  marketing_emails: boolean;
  last_password_change?: string;
  active_sessions: LoginSession[];
}

export interface LoginSession {
  id: string;
  device: string;
  browser: string;
  ip_address: string;
  location?: string;
  last_activity: string;
  is_current: boolean;
}

export interface ProfileStats {
  days_as_tenant: number;
  total_payments_made: number;
  total_amount_paid: number;
  payment_success_rate: number;
  average_monthly_usage: number;
  total_access_logs: number;
  active_rfid_cards: number;
  profile_completion: number;
  account_score: number;
}

export interface AccountActivity {
  id: string;
  type: 'login' | 'password_change' | 'profile_update' | 'payment' | 'rfid_request' | 'access';
  description: string;
  timestamp: string;
  ip_address?: string;
  device?: string;
  location?: string;
  status: 'success' | 'failed' | 'pending';
  metadata?: Record<string, any>;
}

export interface ProfileCompletion {
  overall: number;
  sections: {
    basic_info: number;
    contact_info: number;
    emergency_contact: number;
    identification: number;
    employment: number;
    security: number;
  };
  missing_fields: string[];
  recommendations: string[];
}

export interface PreferenceSettings {
  language: 'en' | 'id';
  timezone: string;
  date_format: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  currency_format: 'IDR' | 'USD' | 'EUR';
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    in_app: boolean;
  };
  privacy_settings: {
    profile_visibility: 'public' | 'private' | 'tenants_only';
    show_online_status: boolean;
    allow_contact: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
}

export interface DocumentUpload {
  id: string;
  type: 'id_card' | 'passport' | 'contract' | 'income_statement' | 'other';
  filename: string;
  original_name: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
  verified: boolean;
  verified_at?: string;
  verified_by?: number;
  expiry_date?: string;
  notes?: string;
}

export const getProfileCompletionColor = (percentage: number): string => {
  if (percentage >= 90) return 'text-green-600 bg-green-100';
  if (percentage >= 70) return 'text-blue-600 bg-blue-100';
  if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

export const getTenantStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'inactive':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'terminated':
      return 'text-red-600 bg-red-100 border-red-200';
    case 'pending':
      return 'text-blue-600 bg-blue-100 border-blue-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

export const getAccountScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
};
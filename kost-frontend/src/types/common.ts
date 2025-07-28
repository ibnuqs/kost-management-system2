// src/types/common.ts - Common Shared Types

// Base entity interface
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// User related types
export interface User extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'tenant';
  status: 'active' | 'inactive' | 'suspended';
  email_verified_at?: string;
  last_login_at?: string;
  avatar?: string;
}

// Room related types
export interface Room extends BaseEntity {
  room_number: string;
  floor: number;
  monthly_rent: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  description?: string;
  facilities?: string[];
  images?: string[];
  current_tenant?: Tenant;
}

// Tenant related types
export interface Tenant extends BaseEntity {
  user_id: number;
  room_id: number;
  tenant_code: string;
  start_date: string;
  end_date?: string;
  monthly_rent: number;
  deposit: number;
  status: 'active' | 'inactive' | 'moved_out';
  emergency_contact?: string;
  user?: User;
  room?: Room;
  payments?: Payment[];
}

// Payment related types
export interface Payment extends BaseEntity {
  tenant_id: number;
  order_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'expired';
  payment_method?: string;
  payment_month: string; // YYYY-MM format
  due_date: string;
  paid_at?: string;
  expires_at?: string;
  snap_token?: string;
  snap_redirect_url?: string;
  midtrans_transaction_id?: string;
  notes?: string;
  tenant?: Tenant;
}

// RFID related types
export interface RfidCard extends BaseEntity {
  user_id: number;
  uid: string;
  name: string;
  status: 'active' | 'inactive' | 'lost' | 'damaged';
  last_used_at?: string;
  user?: User;
}

// Access log types
export interface AccessLog extends BaseEntity {
  user_id: number;
  room_id: number;
  rfid_card_id?: number;
  accessed_at: string;
  access_granted: boolean;
  reason?: string;
  device_info?: string;
  user?: User;
  room?: Room;
  rfid_card?: RfidCard;
}

// IoT Device types
export interface IoTDevice extends BaseEntity {
  room_id: number;
  device_id: string;
  name: string;
  type: 'door_sensor' | 'rfid_reader' | 'smart_lock' | 'camera' | 'temperature_sensor';
  status: 'online' | 'offline' | 'maintenance' | 'error';
  last_seen?: string;
  firmware_version?: string;
  battery_level?: number;
  configuration?: Record<string, any>;
  room?: Room;
}

// Notification types
export interface Notification extends BaseEntity {
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'payment' | 'access' | 'system';
  read_at?: string;
  action_url?: string;
  metadata?: Record<string, any>;
  user?: User;
}

// Form types
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  role?: 'admin' | 'tenant';
}

export interface ChangePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Dashboard & Analytics types
export interface DashboardStats {
  rooms: {
    total: number;
    occupied: number;
    available: number;
    maintenance: number;
    occupancy_rate: number;
  };
  tenants: {
    total: number;
    active: number;
    new_this_month: number;
    moved_out_this_month: number;
  };
  financial: {
    monthly_revenue: number;
    pending_payments: number;
    overdue_payments: number;
    collection_rate: number;
  };
  access: {
    total_today: number;
    successful_today: number;
    failed_today: number;
    peak_hour: string;
  };
}

// Filter and search types
export interface FilterOptions {
  status?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  room_type?: string[];
  payment_status?: string[];
  user_role?: string[];
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Component prop types
export interface ComponentWithChildren {
  children: React.ReactNode;
  className?: string;
}

export interface ComponentWithLoading {
  isLoading?: boolean;
  error?: string | null;
}

export interface ComponentWithPagination {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Event handler types
export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;
export type ChangeHandler = EventHandler<React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>>;
export type ClickHandler = EventHandler<React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>>;
export type SubmitHandler = EventHandler<React.FormEvent<HTMLFormElement>>;

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

// Theme and styling types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | string[] | undefined;
}
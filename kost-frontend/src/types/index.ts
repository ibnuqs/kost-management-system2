// File: types/index.ts

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'tenant';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Room Types
export interface Room {
  id: number;
  room_number: string;
  room_name: string;
  monthly_price: number;
  status: 'available' | 'occupied' | 'maintenance';
  created_at: string;
  updated_at: string;
  activeTenant?: Tenant;
}

// Tenant Types
export interface Tenant {
  id: number;
  user_id: number;
  room_id: number;
  monthly_rent: number;
  start_date: string;
  status: 'active' | 'moved_out';
  created_at: string;
  updated_at: string;
  user: User;
  room: Room;
  payments?: Payment[];
}

// Payment Types
export interface Payment {
  id: number;
  order_id: string;
  tenant_id: number;
  payment_month: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  payment_method?: string;
  snap_token?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  tenant: Tenant;
}

// RFID Card Types
export interface RfidCard {
  id: number;
  uid: string;
  user_id: number;
  room_id: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  user: User;
  room: Room;
}

// Access Log Types
export interface AccessLog {
  id: number;
  user_id?: number;
  room_id?: number;
  rfid_uid: string;
  device_id?: string;
  access_granted: boolean;
  accessed_at: string;
  user?: User;
  room?: Room;
}

// IoT Device Types
export interface IoTDevice {
  id: number;
  device_id: string;
  device_name: string;
  device_type: 'door_lock' | 'card_scanner' | 'rfid_reader';
  room_id?: number;
  status: 'online' | 'offline';
  device_info?: any;
  last_seen?: string;
  created_at: string;
  updated_at: string;
  room?: Room;
}

// Notification Types
export interface Notification {
  id: number;
  user_id?: number;
  title: string;
  message: string;
  type: 'payment' | 'access' | 'system';
  status: 'unread' | 'read';
  created_at: string;
  user?: User;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  role?: 'tenant';
}

export interface AuthResponse {
  user: User;
  token: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Dashboard Stats Types
export interface DashboardStats {
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  total_tenants: number;
  active_tenants: number;
  monthly_revenue: number;
  pending_payments: number;
  overdue_payments: number;
  total_devices: number;
  online_devices: number;
  recent_access: AccessLog[];
  revenue_chart: RevenueData[];
  occupancy_rate: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  payments: number;
}

// Form Types
export interface RoomFormData {
  room_number: string;
  room_name: string;
  monthly_price: number;
  status: 'available' | 'occupied' | 'maintenance';
}

export interface TenantFormData {
  user_id?: number;
  room_id: number;
  monthly_rent: number;
  start_date: string;
  user?: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
  };
}

export interface PaymentFormData {
  tenant_id: number;
  payment_month: string;
  amount: number;
}

export interface DeviceFormData {
  device_id: string;
  device_name: string;
  device_type: 'door_lock' | 'card_scanner' | 'rfid_reader';
  room_id?: number;
}

// WebSocket Event Types
export interface RfidAccessEvent {
  user_id?: number;
  user_name: string;
  room_id?: number;
  room_number: string;
  access_granted: boolean;
  device_id: string;
  accessed_at: string;
}

export interface PaymentSuccessEvent {
  payment_id: number;
  tenant_id: number;
  tenant_name: string;
  room_number: string;
  amount: number;
  payment_month: string;
  paid_at: string;
}

export interface DeviceStatusEvent {
  device_id: string;
  device_name: string;
  status: 'online' | 'offline';
  last_seen?: string;
  message?: string;
}

export interface SystemAlertEvent {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

// Component Props Types
export interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onRow?: (record: T) => void;
  rowKey?: string | ((record: T) => string);
}

// Hook Types
export interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  enabled?: boolean;
}

// Updated AuthContextType with hasCheckedAuth property
export interface AuthContextType {
  // State properties
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasCheckedAuth: boolean; // Added this property
  
  // Action methods
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; user?: User; token?: string; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; user?: User; token?: string; error?: string }>;
  logout: () => Promise<void>;
  loadUser: () => Promise<{ success: boolean; user?: User; error?: string }>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  
  // Helper methods
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isTenant: () => boolean;
}

// Error Types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// Environment Variables Type Extension
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_APP_URL: string;
    readonly VITE_PUSHER_APP_KEY: string;
    readonly VITE_PUSHER_APP_CLUSTER: string;
    readonly VITE_PUSHER_HOST: string;
    readonly VITE_PUSHER_PORT: string;
    readonly VITE_PUSHER_SCHEME: string;
    readonly VITE_MIDTRANS_CLIENT_KEY: string;
    readonly VITE_MIDTRANS_ENVIRONMENT: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_VERSION: string;
    readonly VITE_DEBUG: string;
    readonly VITE_HIVEMQ_HOST: string;
    readonly VITE_HIVEMQ_PORT: string;
    readonly VITE_HIVEMQ_USERNAME: string;
    readonly VITE_HIVEMQ_PASSWORD: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
// pages/Auth/types/auth.ts
// Auth types aligned with Laravel backend

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'tenant';
  status: 'active' | 'inactive' | 'suspended';
  email_verified_at?: string;
  created_at: string;
  updated_at?: string;
  
  // Additional fields from Laravel backend
  tenant_summary?: {
    is_active_tenant: boolean;
    current_room?: {
      id: string;
      room_number: string;
    };
    total_tenancies: number;
    total_paid_amount: number;
  };
  
  current_room_info?: {
    room_id: string;
    room_number: string;
    start_date: string;
    monthly_rent: number;
  };
  
  can_be_assigned?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

// API Response interfaces
export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  error?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>; // Laravel validation errors
}

// Context type
export interface AuthContextType {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasCheckedAuth: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  loadUser: () => Promise<AuthResponse>;
  updateProfile: (userData: Partial<User>) => Promise<AuthResponse>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<AuthResponse>;
  forgotPassword: (email: string) => Promise<AuthResponse>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<AuthResponse>;
  clearError: () => void;

  // Helpers
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isTenant: () => boolean;
  isActive: () => boolean;
  isInactive: () => boolean;
  isSuspended: () => boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasCheckedAuth: boolean;
}
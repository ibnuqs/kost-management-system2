// pages/Auth/utils/index.ts
// Central export file for Auth utilities

// Re-export everything from constants
export * from './constants';

// Re-export everything from helpers
export * from './helpers';

// Re-export everything from validators
export * from './validators';

// Additional exports that might be needed (without conflicting names)
export {
  // Constants aliases for easier access
  API_ENDPOINTS as AUTH_API_ENDPOINTS,
  VALIDATION_MESSAGES as AUTH_VALIDATION_MESSAGES,
  SUCCESS_MESSAGES as AUTH_SUCCESS_MESSAGES,
  ERROR_MESSAGES as AUTH_ERROR_MESSAGES,
  REGEX_PATTERNS as AUTH_REGEX_PATTERNS,
  PASSWORD_REQUIREMENTS as AUTH_PASSWORD_REQUIREMENTS,
  USER_ROLES as AUTH_USER_ROLES,
  USER_STATUSES as AUTH_USER_STATUSES,
  FORM_FIELDS as AUTH_FORM_FIELDS,
  LOADING_STATES as AUTH_LOADING_STATES,
  STORAGE_KEYS as AUTH_STORAGE_KEYS,
} from './constants';

// Type exports
export type {
  ApiEndpoint,
  StorageKey,
  RedirectRoute,
  UserRole,
  UserStatus,
  LoadingState,
  Theme,
  Language,
  PasswordStrengthLevel,
} from './constants';

// AUTH_ROUTES - use REDIRECT_ROUTES from constants and extend it
export const AUTH_ROUTES = {
  DEFAULT: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ADMIN: '/admin/dashboard',
  TENANT: '/tenant/dashboard',
  PROFILE: '/profile',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  // Add any additional routes your app needs
  HOME: '/',
  DASHBOARD: '/dashboard',
} as const;

// Export validation helpers as a namespace for easier usage
export const ValidationHelpers = {
  validateEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  validatePassword: (password: string) => {
    return password.length >= 8;
  },
  
  validateName: (name: string) => {
    return name.trim().length >= 2;
  },
  
  validatePhone: (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return !phone || phoneRegex.test(phone);
  },
} as const;

// Export storage helpers as a namespace
export const StorageHelpers = {
  getToken: () => localStorage.getItem('auth_token'),
  setToken: (token: string) => localStorage.setItem('auth_token', token),
  removeToken: () => localStorage.removeItem('auth_token'),
  
  getUser: () => {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  },
  
  setUser: (user: any) => {
    localStorage.setItem('user_data', JSON.stringify(user));
  },
  
  removeUser: () => localStorage.removeItem('user_data'),
  
  clearAll: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('remember_me');
  },
} as const;

// Export form field configurations
export const AUTH_FORM_CONFIGS = {
  LOGIN: {
    fields: ['email', 'password', 'remember'],
    required: ['email', 'password'],
  },
  REGISTER: {
    fields: ['name', 'email', 'password', 'password_confirmation', 'phone'],
    required: ['name', 'email', 'password', 'password_confirmation'],
  },
  FORGOT_PASSWORD: {
    fields: ['email'],
    required: ['email'],
  },
  RESET_PASSWORD: {
    fields: ['token', 'password', 'password_confirmation'],
    required: ['token', 'password', 'password_confirmation'],
  },
} as const;

// Export common patterns for form validation
export const FORM_VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  name: /^[a-zA-Z\s]+$/,
} as const;

// Export common error messages for forms
export const FORM_ERROR_MESSAGES = {
  REQUIRED: (field: string) => `${field} is required`,
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
  WEAK_PASSWORD: 'Password must contain uppercase, lowercase, number and special character',
  NAME_TOO_SHORT: 'Name must be at least 2 characters',
  GENERIC_ERROR: 'An error occurred. Please try again.',
} as const;

// Export default export for easier importing
export default {
  routes: AUTH_ROUTES,
  validation: ValidationHelpers,
  storage: StorageHelpers,
  forms: AUTH_FORM_CONFIGS,
  patterns: FORM_VALIDATION_PATTERNS,
  messages: FORM_ERROR_MESSAGES,
} as const;
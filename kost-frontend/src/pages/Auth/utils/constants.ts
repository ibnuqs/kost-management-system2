// pages/Auth/utils/constants.ts
// Constants for Auth module

// API Endpoints - align with Laravel routes (removed /auth prefix since api.ts handles baseURL)
export const API_ENDPOINTS = {
  // Auth endpoints (api.ts will add the base /api automatically)
  LOGIN: '/auth/login',
  REGISTER: '/auth/register', 
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh-token',
  
  // User endpoints
  USER: '/auth/profile',           // GET current user
  PROFILE: '/auth/profile',        // PUT update profile
  
  // Password endpoints
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/profile', // Same as profile for password change
  
  // Verification
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  REFRESH_TOKEN: 'refresh_token',
  REMEMBER_ME: 'remember_me',
  LANGUAGE: 'language',
  THEME: 'theme',
} as const;

// Redirect routes - adjust based on your app structure
export const REDIRECT_ROUTES = {
  DEFAULT: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ADMIN: '/admin/dashboard',
  TENANT: '/tenant/dashboard',
  PROFILE: '/profile',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
} as const;

// Password requirements - SIMPLIFIED
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 255,
  REQUIRE_UPPERCASE: false,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: false,
  REQUIRE_SPECIAL_CHARS: false,
  SPECIAL_CHARS: '@$!%*?&',
} as const;

// Validation messages - ADDED for validators.ts
export const VALIDATION_MESSAGES = {
  // Email messages
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  
  // Password messages
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_MIN_LENGTH: `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long`,
  PASSWORD_MAX_LENGTH: `Password must not exceed ${PASSWORD_REQUIREMENTS.MAX_LENGTH} characters`,
  PASSWORD_MISMATCH: 'Passwords do not match',
  PASSWORD_UPPERCASE: 'Password must contain at least one uppercase letter',
  PASSWORD_LOWERCASE: 'Password must contain at least one lowercase letter',
  PASSWORD_NUMBERS: 'Password must contain at least one number',
  PASSWORD_SPECIAL_CHARS: `Password must contain at least one special character (${PASSWORD_REQUIREMENTS.SPECIAL_CHARS})`,
  
  // Name messages
  NAME_REQUIRED: 'Name is required',
  NAME_MIN_LENGTH: 'Name must be at least 2 characters long',
  NAME_MAX_LENGTH: 'Name must not exceed 255 characters',
  
  // Phone messages
  PHONE_REQUIRED: 'Phone number is required',
  PHONE_INVALID: 'Please enter a valid phone number',
  
  // Terms messages
  TERMS_REQUIRED: 'You must accept the terms and conditions',
} as const;

// Regex patterns - ADDED for validators.ts
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[1-9][\d]{0,15}$/,
  PHONE_INDONESIA: /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
  NAME: /^[a-zA-Z\s]+$/,
  PASSWORD_UPPERCASE: /[A-Z]/,
  PASSWORD_LOWERCASE: /[a-z]/,
  PASSWORD_NUMBERS: /\d/,
  PASSWORD_SPECIAL_CHARS: /[@$!%*?&]/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PASSWORD_MEDIUM: /^(?=.*[a-z])[A-Za-z\d@$!%*?&]{8,}$/,
  PASSWORD_WEAK: /^.{8,}$/,
  ALPHA_NUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHA_ONLY: /^[a-zA-Z\s]+$/,
  NUMERIC_ONLY: /^\d+$/,
} as const;

// Form validation - UPDATED
export const VALIDATION_RULES = {
  EMAIL: {
    REQUIRED: VALIDATION_MESSAGES.EMAIL_REQUIRED,
    INVALID: VALIDATION_MESSAGES.EMAIL_INVALID,
    MAX_LENGTH: 255,
  },
  PASSWORD: {
    REQUIRED: VALIDATION_MESSAGES.PASSWORD_REQUIRED,
    MIN_LENGTH: PASSWORD_REQUIREMENTS.MIN_LENGTH,
    MAX_LENGTH: PASSWORD_REQUIREMENTS.MAX_LENGTH,
    MISMATCH: VALIDATION_MESSAGES.PASSWORD_MISMATCH,
    WEAK: 'Password must contain at least one letter',
    TOO_SHORT: VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
    TOO_LONG: VALIDATION_MESSAGES.PASSWORD_MAX_LENGTH,
    MISSING_UPPERCASE: VALIDATION_MESSAGES.PASSWORD_UPPERCASE,
    MISSING_LOWERCASE: VALIDATION_MESSAGES.PASSWORD_LOWERCASE,
    MISSING_NUMBER: VALIDATION_MESSAGES.PASSWORD_NUMBERS,
    MISSING_SPECIAL: VALIDATION_MESSAGES.PASSWORD_SPECIAL_CHARS,
  },
  NAME: {
    REQUIRED: VALIDATION_MESSAGES.NAME_REQUIRED,
    MIN_LENGTH: 2,
    MAX_LENGTH: 255,
    TOO_SHORT: VALIDATION_MESSAGES.NAME_MIN_LENGTH,
    TOO_LONG: VALIDATION_MESSAGES.NAME_MAX_LENGTH,
    INVALID: 'Name can only contain letters and spaces',
  },
  PHONE: {
    REQUIRED: VALIDATION_MESSAGES.PHONE_REQUIRED,
    INVALID: VALIDATION_MESSAGES.PHONE_INVALID,
    MIN_LENGTH: 10,
    MAX_LENGTH: 20,
    TOO_SHORT: VALIDATION_MESSAGES.PHONE_MIN_LENGTH,
    TOO_LONG: VALIDATION_MESSAGES.PHONE_MAX_LENGTH,
  },
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back! You have been logged in successfully.',
  LOGOUT_SUCCESS: 'You have been logged out successfully.',
  REGISTRATION_SUCCESS: 'Your account has been created successfully!',
  PROFILE_UPDATED: 'Your profile has been updated successfully.',
  PASSWORD_CHANGED: 'Your password has been changed successfully.',
  PASSWORD_RESET: 'Your password has been reset successfully.',
  RESET_EMAIL_SENT: 'Password reset link has been sent to your email.',
  EMAIL_VERIFIED: 'Your email has been verified successfully.',
  VERIFICATION_SENT: 'Verification email has been sent.',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_INACTIVE: 'Your account is inactive. Please contact support.',
  ACCOUNT_SUSPENDED: 'Your account has been suspended. Please contact support.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before continuing.',
  TOKEN_EXPIRED: 'The token has expired. Please request a new one.',
  USER_NOT_FOUND: 'User not found.',
  EMAIL_TAKEN: 'This email is already registered.',
  PHONE_TAKEN: 'This phone number is already registered.',
  WEAK_PASSWORD: 'Password is too weak. Please choose a stronger password.',
  RATE_LIMIT: 'Too many attempts. Please try again later.',
} as const;

// User roles - align with Laravel User model
export const USER_ROLES = {
  ADMIN: 'admin',
  TENANT: 'tenant',
} as const;

// User statuses - align with Laravel User model
export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

// Form field names
export const FORM_FIELDS = {
  EMAIL: 'email',
  PASSWORD: 'password',
  PASSWORD_CONFIRMATION: 'password_confirmation',
  CURRENT_PASSWORD: 'current_password',
  NAME: 'name',
  PHONE: 'phone',
  REMEMBER: 'remember',
  TOKEN: 'token',
} as const;

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Language options
export const LANGUAGES = {
  EN: 'en',
  ID: 'id',
} as const;

// Timeouts and delays
export const TIMEOUTS = {
  API_TIMEOUT: 30000,        // 30 seconds
  DEBOUNCE_DELAY: 300,       // 300ms
  TOAST_DURATION: 5000,      // 5 seconds
  SESSION_CHECK: 300000,     // 5 minutes
  TOKEN_REFRESH: 1800000,    // 30 minutes
} as const;

// Local storage expiry
export const STORAGE_EXPIRY = {
  TOKEN: 24 * 60 * 60 * 1000,       // 24 hours
  USER_DATA: 24 * 60 * 60 * 1000,   // 24 hours
  REMEMBER_ME: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

// Regular expressions - UPDATED (keeping both REGEX and REGEX_PATTERNS for compatibility)
export const REGEX = {
  EMAIL: REGEX_PATTERNS.EMAIL,
  PHONE: REGEX_PATTERNS.PHONE,
  PASSWORD_STRONG: REGEX_PATTERNS.PASSWORD_STRONG,
  PASSWORD_MEDIUM: REGEX_PATTERNS.PASSWORD_MEDIUM,
  PASSWORD_WEAK: REGEX_PATTERNS.PASSWORD_WEAK,
  ALPHA_NUMERIC: REGEX_PATTERNS.ALPHA_NUMERIC,
  ALPHA_ONLY: REGEX_PATTERNS.ALPHA_ONLY,
  NUMERIC_ONLY: REGEX_PATTERNS.NUMERIC_ONLY,
  PHONE_INDONESIA: REGEX_PATTERNS.PHONE_INDONESIA,
} as const;

// Password strength levels
export const PASSWORD_STRENGTH = {
  VERY_WEAK: 0,
  WEAK: 1,
  MEDIUM: 2,
  STRONG: 3,
  VERY_STRONG: 4,
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Export types for better TypeScript support
export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
export type RedirectRoute = typeof REDIRECT_ROUTES[keyof typeof REDIRECT_ROUTES];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type UserStatus = typeof USER_STATUSES[keyof typeof USER_STATUSES];
export type LoadingState = typeof LOADING_STATES[keyof typeof LOADING_STATES];
export type Theme = typeof THEMES[keyof typeof THEMES];
export type Language = typeof LANGUAGES[keyof typeof LANGUAGES];
export type PasswordStrengthLevel = typeof PASSWORD_STRENGTH[keyof typeof PASSWORD_STRENGTH];
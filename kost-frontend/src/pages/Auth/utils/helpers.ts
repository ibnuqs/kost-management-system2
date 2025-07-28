// pages/Auth/utils/helpers.ts
// Helper functions for Auth operations

import { User } from '../types/auth';
import { STORAGE_KEYS, REDIRECT_ROUTES } from './constants';

// Local Storage helpers
export const getStorageItem = (key: string): string | null => {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  } catch (error) {
    // Error reading from localStorage
    return null;
  }
};

export const setStorageItem = (key: string, value: string): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  } catch (error) {
    // Error writing to localStorage
  }
};

export const removeStorageItem = (key: string): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  } catch (error) {
    // Error removing from localStorage
  }
};

export const clearAuthStorage = (): void => {
  removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
  removeStorageItem(STORAGE_KEYS.USER_DATA);
  removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
  removeStorageItem(STORAGE_KEYS.REMEMBER_ME);
};

// NOTE: For production, rely on HTTPS for transport security
// localStorage data is base64 encoded for basic obfuscation only
// This is NOT secure encryption - it's just to prevent casual inspection

function simpleEncode(text: string): string {
  try {
    // Simple base64 encoding with character reversal for obfuscation
    return btoa(text.split('').reverse().join(''));
  } catch {
    return text; // fallback to plain text if encoding fails
  }
}

function simpleDecode(encodedText: string): string {
  try {
    const decoded = atob(encodedText);
    return decoded.split('').reverse().join('');
  } catch {
    return encodedText; // fallback if decoding fails
  }
}

// Token helpers with basic obfuscation
export const getAuthToken = (): string | null => {
  const encoded = getStorageItem(STORAGE_KEYS.AUTH_TOKEN);
  if (!encoded) return null;
  return simpleDecode(encoded);
};

export const setAuthToken = (token: string): void => {
  const encoded = simpleEncode(token);
  setStorageItem(STORAGE_KEYS.AUTH_TOKEN, encoded);
};

export const removeAuthToken = (): void => {
  removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
};

// User data helpers - FIXED
export const getUserData = (): User | null => {
  try {
    const encryptedUserData = getStorageItem(STORAGE_KEYS.USER_DATA);
    
    // Handle null, undefined, or invalid values
    if (!encryptedUserData || encryptedUserData === 'undefined' || encryptedUserData === 'null') {
      return null;
    }
    
    // Decode and parse JSON
    const decoded = simpleDecode(encryptedUserData);
    const parsed = JSON.parse(decoded);
    
    // Validate that it's an object with expected properties
    if (parsed && typeof parsed === 'object' && parsed.id) {
      return parsed as User;
    }
    
    // If not valid, clean up and return null
    removeStorageItem(STORAGE_KEYS.USER_DATA);
    return null;
    
  } catch (error) {
    // Error parsing user data - clean up corrupted data
    removeStorageItem(STORAGE_KEYS.USER_DATA);
    return null;
  }
};

export const setUserData = (user: User): void => {
  try {
    if (!user || typeof user !== 'object') {
      // Invalid user data provided
      return;
    }
    const encoded = simpleEncode(JSON.stringify(user));
    setStorageItem(STORAGE_KEYS.USER_DATA, encoded);
  } catch (error) {
    // Error storing user data
  }
};

export const removeUserData = (): void => {
  removeStorageItem(STORAGE_KEYS.USER_DATA);
};

// Auth state helpers
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  const userData = getUserData();
  return !!(token && userData);
};

export const isTokenExpired = (token: string): boolean => {
  try {
    if (!token || token.split('.').length !== 3) {
      return true;
    }
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    // Error checking token expiration - consider it expired
    return true;
  }
};

// Role helpers
export const hasRole = (user: User | null, role: string): boolean => {
  return user?.role === role;
};

export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, 'admin');
};

export const isTenant = (user: User | null): boolean => {
  return hasRole(user, 'tenant');
};

// Status helpers
export const isActiveUser = (user: User | null): boolean => {
  return user?.status === 'active';
};

export const isInactiveUser = (user: User | null): boolean => {
  return user?.status === 'inactive';
};

export const isSuspendedUser = (user: User | null): boolean => {
  return user?.status === 'suspended';
};

// Redirect helpers
export const getRedirectPath = (user: User | null, fallback: string = REDIRECT_ROUTES.DEFAULT): string => {
  if (!user) return fallback;
  
  switch (user.role) {
    case 'admin':
      return REDIRECT_ROUTES.ADMIN;
    case 'tenant':
      return REDIRECT_ROUTES.TENANT;
    default:
      return fallback;
  }
};

// Form helpers
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format based on length (assuming Indonesian phone numbers)
  if (digits.length >= 10) {
    return `+62 ${digits.slice(-10, -6)} ${digits.slice(-6, -3)} ${digits.slice(-3)}`;
  }
  
  return phone;
};

// Error handling helpers
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const isNetworkError = (error: any): boolean => {
  return !error.response && error.code !== 'ECONNABORTED';
};

// Debounce helper for form validation
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// URL helpers
export const getReturnUrl = (): string => {
  if (typeof window === 'undefined') return REDIRECT_ROUTES.DEFAULT;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('returnUrl') || REDIRECT_ROUTES.DEFAULT;
};

export const setReturnUrl = (url: string): void => {
  if (typeof window === 'undefined') return;
  
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set('returnUrl', url);
  window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
};

// Time helpers
export const formatLastLogin = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    // Error formatting date
    return 'Unknown';
  }
};

// Device helpers
export const getDeviceInfo = (): string => {
  if (typeof window === 'undefined') return 'Unknown Device';
  
  const userAgent = navigator.userAgent;
  
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    return 'Mobile Device';
  } else if (/Windows/.test(userAgent)) {
    return 'Windows';
  } else if (/Mac/.test(userAgent)) {
    return 'macOS';
  } else if (/Linux/.test(userAgent)) {
    return 'Linux';
  }
  
  return 'Unknown Device';
};

// Security helpers
export const generateNonce = (): string => {
  if (typeof window === 'undefined') return '';
  
  try {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    // Error generating nonce - use fallback
    return Math.random().toString(36).substring(2, 15);
  }
};

export const maskEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  
  const maskedName = name.length > 2 
    ? `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}`
    : `${name[0]}${'*'.repeat(name.length - 1)}`;
    
  return `${maskedName}@${domain}`;
};

// Safe JSON helpers
export const safeJSONParse = <T = any>(str: string, fallback: T | null = null): T | null => {
  try {
    if (!str || str === 'undefined' || str === 'null') {
      return fallback;
    }
    return JSON.parse(str);
  } catch (error) {
    // JSON parse error
    return fallback;
  }
};

export const safeJSONStringify = (obj: any, fallback: string = ''): string => {
  try {
    if (obj === null || obj === undefined) {
      return fallback;
    }
    return JSON.stringify(obj);
  } catch (error) {
    // JSON stringify error
    return fallback;
  }
};
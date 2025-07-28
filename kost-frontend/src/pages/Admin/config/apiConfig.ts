// File: src/pages/Admin/config/apiConfig.ts
export const API_CONFIG = {
  // Base configuration
  BASE_URL: import.meta.env.VITE_API_URL || 'https://148.230.96.228/api',
  TIMEOUT: 30000, // 30 seconds
  
  // Authentication
  AUTH: {
    TOKEN_KEY: 'auth_token',
    REFRESH_TOKEN_KEY: 'refresh_token',
    USER_KEY: 'user_data',
  },
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
    },
    
    // Admin endpoints
    ADMIN: {
      DASHBOARD: {
        STATS: '/admin/dashboard/stats',
        ACTIVITIES: '/admin/dashboard/activities',
        HEALTH: '/admin/dashboard/health',
        ANALYTICS: '/admin/dashboard/analytics',
      },
      
      PAYMENTS: {
        LIST: '/admin/payments',
        STATS: '/admin/payments/stats',
        GENERATE_MONTHLY: '/admin/payments/generate-monthly',
        SYNC_STATUS: (id: number) => `/admin/payments/${id}/sync-status`,
        EXPORT: '/admin/payments/export',
      },
      
      ROOMS: {
        LIST: '/admin/rooms',
        CREATE: '/admin/rooms',
        UPDATE: (id: number) => `/admin/rooms/${id}`,
        DELETE: (id: number) => `/admin/rooms/${id}`,
        ASSIGN_TENANT: (id: number) => `/admin/rooms/${id}/assign-tenant`,
        REMOVE_TENANT: (id: number) => `/admin/rooms/${id}/remove-tenant`,
      },
      
      TENANTS: {
        LIST: '/admin/tenants',
        CREATE: '/admin/tenants',
        UPDATE: (id: number) => `/admin/tenants/${id}`,
        DELETE: (id: number) => `/admin/tenants/${id}`,
        MOVE_OUT: (id: number) => `/admin/tenants/${id}/move-out`,
      },
      
      RFID: {
        CARDS: '/admin/rfid/cards',
        CREATE: '/admin/rfid/cards',
        REGISTER: '/admin/rfid/register-card',
        CHECK: (uid: string) => `/admin/rfid/check-card/${uid}`,
        UPDATE: (id: number) => `/admin/rfid/cards/${id}`,
        DELETE: (id: number) => `/admin/rfid/cards/${id}`,
        TOGGLE: (id: number) => `/admin/rfid/cards/${id}/toggle`,
        STATS: '/admin/rfid/stats',
        DASHBOARD_STATS: '/admin/rfid/dashboard-stats',
        ANALYTICS: '/admin/rfid/analytics',
        SCANNER: {
          START: '/admin/rfid/scanner/start',
          STOP: '/admin/rfid/scanner/stop',
        },
        FORM_DATA: {
          USERS: '/admin/rfid/users',
          TENANTS: '/admin/rfid/tenants',
          ROOMS: '/admin/rfid/rooms',
        },
      },
      
      IOT: {
        DEVICES: '/admin/iot-devices',
        CREATE: '/admin/iot-devices',
        UPDATE: (id: number) => `/admin/iot-devices/${id}`,
        DELETE: (id: number) => `/admin/iot-devices/${id}`,
        STATUS: (id: number) => `/admin/iot-devices/${id}/status`,
        EXPORT: (format: string) => `/admin/iot-devices/export/${format}`,
        ROOMS: '/admin/rooms',
      },
      
      ACCESS_LOGS: {
        LIST: '/admin/access-logs',
        STATS: '/admin/access-logs/stats',
        STATISTICS: '/admin/access-logs/statistics',
        EXPORT: '/admin/access-logs/export',
      },
    },
    
    // Public endpoints
    PUBLIC: {
      USERS: '/users',
      ROOMS: '/rooms',
    },
  },
  
  // Request configuration
  REQUESTS: {
    DEFAULT_HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    
    MULTIPART_HEADERS: {
      'Content-Type': 'multipart/form-data',
    },
    
    // Retry configuration
    RETRY: {
      ATTEMPTS: 3,
      DELAY: 1000, // 1 second
      BACKOFF: 2, // Exponential backoff multiplier
    },
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 15,
    MAX_PAGE_SIZE: 100,
    AVAILABLE_SIZES: [10, 15, 20, 25, 50, 100],
  },
  
  // File uploads
  UPLOADS: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: {
      IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
    },
  },
  
  // Cache configuration
  CACHE: {
    TTL: {
      SHORT: 5 * 60 * 1000, // 5 minutes
      MEDIUM: 30 * 60 * 1000, // 30 minutes
      LONG: 24 * 60 * 60 * 1000, // 24 hours
    },
    KEYS: {
      USER_DATA: 'user_data',
      DASHBOARD_STATS: 'dashboard_stats',
      MENU_CONFIG: 'menu_config',
    },
  },
  
  // Real-time configuration
  REALTIME: {
    WEBSOCKET_URL: import.meta.env.VITE_WS_URL || 'wss://148.230.96.228/ws',
    MQTT: {
      URL: 'wss://16d97e84c4364ffa9d0e5a0f0fa09165.s1.eu.hivemq.cloud:8884/mqtt',
      USERNAME: 'hivemq.webclient.1745310839638',
      PASSWORD: 'UXNM#Agehw3B8!4;>6tz',
      TOPICS: {
        RFID_TAGS: 'rfid/tags',
        RFID_COMMAND: 'rfid/command',
        SCANNER_STATUS: 'rfid/scanner/status',
        DOOR_CONTROL: 'door/control',
        DEVICE_STATUS: 'device/status',
      },
    },
  },
  
  // Development configuration
  DEV: {
    LOG_LEVEL: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    MOCK_RESPONSES: import.meta.env.VITE_WS_URL === 'true',
    DELAY_SIMULATION: 500, // Simulate network delay in ms
  },
  
  // Error messages
  ERRORS: {
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Authentication required. Please login again.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION: 'Please check your input and try again.',
    SERVER: 'Server error. Please try again later.',
    TIMEOUT: 'Request timeout. Please try again.',
    UNKNOWN: 'An unexpected error occurred.',
  },
  
  // Success messages
  SUCCESS: {
    CREATED: 'Successfully created',
    UPDATED: 'Successfully updated',
    DELETED: 'Successfully deleted',
    SAVED: 'Successfully saved',
    EXPORTED: 'Successfully exported',
    IMPORTED: 'Successfully imported',
  },
};

// Helper functions for API configuration
export const getEndpoint = (path: string, params?: Record<string, any>): string => {
  let endpoint = API_CONFIG.BASE_URL + path;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    const queryString = searchParams.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }
  }
  
  return endpoint;
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

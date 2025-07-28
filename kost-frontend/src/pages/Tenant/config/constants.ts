// File: src/pages/Tenant/config/constants.ts
export const TENANT_CONSTANTS = {
  // App info
  APP_NAME: 'MyKost',
  APP_SUBTITLE: 'Tenant Portal',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Refresh intervals (in milliseconds)
  DASHBOARD_REFRESH_INTERVAL: 30000, // 30 seconds
  PAYMENT_STATUS_CHECK_INTERVAL: 10000, // 10 seconds
  NOTIFICATION_CHECK_INTERVAL: 60000, // 1 minute
  
  // Auto-check settings
  PAYMENT_AUTO_CHECK_DELAY: 15000, // 15 seconds after payment
  PAYMENT_AUTO_CHECK_ATTEMPTS: 5,
  
  // UI constants
  MOBILE_BREAKPOINT: 768,
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 4000,
  
  // Status colors
  STATUS_COLORS: {
    success: 'text-green-600 bg-green-100',
    pending: 'text-yellow-600 bg-yellow-100',
    failed: 'text-red-600 bg-red-100',
    info: 'text-blue-600 bg-blue-100',
    warning: 'text-orange-600 bg-orange-100',
  },
  
  // Payment status mapping
  PAYMENT_STATUS_MAPPING: {
    paid: 'success',
    success: 'success',
    settlement: 'success',
    capture: 'success',
    pending: 'pending',
    authorize: 'pending',
    failed: 'failed',
    failure: 'failed',
    cancel: 'failed',
    deny: 'failed',
    expire: 'failed',
    cancelled: 'warning',
  },
  
  // Access status
  ACCESS_STATUS: {
    granted: 'success',
    denied: 'failed',
  },
  
  // Device status
  DEVICE_STATUS: {
    online: 'success',
    offline: 'failed',
    maintenance: 'warning',
  },
  
  // RFID card status
  RFID_STATUS: {
    active: 'success',
    inactive: 'warning',
    lost: 'failed',
    expired: 'failed',
  },
} as const;

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const ROUTES = {
  DASHBOARD: '/tenant',
  PAYMENTS: '/tenant/payments',
  ACCESS_HISTORY: '/tenant/access-history',
  PROFILE: '/tenant/profile',
  NOTIFICATIONS: '/tenant/notifications',
} as const;
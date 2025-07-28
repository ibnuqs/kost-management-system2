// ===== FIXED: src/pages/Tenant/utils/constants.ts =====

export const MOBILE_BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const RESPONSIVE_CLASSES = {
  // Grid responsive classes
  GRID_COLS_1: 'grid-cols-1',
  GRID_COLS_2: 'grid-cols-1 sm:grid-cols-2',
  GRID_COLS_3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  GRID_COLS_4: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
  
  // Flex responsive classes
  FLEX_COL: 'flex-col',
  FLEX_COL_SM_ROW: 'flex-col sm:flex-row',
  FLEX_COL_MD_ROW: 'flex-col md:flex-row',
  
  // Text responsive classes
  TEXT_SM_MD: 'text-sm md:text-base',
  TEXT_BASE_LG: 'text-base lg:text-lg',
  TEXT_LG_XL: 'text-lg xl:text-xl',
  
  // Spacing responsive classes
  PADDING_MOBILE: 'p-4 md:p-6',
  MARGIN_MOBILE: 'm-4 md:m-6',
  GAP_MOBILE: 'gap-4 md:gap-6',
  
  // Container responsive classes
  CONTAINER_MOBILE: 'max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl',
} as const;

export const ANIMATION_CLASSES = {
  // Fade animations
  FADE_IN: 'animate-fade-in',
  FADE_OUT: 'animate-fade-out',
  
  // Scale animations
  SCALE_IN: 'animate-scale-in',
  SCALE_OUT: 'animate-scale-out',
  
  // Slide animations
  SLIDE_UP: 'animate-slide-up',
  SLIDE_DOWN: 'animate-slide-down',
  SLIDE_LEFT: 'animate-slide-left',
  SLIDE_RIGHT: 'animate-slide-right',
  
  // Bounce animations
  BOUNCE: 'animate-bounce',
  PULSE: 'animate-pulse',
  SPIN: 'animate-spin',
  
  // Hover animations
  HOVER_SCALE: 'hover:scale-105 transition-transform duration-200',
  HOVER_SHADOW: 'hover:shadow-lg transition-shadow duration-200',
  HOVER_LIFT: 'hover:transform hover:-translate-y-1 transition-all duration-200',
} as const;

export const MOBILE_OPTIMIZED_CLASSES = {
  // Card classes optimized for mobile
  CARD_MOBILE: 'bg-white rounded-xl shadow-sm border p-4 sm:p-6 hover:shadow-md transition-all duration-200',
  CARD_COMPACT: 'bg-white rounded-lg shadow-sm border p-3 sm:p-4',
  
  // Button classes for mobile
  BUTTON_MOBILE: 'px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 min-h-[44px]',
  BUTTON_ICON_MOBILE: 'p-3 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px]',
  
  // Input classes for mobile
  INPUT_MOBILE: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]',
  
  // Navigation classes for mobile
  NAV_ITEM_MOBILE: 'flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 min-h-[56px]',
  
  // Modal classes for mobile
  MODAL_MOBILE: 'fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4',
  MODAL_CONTENT_MOBILE: 'bg-white rounded-t-xl sm:rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto',
  
  // Table responsive classes
  TABLE_MOBILE: 'hidden sm:table',
  TABLE_MOBILE_CARDS: 'block sm:hidden space-y-3',
} as const;

export const COLOR_SCHEMES = {
  // Status color schemes
  SUCCESS: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: 'text-green-600',
    button: 'bg-green-600 hover:bg-green-700 text-white',
  },
  WARNING: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: 'text-yellow-600',
    button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  },
  ERROR: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: 'text-red-600',
    button: 'bg-red-600 hover:bg-red-700 text-white',
  },
  INFO: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  NEUTRAL: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-800',
    icon: 'text-gray-600',
    button: 'bg-gray-600 hover:bg-gray-700 text-white',
  },
} as const;

export const TOUCH_TARGETS = {
  // Minimum touch target sizes (44px is iOS guideline)
  MIN_SIZE: 'min-w-[44px] min-h-[44px]',
  COMFORTABLE_SIZE: 'min-w-[48px] min-h-[48px]',
  LARGE_SIZE: 'min-w-[56px] min-h-[56px]',
} as const;

export const MOBILE_SPECIFIC = {
  // Safe area classes for mobile devices
  SAFE_AREA_TOP: 'pt-safe-top',
  SAFE_AREA_BOTTOM: 'pb-safe-bottom',
  
  // Mobile-specific spacing
  MOBILE_PADDING: 'px-4 py-4',
  MOBILE_MARGIN: 'mx-4 my-4',
  
  // Mobile navigation heights
  HEADER_HEIGHT: 'h-16',
  BOTTOM_NAV_HEIGHT: 'h-20',
  
  // Mobile scrolling
  SCROLL_SMOOTH: 'scroll-smooth',
  OVERFLOW_SCROLL: 'overflow-y-auto',
  
  // Mobile viewport
  FULL_HEIGHT: 'min-h-screen',
  VIEWPORT_HEIGHT: 'h-screen',
} as const;

export const LAYOUT_CONSTANTS = {
  // Sidebar widths
  SIDEBAR_WIDTH: 'w-64',
  SIDEBAR_COLLAPSED: 'w-16',
  
  // Main content spacing
  MAIN_PADDING: 'p-4 sm:p-6 pb-20 md:pb-6',
  
  // Z-index values
  Z_INDEX: {
    MODAL: 50,
    DROPDOWN: 40,
    HEADER: 30,
    SIDEBAR: 20,
    OVERLAY: 10,
  },
  
  // Transition durations
  TRANSITION: {
    FAST: 'duration-150',
    NORMAL: 'duration-200',
    SLOW: 'duration-300',
  },
} as const;

export const FORM_CONSTANTS = {
  // Input validation
  MIN_PASSWORD_LENGTH: 8,
  MAX_TEXT_LENGTH: 255,
  MAX_TEXTAREA_LENGTH: 1000,
  
  // Phone number patterns
  PHONE_PATTERN: /^(\+62|62|0)[0-9]{9,12}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // File upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;

export const API_CONSTANTS = {
  // Request timeouts
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  UPLOAD_TIMEOUT: 120000, // 2 minutes
  
  // Retry attempts
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Cache durations
  CACHE_DURATION: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 24 * 60 * 60 * 1000, // 24 hours
  },
} as const;

export const NOTIFICATION_CONSTANTS = {
  // Toast duration
  TOAST_DURATION: 4000,
  TOAST_SUCCESS_DURATION: 3000,
  TOAST_ERROR_DURATION: 6000,
  
  // Notification check intervals
  CHECK_INTERVAL: 60000, // 1 minute
  
  // Push notification settings - FIXED: Using proper env variable access
  VAPID_PUBLIC_KEY: (typeof window !== 'undefined' && window.ENV?.VAPID_PUBLIC_KEY) || 
                   (import.meta?.env?.VITE_VAPID_PUBLIC_KEY) || '',
} as const;

// Environment helper untuk mendapatkan environment variables dengan aman
export const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // Check Vite environment variables
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteKey = `VITE_${key}`;
    if (import.meta.env[viteKey]) {
      return import.meta.env[viteKey];
    }
  }
  
  // Check window.ENV (jika ada global config)
  if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
    return window.ENV[key];
  }
  
  // Check process.env dengan safe check
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  return defaultValue;
};

// App configuration dengan safe environment variable access
export const APP_CONFIG = {
  // API Configuration
  API_URL: getEnvVar('API_URL', 'https://148.230.96.228/api'),
  WS_URL: getEnvVar('WS_URL', 'wss://148.230.96.228/ws'),
  
  // Application settings
  APP_NAME: getEnvVar('APP_NAME', 'MyKost Tenant'),
  APP_VERSION: getEnvVar('APP_VERSION', '1.0.0'),
  
  // Feature flags
  ENABLE_PWA: getEnvVar('ENABLE_PWA', 'true') === 'true',
  ENABLE_NOTIFICATIONS: getEnvVar('ENABLE_NOTIFICATIONS', 'true') === 'true',
  ENABLE_ANALYTICS: getEnvVar('ENABLE_ANALYTICS', 'false') === 'true',
  
  // Development settings
  DEBUG_MODE: getEnvVar('NODE_ENV', 'development') === 'development',
  
  // External services
  VAPID_PUBLIC_KEY: getEnvVar('VAPID_PUBLIC_KEY', ''),
  GOOGLE_MAPS_API_KEY: getEnvVar('GOOGLE_MAPS_API_KEY', ''),
  ANALYTICS_ID: getEnvVar('ANALYTICS_ID', ''),
} as const;

// Type untuk window.ENV jika digunakan
declare global {
  interface Window {
    ENV?: Record<string, string>;
  }
}

// Ekspor semua constants
export default {
  MOBILE_BREAKPOINTS,
  RESPONSIVE_CLASSES,
  ANIMATION_CLASSES,
  MOBILE_OPTIMIZED_CLASSES,
  COLOR_SCHEMES,
  TOUCH_TARGETS,
  MOBILE_SPECIFIC,
  LAYOUT_CONSTANTS,
  FORM_CONSTANTS,
  API_CONSTANTS,
  NOTIFICATION_CONSTANTS,
  APP_CONFIG,
  getEnvVar,
};
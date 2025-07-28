// File: src/pages/Admin/utils/chartTheme.ts
export const chartTheme = {
  // Color palette untuk charts
  colors: {
    primary: '#3b82f6',      // Blue - untuk data utama
    success: '#10b981',      // Green - untuk success/paid/positive
    warning: '#f59e0b',      // Orange - untuk warning/pending
    danger: '#ef4444',       // Red - untuk error/overdue/negative
    info: '#8b5cf6',         // Purple - untuk info/secondary
    neutral: '#6b7280',      // Gray - untuk labels dan grid
    background: '#f8fafc',   // Light gray - untuk backgrounds
    
    // Gradient variants untuk backgrounds
    primaryLight: '#dbeafe', // Blue light
    successLight: '#d1fae5', // Green light
    warningLight: '#fef3c7', // Orange light
    dangerLight: '#fee2e2',  // Red light
    infoLight: '#ede9fe',    // Purple light
    neutralLight: '#f3f4f6', // Gray light
  },

  // Chart styling defaults
  chart: {
    borderRadius: '12px',
    padding: '24px',
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderWidth: '1px',
  },

  // Card styling untuk chart containers
  card: {
    borderRadius: '12px',
    padding: '24px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  },

  // Stat card styling
  statCard: {
    borderRadius: '8px',
    padding: '16px',
    borderWidth: '1px',
    shadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  },

  // Common chart properties
  chartDefaults: {
    grid: {
      strokeDasharray: '3 3',
      stroke: '#e5e7eb',
    },
    axis: {
      stroke: '#6b7280',
      fontSize: 12,
      tick: { fill: '#6b7280' },
    },
    tooltip: {
      backgroundColor: '#1f2937',
      textColor: '#ffffff',
      borderRadius: '8px',
      padding: '12px',
      border: 'none',
      shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    },
    legend: {
      fontSize: 12,
      color: '#6b7280',
    },
  },

  // Animation settings
  animation: {
    duration: 300,
    easing: 'ease-in-out',
  },

  // Responsive breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};

// Color schemes untuk berbagai jenis chart
export const chartColorSchemes = {
  // Untuk payment status (paid, pending, overdue)
  paymentStatus: [
    chartTheme.colors.success,  // paid
    chartTheme.colors.warning,  // pending
    chartTheme.colors.danger,   // overdue
  ],

  // Untuk access status (success, failed)
  accessStatus: [
    chartTheme.colors.success,  // success
    chartTheme.colors.danger,   // failed
  ],

  // Untuk revenue/financial data
  revenue: [
    chartTheme.colors.primary,
  ],

  // Untuk occupancy data
  occupancy: [
    chartTheme.colors.primary,  // occupied
    chartTheme.colors.neutral,  // available
  ],

  // Multi-category data (up to 8 colors)
  multiCategory: [
    chartTheme.colors.primary,
    chartTheme.colors.success,
    chartTheme.colors.warning,
    chartTheme.colors.danger,
    chartTheme.colors.info,
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#f97316', // Orange
  ],
};

// Helper functions untuk styling
export const getStatCardStyle = (type: 'success' | 'warning' | 'danger' | 'info' | 'neutral' = 'neutral') => {
  const baseStyle = `${chartTheme.statCard.borderRadius} p-4 border ${chartTheme.statCard.shadow}`;
  
  switch (type) {
    case 'success':
      return `${baseStyle} bg-green-50 border-green-200`;
    case 'warning':
      return `${baseStyle} bg-yellow-50 border-yellow-200`;
    case 'danger':
      return `${baseStyle} bg-red-50 border-red-200`;
    case 'info':
      return `${baseStyle} bg-blue-50 border-blue-200`;
    default:
      return `${baseStyle} bg-gray-50 border-gray-200`;
  }
};

export const getIconStyle = (type: 'success' | 'warning' | 'danger' | 'info' | 'neutral' = 'neutral') => {
  const baseStyle = 'p-3 rounded-lg';
  
  switch (type) {
    case 'success':
      return `${baseStyle} bg-green-500`;
    case 'warning':
      return `${baseStyle} bg-yellow-500`;
    case 'danger':
      return `${baseStyle} bg-red-500`;
    case 'info':
      return `${baseStyle} bg-blue-500`;
    default:
      return `${baseStyle} bg-gray-500`;
  }
};

export const getTextStyle = (type: 'success' | 'warning' | 'danger' | 'info' | 'neutral' = 'neutral', variant: 'light' | 'dark' = 'dark') => {
  switch (type) {
    case 'success':
      return variant === 'light' ? 'text-green-700' : 'text-green-900';
    case 'warning':
      return variant === 'light' ? 'text-yellow-700' : 'text-yellow-900';
    case 'danger':
      return variant === 'light' ? 'text-red-700' : 'text-red-900';
    case 'info':
      return variant === 'light' ? 'text-blue-700' : 'text-blue-900';
    default:
      return variant === 'light' ? 'text-gray-700' : 'text-gray-900';
  }
};

// Format helpers
export const formatCurrency = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)}Jt`;
  }
  if (value >= 1_000) {
    return `Rp ${(value / 1_000).toFixed(0)}K`;
  }
  return `Rp ${value.toLocaleString('id-ID')}`;
};

export const formatNumber = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return value.toLocaleString('id-ID');
};

export const formatPercentage = (value: number): string => {
  return `${Math.abs(value).toFixed(1)}%`;
};
// File: src/pages/Admin/utils/colorSystem.ts

export const ActionColors = {
  // Primary actions (main features)
  primary: {
    bg: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    text: 'text-white',
    border: 'border-blue-600',
    full: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
  },
  
  // Success/Positive actions (paid, confirmed, etc.)
  success: {
    bg: 'bg-green-600',
    hover: 'hover:bg-green-700', 
    text: 'text-white',
    border: 'border-green-600',
    full: 'bg-green-600 hover:bg-green-700 text-white border-green-600'
  },
  
  // Warning/Attention (pending, maintenance, etc.)
  warning: {
    bg: 'bg-yellow-500',
    hover: 'hover:bg-yellow-600',
    text: 'text-white', 
    border: 'border-yellow-500',
    full: 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500'
  },
  
  // Danger/Destructive (delete, overdue, etc.)
  danger: {
    bg: 'bg-red-600',
    hover: 'hover:bg-red-700',
    text: 'text-white',
    border: 'border-red-600', 
    full: 'bg-red-600 hover:bg-red-700 text-white border-red-600'
  },
  
  // Secondary/Neutral actions
  secondary: {
    bg: 'bg-gray-600',
    hover: 'hover:bg-gray-700',
    text: 'text-white',
    border: 'border-gray-300',
    full: 'bg-gray-600 hover:bg-gray-700 text-white border-gray-300'
  },
  
  // Ghost/Outline buttons
  ghost: {
    bg: 'bg-transparent',
    hover: 'hover:bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-300',
    full: 'bg-transparent hover:bg-gray-50 text-gray-700 border border-gray-300'
  }
};

export const StatusColors = {
  // Payment status
  paid: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    full: 'bg-green-100 text-green-800 border-green-200'
  },
  
  pending: {
    bg: 'bg-yellow-100', 
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    full: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  
  overdue: {
    bg: 'bg-red-100',
    text: 'text-red-800', 
    border: 'border-red-200',
    full: 'bg-red-100 text-red-800 border-red-200'
  },
  
  cancelled: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200', 
    full: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  
  // Room status
  occupied: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    full: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  
  available: {
    bg: 'bg-green-100',
    text: 'text-green-800', 
    border: 'border-green-200',
    full: 'bg-green-100 text-green-800 border-green-200'
  },
  
  maintenance: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    full: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  
  // Tenant status
  active: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200', 
    full: 'bg-green-100 text-green-800 border-green-200'
  },
  
  inactive: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    full: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  
  suspended: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    full: 'bg-red-100 text-red-800 border-red-200'
  }
};

// Helper functions
export const getActionColor = (variant: keyof typeof ActionColors) => {
  return ActionColors[variant] || ActionColors.secondary;
};

export const getStatusColor = (status: keyof typeof StatusColors) => {
  return StatusColors[status] || StatusColors.pending;
};

// Button component helper
export const getButtonClasses = (variant: keyof typeof ActionColors, size: 'sm' | 'md' | 'lg' = 'md') => {
  const colors = getActionColor(variant);
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm', 
    lg: 'px-6 py-3 text-base'
  };
  
  return `${colors.full} ${sizes[size]} rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`;
};

// Badge component helper  
export const getBadgeClasses = (status: keyof typeof StatusColors, size: 'sm' | 'md' = 'md') => {
  const colors = getStatusColor(status);
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm'
  };
  
  return `${colors.full} ${sizes[size]} rounded-full font-medium border`;
};
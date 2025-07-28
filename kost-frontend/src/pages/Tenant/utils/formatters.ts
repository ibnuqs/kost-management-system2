// File: src/pages/Tenant/utils/formatters.ts

/**
 * Format currency for Indonesian Rupiah
 */
export const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return 'Rp 0';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return 'Rp 0';
  
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  } catch (error) {
    console.warn('Error formatting currency:', error);
    return `Rp ${numAmount.toLocaleString('id-ID')}`;
  }
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined) return '0';
  
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(numValue)) return '0';
  
  try {
    return new Intl.NumberFormat('id-ID').format(numValue);
  } catch (error) {
    console.warn('Error formatting number:', error);
    return numValue.toString();
  }
};

/**
 * Format date in Indonesian locale
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'No date';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (!dateObj || isNaN(dateObj.getTime())) return 'Invalid Date';
    
    return dateObj.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date and time in Indonesian locale
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'No date';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (!dateObj || isNaN(dateObj.getTime())) return 'Invalid Date';
    
    return dateObj.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.warn('Error formatting datetime:', error);
    return 'Invalid Date';
  }
};

/**
 * Format time only
 */
export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'No time';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (!dateObj || isNaN(dateObj.getTime())) return 'Invalid Time';
    
    return dateObj.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.warn('Error formatting time:', error);
    return 'Invalid Time';
  }
};

/**
 * Format relative time (time ago) - SUPER SAFE VERSION
 */
export const formatTimeAgo = (date: string | Date | null | undefined): string => {
  // Handle all falsy values
  if (!date || date === null || date === undefined) {
    return 'Unknown time';
  }
  
  try {
    let dateObj: Date;
    
    // Handle string dates
    if (typeof date === 'string') {
      // Handle empty strings
      if (date.trim() === '') {
        return 'Unknown time';
      }
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    // Extra safety check for Date object
    if (!dateObj || !(dateObj instanceof Date)) {
      return 'Invalid date';
    }
    
    // Check if date is valid BEFORE calling getTime()
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 0) return 'In the future';
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    
    return formatDate(dateObj);
  } catch (error) {
    console.warn('Error formatting time ago for value:', date, 'Error:', error);
    return 'Unknown time';
  }
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone || typeof phone !== 'string') return 'No phone';
  
  try {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 0) return 'Invalid phone';
    
    // Check if it starts with country code
    if (cleaned.startsWith('62')) {
      // Indonesian number with country code
      if (cleaned.length >= 11) {
        return cleaned.replace(/^62(\d{3})(\d{4})(\d{4,})/, '+62 $1-$2-$3');
      }
    } else if (cleaned.startsWith('0')) {
      // Indonesian number without country code
      if (cleaned.length >= 10) {
        return cleaned.replace(/^0(\d{3})(\d{4})(\d{4,})/, '0$1-$2-$3');
      }
    }
    
    // Return cleaned number if format is not recognized
    return cleaned;
  } catch (error) {
    console.warn('Error formatting phone number:', error);
    return phone;
  }
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined || isNaN(bytes)) return '0 Bytes';
  
  try {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  } catch (error) {
    console.warn('Error formatting file size:', error);
    return '0 Bytes';
  }
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number | null | undefined, decimals: number = 1): string => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  
  try {
    return `${value.toFixed(decimals)}%`;
  } catch (error) {
    console.warn('Error formatting percentage:', error);
    return '0%';
  }
};

/**
 * Format card number (mask sensitive parts)
 */
export const formatCardNumber = (cardNumber: string | null | undefined): string => {
  if (!cardNumber || typeof cardNumber !== 'string') return '';
  
  try {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (cleaned.length <= 4) return cleaned;
    
    const lastFour = cleaned.slice(-4);
    const maskedPart = '*'.repeat(Math.max(0, cleaned.length - 4));
    
    return maskedPart + lastFour;
  } catch (error) {
    console.warn('Error formatting card number:', error);
    return cardNumber;
  }
};

/**
 * Format room number
 */
export const formatRoomNumber = (roomNumber: string | number | null | undefined): string => {
  if (roomNumber === null || roomNumber === undefined) return 'No room';
  
  try {
    return `Room ${roomNumber}`;
  } catch (error) {
    console.warn('Error formatting room number:', error);
    return `Room ${roomNumber}`;
  }
};

/**
 * Format duration in human readable format
 */
export const formatDuration = (seconds: number | null | undefined): string => {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return '0 seconds';
  
  try {
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    const days = Math.floor(seconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''}`;
  } catch (error) {
    console.warn('Error formatting duration:', error);
    return '0 seconds';
  }
};

/**
 * Format address (truncate if too long for mobile)
 */
export const formatAddress = (address: string | null | undefined, maxLength: number = 50): string => {
  if (!address || typeof address !== 'string') return '';
  
  try {
    if (address.length <= maxLength) return address;
    
    return address.substring(0, maxLength - 3) + '...';
  } catch (error) {
    console.warn('Error formatting address:', error);
    return address;
  }
};

/**
 * Format ID card number (mask middle digits)
 */
export const formatIdCard = (idCard: string | null | undefined): string => {
  if (!idCard || typeof idCard !== 'string') return '';
  
  try {
    if (idCard.length < 8) return idCard;
    
    const first = idCard.substring(0, 4);
    const last = idCard.substring(idCard.length - 4);
    const middle = '*'.repeat(idCard.length - 8);
    
    return `${first}${middle}${last}`;
  } catch (error) {
    console.warn('Error formatting ID card:', error);
    return idCard;
  }
};

/**
 * Format month-year for payment periods
 */
export const formatPaymentMonth = (month: string | null | undefined): string => {
  if (!month || typeof month !== 'string') return 'Unknown month';
  
  try {
    const date = new Date(month);
    
    if (isNaN(date.getTime())) return month;
    
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long'
    });
  } catch (error) {
    console.warn('Error formatting payment month:', error);
    return month;
  }
};

/**
 * Format compact number (1K, 1M, etc.)
 */
export const formatCompactNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  
  try {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
    
    return `${(num / 1000000000).toFixed(1)}B`;
  } catch (error) {
    console.warn('Error formatting compact number:', error);
    return num.toString();
  }
};

/**
 * Format boolean to Yes/No in Indonesian
 */
export const formatBoolean = (value: boolean | null | undefined): string => {
  if (value === null || value === undefined) return 'Tidak diketahui';
  
  return value ? 'Ya' : 'Tidak';
};

/**
 * Format text for mobile display (truncate with ellipsis)
 */
export const formatTextForMobile = (text: string | null | undefined, maxLength: number = 30): string => {
  if (!text || typeof text !== 'string') return '';
  
  try {
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength - 3) + '...';
  } catch (error) {
    console.warn('Error formatting text for mobile:', error);
    return text;
  }
};

/**
 * Get initials from name - FIXED VERSION
 */
export const getInitials = (name: string | null | undefined): string => {
  if (!name || typeof name !== 'string') return 'N/A';
  
  try {
    const names = name.trim().split(' ').filter(n => n.length > 0);
    
    if (names.length === 0) return 'N/A';
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  } catch (error) {
    console.warn('Error getting initials:', error);
    return 'N/A';
  }
};
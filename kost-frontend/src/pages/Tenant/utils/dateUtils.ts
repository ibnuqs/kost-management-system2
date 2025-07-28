// File: src/pages/Tenant/utils/dateUtils.ts

/**
 * Indonesian locale for date formatting
 */
const INDONESIAN_LOCALE = 'id-ID';

/**
 * Get current date in ISO format
 */
export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get current date and time in ISO format
 */
export const getCurrentDateTime = (): string => {
  return new Date().toISOString();
};

/**
 * Add days to a date
 */
export const addDays = (date: Date | string, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Add months to a date
 */
export const addMonths = (date: Date | string, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Add years to a date
 */
export const addYears = (date: Date | string, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

/**
 * Get difference in days between two dates
 */
export const getDaysDifference = (date1: Date | string, date2: Date | string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get difference in hours between two dates
 */
export const getHoursDifference = (date1: Date | string, date2: Date | string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60));
};

/**
 * Get difference in minutes between two dates
 */
export const getMinutesDifference = (date1: Date | string, date2: Date | string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60));
};

/**
 * Check if date is today
 */
export const isToday = (date: Date | string): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  
  return checkDate.getDate() === today.getDate() &&
         checkDate.getMonth() === today.getMonth() &&
         checkDate.getFullYear() === today.getFullYear();
};

/**
 * Check if date is yesterday
 */
export const isYesterday = (date: Date | string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const checkDate = new Date(date);
  
  return checkDate.getDate() === yesterday.getDate() &&
         checkDate.getMonth() === yesterday.getMonth() &&
         checkDate.getFullYear() === yesterday.getFullYear();
};

/**
 * Check if date is this week
 */
export const isThisWeek = (date: Date | string): boolean => {
  const now = new Date();
  const checkDate = new Date(date);
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return checkDate >= startOfWeek && checkDate <= endOfWeek;
};

/**
 * Check if date is this month
 */
export const isThisMonth = (date: Date | string): boolean => {
  const now = new Date();
  const checkDate = new Date(date);
  
  return checkDate.getMonth() === now.getMonth() &&
         checkDate.getFullYear() === now.getFullYear();
};

/**
 * Check if date is this year
 */
export const isThisYear = (date: Date | string): boolean => {
  const now = new Date();
  const checkDate = new Date(date);
  
  return checkDate.getFullYear() === now.getFullYear();
};

/**
 * Format date for mobile display (shorter format)
 */
export const formatDateForMobile = (date: Date | string): string => {
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return `Today, ${dateObj.toLocaleTimeString(INDONESIAN_LOCALE, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday, ${dateObj.toLocaleTimeString(INDONESIAN_LOCALE, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })}`;
  }
  
  if (isThisWeek(dateObj)) {
    return dateObj.toLocaleDateString(INDONESIAN_LOCALE, {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
  
  return dateObj.toLocaleDateString(INDONESIAN_LOCALE, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Get start of day
 */
export const getStartOfDay = (date: Date | string): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Get end of day
 */
export const getEndOfDay = (date: Date | string): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Get start of week (Monday)
 */
export const getStartOfWeek = (date: Date | string): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Get end of week (Sunday)
 */
export const getEndOfWeek = (date: Date | string): Date => {
  const result = getStartOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Get start of month
 */
export const getStartOfMonth = (date: Date | string): Date => {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Get end of month
 */
export const getEndOfMonth = (date: Date | string): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Get start of year
 */
export const getStartOfYear = (date: Date | string): Date => {
  const result = new Date(date);
  result.setMonth(0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Get end of year
 */
export const getEndOfYear = (date: Date | string): Date => {
  const result = new Date(date);
  result.setMonth(11, 31);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Format date range for display
 */
export const formatDateRange = (startDate: Date | string, endDate: Date | string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Same day
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString(INDONESIAN_LOCALE, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
  
  // Same month
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()} - ${end.toLocaleDateString(INDONESIAN_LOCALE, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })}`;
  }
  
  // Different months
  return `${start.toLocaleDateString(INDONESIAN_LOCALE, {
    day: 'numeric',
    month: 'short'
  })} - ${end.toLocaleDateString(INDONESIAN_LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })}`;
};

/**
 * Get months between two dates
 */
export const getMonthsBetween = (startDate: Date | string, endDate: Date | string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  
  return yearDiff * 12 + monthDiff;
};

/**
 * Get age from birth date
 */
export const getAge = (birthDate: Date | string): number => {
  const birth = new Date(birthDate);
  const now = new Date();
  
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Format relative time with more granular control
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 0) return 'In the future';
  if (diffInSeconds < 30) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

/**
 * Check if date is in the past
 */
export const isPast = (date: Date | string): boolean => {
  return new Date(date) < new Date();
};

/**
 * Check if date is in the future
 */
export const isFuture = (date: Date | string): boolean => {
  return new Date(date) > new Date();
};

/**
 * Check if date is a weekend
 */
export const isWeekend = (date: Date | string): boolean => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

/**
 * Check if date is a weekday
 */
export const isWeekday = (date: Date | string): boolean => {
  return !isWeekend(date);
};

/**
 * Get next weekday
 */
export const getNextWeekday = (date: Date | string): Date => {
  const result = new Date(date);
  
  do {
    result.setDate(result.getDate() + 1);
  } while (isWeekend(result));
  
  return result;
};

/**
 * Get previous weekday
 */
export const getPreviousWeekday = (date: Date | string): Date => {
  const result = new Date(date);
  
  do {
    result.setDate(result.getDate() - 1);
  } while (isWeekend(result));
  
  return result;
};

/**
 * Format time for mobile (shorter format)
 */
export const formatTimeForMobile = (date: Date | string): string => {
  const dateObj = new Date(date);
  
  return dateObj.toLocaleTimeString(INDONESIAN_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Get quarter of the year
 */
export const getQuarter = (date: Date | string): number => {
  const month = new Date(date).getMonth();
  return Math.floor(month / 3) + 1;
};

/**
 * Get days in month
 */
export const getDaysInMonth = (date: Date | string): number => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
};

/**
 * Get week of year (ISO week)
 */
export const getWeekOfYear = (date: Date | string): number => {
  const d = new Date(date);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekStart = getStartOfWeek(yearStart);
  
  if (yearStart.getDay() !== 1) {
    weekStart.setDate(weekStart.getDate() + 7);
  }
  
  if (d < weekStart) {
    return getWeekOfYear(new Date(d.getFullYear() - 1, 11, 31));
  }
  
  const weekNumber = Math.floor((d.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
  
  if (weekNumber > 52) {
    const nextYearStart = new Date(d.getFullYear() + 1, 0, 1);
    if (nextYearStart.getDay() <= 4) {
      return 1;
    }
  }
  
  return weekNumber;
};

/**
 * Parse Indonesian date string
 */
export const parseIndonesianDate = (dateString: string): Date | null => {
  try {
    // Try standard formats first
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try Indonesian format (dd/mm/yyyy)
    const indonesianPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateString.match(indonesianPattern);
    
    if (match) {
      const [, day, month, year] = match;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    return null;
  } catch {
    return null;
  }
};

/**
 * Format duration in human-readable format
 */
export const formatDuration = (startDate: Date | string, endDate: Date | string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months`;
  
  return `${Math.floor(diffInSeconds / 31536000)} years`;
};

/**
 * Get business days between two dates (excluding weekends)
 */
export const getBusinessDays = (startDate: Date | string, endDate: Date | string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  
  const current = new Date(start);
  while (current <= end) {
    if (isWeekday(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

/**
 * Create date picker format for HTML input
 */
export const toDateInputFormat = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Create datetime picker format for HTML input
 */
export const toDateTimeInputFormat = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
};

/**
 * Get timezone offset in hours
 */
export const getTimezoneOffset = (): number => {
  return -new Date().getTimezoneOffset() / 60;
};

/**
 * Convert to user's timezone
 */
export const toUserTimezone = (date: Date | string): Date => {
  const d = new Date(date);
  const offset = getTimezoneOffset();
  return new Date(d.getTime() + (offset * 60 * 60 * 1000));
};
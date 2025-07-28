// File: src/pages/Admin/utils/formatters.ts
export const formatCurrency = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return 'Rp 0';
  
  if (numAmount >= 1_000_000_000) {
    return `Rp ${(numAmount / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
  }
  if (numAmount >= 1_000_000) {
    return `Rp ${(numAmount / 1_000_000).toFixed(1).replace('.', ',')} Jt`;
  }
  if (numAmount >= 1_000) {
    return `Rp ${(numAmount / 1_000).toFixed(0)} Rb`;
  }
  return `Rp ${numAmount.toLocaleString('id-ID')}`;
};

// For full currency display (no abbreviations)
export const formatCurrencyFull = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return 'Rp 0';
  
  return `Rp ${numAmount.toLocaleString('id-ID')}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (isNaN(date.getTime())) {
      return dateString;
    }

    if (seconds < 60) return `${seconds} detik lalu`;
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days === 1) return `Kemarin`;
    if (days < 7) return `${days} hari lalu`;
    return date.toLocaleDateString('id-ID');
  } catch (error) {
    return dateString;
  }
};

export const formatMonth = (monthString: string): string => {
  return new Date(monthString + '-01').toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long'
  });
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};
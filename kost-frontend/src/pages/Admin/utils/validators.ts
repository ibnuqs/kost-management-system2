// File: src/pages/Admin/utils/validators.ts
export const validateRequired = (value: any): string | null => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return 'This field is required';
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return null; // Phone is usually optional
  const phoneRegex = /^(\+62|62|0)[\d\s-]{9,13}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'Please enter a valid Indonesian phone number';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  // if (!/(?=.*[a-z])/.test(password)) {
  //   return 'Password must contain at least one lowercase letter';
  // }
  // if (!/(?=.*[A-Z])/.test(password)) {
  //   return 'Password must contain at least one uppercase letter';
  // }
  // if (!/(?=.*\d)/.test(password)) {
  //   return 'Password must contain at least one number';
  // }
  return null;
};

export const validatePasswordConfirmation = (password: string, confirmation: string): string | null => {
  if (!confirmation) return 'Password confirmation is required';
  if (password !== confirmation) {
    return 'Passwords do not match';
  }
  return null;
};

export const validateAmount = (amount: string | number): string | null => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount) || numAmount <= 0) {
    return 'Please enter a valid amount';
  }
  if (numAmount > 100000000) { // 100 million limit
    return 'Amount is too large';
  }
  return null;
};

export const validateDate = (date: string): string | null => {
  if (!date) return 'Date is required';
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Please enter a valid date';
  }
  return null;
};

export const validateDateRange = (startDate: string, endDate: string): { startDate?: string; endDate?: string } => {
  const errors: { startDate?: string; endDate?: string } = {};
  
  const startDateError = validateDate(startDate);
  const endDateError = validateDate(endDate);
  
  if (startDateError) errors.startDate = startDateError;
  if (endDateError) errors.endDate = endDateError;
  
  if (!startDateError && !endDateError) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      errors.endDate = 'End date must be after start date';
    }
  }
  
  return errors;
};

export const validateRfidUid = (uid: string): string | null => {
  if (!uid) return 'RFID UID is required';
  if (uid.length < 4) {
    return 'RFID UID must be at least 4 characters long';
  }
  if (uid.length > 50) {
    return 'RFID UID is too long';
  }
  // Allow alphanumeric and some special characters
  if (!/^[a-zA-Z0-9\-_:]+$/.test(uid)) {
    return 'RFID UID contains invalid characters';
  }
  return null;
};

export const validateRoomNumber = (roomNumber: string): string | null => {
  if (!roomNumber) return 'Room number is required';
  if (roomNumber.length < 1) {
    return 'Room number cannot be empty';
  }
  if (roomNumber.length > 20) {
    return 'Room number is too long';
  }
  // Allow alphanumeric, spaces, and common symbols
  if (!/^[a-zA-Z0-9\s\-_.]+$/.test(roomNumber)) {
    return 'Room number contains invalid characters';
  }
  return null;
};

export const validateDeviceId = (deviceId: string): string | null => {
  if (!deviceId) return 'Device ID is required';
  if (deviceId.length < 3) {
    return 'Device ID must be at least 3 characters long';
  }
  if (deviceId.length > 50) {
    return 'Device ID is too long';
  }
  // Allow alphanumeric, underscore, hyphen
  if (!/^[a-zA-Z0-9\-_]+$/.test(deviceId)) {
    return 'Device ID can only contain letters, numbers, hyphens, and underscores';
  }
  return null;
};

export const validatePositiveInteger = (value: string | number, fieldName: string = 'Value'): string | null => {
  const numValue = typeof value === 'string' ? parseInt(value) : value;
  if (isNaN(numValue) || numValue <= 0 || !Number.isInteger(numValue)) {
    return `${fieldName} must be a positive integer`;
  }
  return null;
};

export const validateUrl = (url: string): string | null => {
  if (!url) return null; // URL is usually optional
  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};

export const validateJsonString = (jsonString: string): string | null => {
  if (!jsonString.trim()) return null; // JSON is usually optional
  try {
    JSON.parse(jsonString);
    return null;
  } catch {
    return 'Please enter valid JSON';
  }
};

// Comprehensive form validation
export const validateForm = (data: Record<string, any>, rules: Record<string, Array<(value: any) => string | null>>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];
    
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return errors;
};
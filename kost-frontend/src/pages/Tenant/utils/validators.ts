// File: src/pages/Tenant/utils/validators.ts

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validate email address
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

/**
 * Validate password
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true };
};

/**
 * Validate Indonesian phone number
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  // Check Indonesian phone number patterns
  const indonesianPhoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  
  if (!indonesianPhoneRegex.test(phone.replace(/\s|-/g, ''))) {
    return { isValid: false, message: 'Please enter a valid Indonesian phone number' };
  }
  
  return { isValid: true };
};

/**
 * Validate name
 */
export const validateName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, message: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, message: 'Name must not exceed 50 characters' };
  }
  
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return { isValid: false, message: 'Name must contain only letters and spaces' };
  }
  
  return { isValid: true };
};

/**
 * Validate Indonesian ID card number (KTP)
 */
export const validateIdCard = (idCard: string): ValidationResult => {
  if (!idCard) {
    return { isValid: false, message: 'ID card number is required' };
  }
  
  // Remove all non-digits
  const cleaned = idCard.replace(/\D/g, '');
  
  if (cleaned.length !== 16) {
    return { isValid: false, message: 'ID card number must be 16 digits' };
  }
  
  if (!/^\d{16}$/.test(cleaned)) {
    return { isValid: false, message: 'ID card number must contain only digits' };
  }
  
  return { isValid: true };
};

/**
 * Validate required field
 */
export const validateRequired = (value: unknown, fieldName: string): ValidationResult => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  return { isValid: true };
};

/**
 * Validate number range
 */
export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult => {
  if (isNaN(value)) {
    return { isValid: false, message: `${fieldName} must be a valid number` };
  }
  
  if (value < min) {
    return { isValid: false, message: `${fieldName} must be at least ${min}` };
  }
  
  if (value > max) {
    return { isValid: false, message: `${fieldName} must not exceed ${max}` };
  }
  
  return { isValid: true };
};

/**
 * Validate text length
 */
export const validateTextLength = (
  text: string,
  minLength: number,
  maxLength: number,
  fieldName: string
): ValidationResult => {
  if (!text) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  if (text.length < minLength) {
    return { isValid: false, message: `${fieldName} must be at least ${minLength} characters` };
  }
  
  if (text.length > maxLength) {
    return { isValid: false, message: `${fieldName} must not exceed ${maxLength} characters` };
  }
  
  return { isValid: true };
};

/**
 * Validate file upload
 */
export const validateFile = (
  file: File,
  allowedTypes: string[],
  maxSize: number
): ValidationResult => {
  if (!file) {
    return { isValid: false, message: 'File is required' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return { 
      isValid: false, 
      message: `File size must not exceed ${maxSizeMB}MB` 
    };
  }
  
  return { isValid: true };
};

/**
 * Validate URL
 */
export const validateUrl = (url: string): ValidationResult => {
  if (!url) {
    return { isValid: false, message: 'URL is required' };
  }
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Please enter a valid URL' };
  }
};

/**
 * Validate date
 */
export const validateDate = (dateString: string): ValidationResult => {
  if (!dateString) {
    return { isValid: false, message: 'Date is required' };
  }
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return { isValid: false, message: 'Please enter a valid date' };
  }
  
  return { isValid: true };
};

/**
 * Validate future date
 */
export const validateFutureDate = (dateString: string): ValidationResult => {
  const dateValidation = validateDate(dateString);
  if (!dateValidation.isValid) {
    return dateValidation;
  }
  
  const date = new Date(dateString);
  const now = new Date();
  
  if (date <= now) {
    return { isValid: false, message: 'Date must be in the future' };
  }
  
  return { isValid: true };
};

/**
 * Validate past date
 */
export const validatePastDate = (dateString: string): ValidationResult => {
  const dateValidation = validateDate(dateString);
  if (!dateValidation.isValid) {
    return dateValidation;
  }
  
  const date = new Date(dateString);
  const now = new Date();
  
  if (date >= now) {
    return { isValid: false, message: 'Date must be in the past' };
  }
  
  return { isValid: true };
};

/**
 * Validate age (minimum age requirement)
 */
export const validateAge = (birthDate: string, minimumAge: number): ValidationResult => {
  const dateValidation = validateDate(birthDate);
  if (!dateValidation.isValid) {
    return dateValidation;
  }
  
  const birth = new Date(birthDate);
  const now = new Date();
  const age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  
  const actualAge = monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate()) 
    ? age - 1 
    : age;
  
  if (actualAge < minimumAge) {
    return { isValid: false, message: `Must be at least ${minimumAge} years old` };
  }
  
  return { isValid: true };
};

/**
 * Validate amount (monetary value)
 */
export const validateAmount = (amount: number): ValidationResult => {
  if (isNaN(amount) || amount <= 0) {
    return { isValid: false, message: 'Amount must be a positive number' };
  }
  
  if (amount > 999999999) {
    return { isValid: false, message: 'Amount is too large' };
  }
  
  return { isValid: true };
};

/**
 * Validate RFID card UID
 */
export const validateRfidUid = (uid: string): ValidationResult => {
  if (!uid) {
    return { isValid: false, message: 'RFID UID is required' };
  }
  
  // Typical RFID UID format (8 or 10 hex characters)
  if (!/^[0-9A-Fa-f]{8,10}$/.test(uid)) {
    return { isValid: false, message: 'Invalid RFID UID format' };
  }
  
  return { isValid: true };
};

/**
 * Validate form object
 */
export const validateForm = (
  data: Record<string, unknown>,
  rules: Record<string, (value: unknown) => ValidationResult>
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let isValid = true;
  
  Object.entries(rules).forEach(([field, validator]) => {
    const result = validator(data[field]);
    if (!result.isValid) {
      errors[field] = result.message || 'Invalid value';
      isValid = false;
    }
  });
  
  return { isValid, errors };
};

/**
 * Create a validator that checks multiple conditions
 */
export const createValidator = (
  validators: ((value: unknown) => ValidationResult)[]
) => {
  return (value: unknown): ValidationResult => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true };
  };
};

/**
 * Validate confirm password
 */
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }
  
  return { isValid: true };
};
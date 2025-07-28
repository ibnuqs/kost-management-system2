// pages/Auth/utils/validators.ts
// Validation functions for Auth forms

import { 
  VALIDATION_MESSAGES, 
  PASSWORD_REQUIREMENTS, 
  REGEX_PATTERNS 
} from './constants';

export const validateEmail = (email: string): string | null => {
  if (!email) {
    return VALIDATION_MESSAGES.EMAIL_REQUIRED;
  }
  
  if (!REGEX_PATTERNS.EMAIL.test(email)) {
    return VALIDATION_MESSAGES.EMAIL_INVALID;
  }
  
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return VALIDATION_MESSAGES.PASSWORD_REQUIRED;
  }
  
  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    return VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH;
  }
  
  if (password.length > PASSWORD_REQUIREMENTS.MAX_LENGTH) {
    return VALIDATION_MESSAGES.PASSWORD_MAX_LENGTH;
  }
  
  if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !REGEX_PATTERNS.PASSWORD_UPPERCASE.test(password)) {
    return VALIDATION_MESSAGES.PASSWORD_UPPERCASE;
  }
  
  if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !REGEX_PATTERNS.PASSWORD_LOWERCASE.test(password)) {
    return VALIDATION_MESSAGES.PASSWORD_LOWERCASE;
  }
  
  if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBERS && !REGEX_PATTERNS.PASSWORD_NUMBERS.test(password)) {
    return VALIDATION_MESSAGES.PASSWORD_NUMBERS;
  }
  
  if (PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL_CHARS && !REGEX_PATTERNS.PASSWORD_SPECIAL_CHARS.test(password)) {
    return VALIDATION_MESSAGES.PASSWORD_SPECIAL_CHARS;
  }
  
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  
  if (password !== confirmPassword) {
    return VALIDATION_MESSAGES.PASSWORD_MISMATCH;
  }
  
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name) {
    return VALIDATION_MESSAGES.NAME_REQUIRED;
  }
  
  if (name.trim().length < 2) {
    return VALIDATION_MESSAGES.NAME_MIN_LENGTH;
  }
  
  if (!REGEX_PATTERNS.NAME.test(name.trim())) {
    return 'Name can only contain letters and spaces';
  }
  
  return null;
};

export const validatePhone = (phone?: string): string | null => {
  if (!phone) {
    return null; // Phone is optional
  }
  
  if (!REGEX_PATTERNS.PHONE.test(phone)) {
    return VALIDATION_MESSAGES.PHONE_INVALID;
  }
  
  return null;
};

export const validateTerms = (accepted: boolean): string | null => {
  if (!accepted) {
    return VALIDATION_MESSAGES.TERMS_REQUIRED;
  }
  
  return null;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  
  return null;
};

// Password strength calculation
export const calculatePasswordStrength = (password: string) => {
  if (!password) {
    return {
      score: 0,
      checks: {
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumbers: false,
        hasSpecialChars: false
      },
      feedback: []
    };
  }

  const checks = {
    minLength: password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH,
    hasUppercase: REGEX_PATTERNS.PASSWORD_UPPERCASE.test(password),
    hasLowercase: REGEX_PATTERNS.PASSWORD_LOWERCASE.test(password),
    hasNumbers: REGEX_PATTERNS.PASSWORD_NUMBERS.test(password),
    hasSpecialChars: REGEX_PATTERNS.PASSWORD_SPECIAL_CHARS.test(password)
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;
  const score = passedChecks / totalChecks;

  const feedback: string[] = [];
  
  if (!checks.minLength) {
    feedback.push(`Use at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`);
  }
  
  if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !checks.hasUppercase) {
    feedback.push('Add uppercase letters');
  }
  
  if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !checks.hasLowercase) {
    feedback.push('Add lowercase letters');
  }
  
  if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBERS && !checks.hasNumbers) {
    feedback.push('Add numbers');
  }
  
  if (PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL_CHARS && !checks.hasSpecialChars) {
    feedback.push('Add special characters');
  }

  return {
    score,
    checks,
    feedback
  };
};

// Generic form validation
export const validateForm = <T extends Record<string, any>>(
  values: T,
  rules: Record<keyof T, (value: any) => string | null>
): Record<keyof T, string> => {
  const errors: Record<keyof T, string> = {} as Record<keyof T, string>;
  
  Object.keys(rules).forEach((key) => {
    const fieldKey = key as keyof T;
    const validator = rules[fieldKey];
    const error = validator(values[fieldKey]);
    
    if (error) {
      errors[fieldKey] = error;
    }
  });
  
  return errors;
};

// Email domain validation (optional, for corporate email restrictions)
export const validateEmailDomain = (email: string, allowedDomains: string[] = []): string | null => {
  if (allowedDomains.length === 0) {
    return null; // No domain restrictions
  }
  
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain || !allowedDomains.includes(domain)) {
    return `Email domain must be one of: ${allowedDomains.join(', ')}`;
  }
  
  return null;
};

// Validation helpers
export const isValidEmail = (email: string): boolean => {
  return validateEmail(email) === null;
};

export const isValidPassword = (password: string): boolean => {
  return validatePassword(password) === null;
};

export const isValidName = (name: string): boolean => {
  return validateName(name) === null;
};

export const isValidPhone = (phone: string): boolean => {
  return validatePhone(phone) === null;
};
// src/utils/validation.ts - Comprehensive Form Validation
import React, { useState, useCallback } from 'react';
import { ValidationError } from './errorHandler';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  firstError?: string;
}

export class Validator {
  private static emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static phonePattern = /^(\+62|62|0)[0-9]{9,13}$/;
  private static strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

  public static validate(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
    const errors: Record<string, string> = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      const error = this.validateField(value, rules, field);
      
      if (error) {
        errors[field] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      firstError: Object.values(errors)[0],
    };
  }

  public static validateField(value: any, rules: ValidationRule, fieldName: string): string | null {
    // Required validation
    if (rules.required && this.isEmpty(value)) {
      return rules.message || `${this.humanizeFieldName(fieldName)} is required`;
    }

    // Skip other validations if field is empty and not required
    if (this.isEmpty(value) && !rules.required) {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      // Min length
      if (rules.minLength && value.length < rules.minLength) {
        return rules.message || `${this.humanizeFieldName(fieldName)} must be at least ${rules.minLength} characters`;
      }

      // Max length
      if (rules.maxLength && value.length > rules.maxLength) {
        return rules.message || `${this.humanizeFieldName(fieldName)} must not exceed ${rules.maxLength} characters`;
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        return rules.message || `${this.humanizeFieldName(fieldName)} format is invalid`;
      }
    }

    // Number validations
    if (typeof value === 'number') {
      // Min value
      if (rules.min !== undefined && value < rules.min) {
        return rules.message || `${this.humanizeFieldName(fieldName)} must be at least ${rules.min}`;
      }

      // Max value
      if (rules.max !== undefined && value > rules.max) {
        return rules.message || `${this.humanizeFieldName(fieldName)} must not exceed ${rules.max}`;
      }
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }

  private static isEmpty(value: any): boolean {
    return value === null || 
           value === undefined || 
           value === '' || 
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'object' && Object.keys(value).length === 0);
  }

  private static humanizeFieldName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ');
  }

  // Common validation rules
  public static rules = {
    required: (message?: string): ValidationRule => ({
      required: true,
      message,
    }),

    email: (message?: string): ValidationRule => ({
      pattern: this.emailPattern,
      message: message || 'Please enter a valid email address',
    }),

    phone: (message?: string): ValidationRule => ({
      pattern: this.phonePattern,
      message: message || 'Please enter a valid Indonesian phone number',
    }),

    minLength: (length: number, message?: string): ValidationRule => ({
      minLength: length,
      message,
    }),

    maxLength: (length: number, message?: string): ValidationRule => ({
      maxLength: length,
      message,
    }),

    min: (value: number, message?: string): ValidationRule => ({
      min: value,
      message,
    }),

    max: (value: number, message?: string): ValidationRule => ({
      max: value,
      message,
    }),

    password: (message?: string): ValidationRule => ({
      minLength: 8,
      message: message || 'Password must be at least 8 characters long',
    }),

    strongPassword: (message?: string): ValidationRule => ({
      pattern: this.strongPasswordPattern,
      minLength: 8,
      message: message || 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character',
    }),

    confirmPassword: (passwordField: string = 'password', message?: string): ValidationRule => ({
      custom: (value: any, data?: Record<string, any>) => {
        if (data && value !== data[passwordField]) {
          return message || 'Passwords do not match';
        }
        return null;
      },
    }),

    numeric: (message?: string): ValidationRule => ({
      pattern: /^\d+$/,
      message: message || 'Please enter numbers only',
    }),

    alphanumeric: (message?: string): ValidationRule => ({
      pattern: /^[a-zA-Z0-9]+$/,
      message: message || 'Please enter letters and numbers only',
    }),

    url: (message?: string): ValidationRule => ({
      pattern: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
      message: message || 'Please enter a valid URL',
    }),

    date: (message?: string): ValidationRule => ({
      custom: (value: any) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return message || 'Please enter a valid date';
        }
        return null;
      },
    }),

    futureDate: (message?: string): ValidationRule => ({
      custom: (value: any) => {
        const date = new Date(value);
        const now = new Date();
        if (date <= now) {
          return message || 'Date must be in the future';
        }
        return null;
      },
    }),

    pastDate: (message?: string): ValidationRule => ({
      custom: (value: any) => {
        const date = new Date(value);
        const now = new Date();
        if (date >= now) {
          return message || 'Date must be in the past';
        }
        return null;
      },
    }),
  };
}

// Predefined validation schemas
export const authSchemas = {
  login: {
    email: {
      ...Validator.rules.required(),
      ...Validator.rules.email(),
    },
    password: {
      ...Validator.rules.required(),
    },
  },

  register: {
    name: {
      ...Validator.rules.required(),
      ...Validator.rules.minLength(2),
      ...Validator.rules.maxLength(100),
    },
    email: {
      ...Validator.rules.required(),
      ...Validator.rules.email(),
    },
    phone: {
      ...Validator.rules.required(),
      ...Validator.rules.phone(),
    },
    password: {
      ...Validator.rules.required(),
      ...Validator.rules.password(),
    },
    password_confirmation: {
      ...Validator.rules.required(),
      ...Validator.rules.confirmPassword(),
    },
  },

  forgotPassword: {
    email: {
      ...Validator.rules.required(),
      ...Validator.rules.email(),
    },
  },

  resetPassword: {
    password: {
      ...Validator.rules.required(),
      ...Validator.rules.password(),
    },
    password_confirmation: {
      ...Validator.rules.required(),
      ...Validator.rules.confirmPassword(),
    },
  },

  changePassword: {
    current_password: {
      ...Validator.rules.required(),
    },
    password: {
      ...Validator.rules.required(),
      ...Validator.rules.password(),
    },
    password_confirmation: {
      ...Validator.rules.required(),
      ...Validator.rules.confirmPassword(),
    },
  },
};

export const tenantSchemas = {
  create: {
    user_id: {
      ...Validator.rules.required(),
      ...Validator.rules.numeric(),
    },
    room_id: {
      ...Validator.rules.required(),
      ...Validator.rules.numeric(),
    },
    start_date: {
      ...Validator.rules.required(),
      ...Validator.rules.date(),
    },
    monthly_rent: {
      ...Validator.rules.required(),
      ...Validator.rules.min(0),
    },
    deposit: {
      ...Validator.rules.required(),
      ...Validator.rules.min(0),
    },
  },
};

export const roomSchemas = {
  create: {
    room_number: {
      ...Validator.rules.required(),
      ...Validator.rules.maxLength(10),
    },
    floor: {
      ...Validator.rules.required(),
      ...Validator.rules.numeric(),
      ...Validator.rules.min(1),
    },
    monthly_rent: {
      ...Validator.rules.required(),
      ...Validator.rules.min(0),
    },
  },
};

// React hook for form validation
export const useFormValidation = (schema: ValidationSchema) => {
  const validate = (data: Record<string, any>): ValidationResult => {
    return Validator.validate(data, schema);
  };

  const validateField = (fieldName: string, value: any): string | null => {
    const rules = schema[fieldName];
    if (!rules) return null;
    
    return Validator.validateField(value, rules, fieldName);
  };

  return {
    validate,
    validateField,
  };
};

// Higher-order component for form validation
export const withValidation = (
  Component: React.ComponentType<any>,
  schema: ValidationSchema
) => {
  const WrappedComponent = (props: any) => {
    const validation = useFormValidation(schema);
    
    return React.createElement(Component, {
      ...props,
      validation
    });
  };

  WrappedComponent.displayName = `withValidation(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default Validator;
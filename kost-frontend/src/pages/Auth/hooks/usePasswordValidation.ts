// pages/Auth/hooks/usePasswordValidation.ts
// Custom hook for password validation and strength calculation

import { useMemo } from 'react';
import { calculatePasswordStrength } from '../utils';

interface UsePasswordValidationOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
}

const defaultOptions: UsePasswordValidationOptions = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false
};

export function usePasswordValidation(
  password: string, 
  options: UsePasswordValidationOptions = {}
) {
  const validationOptions = useMemo(() => ({ ...defaultOptions, ...options }), [options]);

  const validation = useMemo(() => {
    if (!password) {
      return {
        isValid: false,
        strength: 0,
        checks: {
          minLength: false,
          hasUppercase: false,
          hasLowercase: false,
          hasNumbers: false,
          hasSpecialChars: false
        },
        feedback: [],
        score: 0,
        level: 'weak' as const
      };
    }

    const strengthResult = calculatePasswordStrength(password);
    
    // Additional validation based on options
    const checks = {
      minLength: password.length >= (validationOptions.minLength || 8),
      hasUppercase: validationOptions.requireUppercase ? /[A-Z]/.test(password) : true,
      hasLowercase: validationOptions.requireLowercase ? /[a-z]/.test(password) : true,
      hasNumbers: validationOptions.requireNumbers ? /\d/.test(password) : true,
      hasSpecialChars: validationOptions.requireSpecialChars ? /[!@#$%^&*(),.?":{}|<>]/.test(password) : true
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const score = passedChecks / totalChecks;
    
    const isValid = Object.values(checks).every(Boolean);

    // Determine strength level
    let level: 'weak' | 'medium' | 'strong';
    if (score < 0.5) {
      level = 'weak';
    } else if (score < 0.8) {
      level = 'medium';
    } else {
      level = 'strong';
    }

    // Generate feedback
    const feedback: string[] = [];
    
    if (!checks.minLength) {
      feedback.push(`Use at least ${validationOptions.minLength} characters`);
    }
    
    if (validationOptions.requireUppercase && !checks.hasUppercase) {
      feedback.push('Add uppercase letters (A-Z)');
    }
    
    if (validationOptions.requireLowercase && !checks.hasLowercase) {
      feedback.push('Add lowercase letters (a-z)');
    }
    
    if (validationOptions.requireNumbers && !checks.hasNumbers) {
      feedback.push('Add numbers (0-9)');
    }
    
    if (validationOptions.requireSpecialChars && !checks.hasSpecialChars) {
      feedback.push('Add special characters (!@#$%^&*)');
    }

    // Additional feedback for strength
    if (password.length < 12) {
      feedback.push('Consider using 12+ characters for better security');
    }

    if (!/(.)\1{2,}/.test(password) === false) {
      feedback.push('Avoid repeating characters');
    }

    return {
      isValid,
      strength: score,
      checks,
      feedback,
      score: strengthResult.score,
      level
    };
  }, [password, validationOptions]);

  // Helper functions
  const getStrengthColor = (level: string) => {
    switch (level) {
      case 'weak':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'strong':
        return 'text-green-600';
      default:
        return 'text-gray-400';
    }
  };

  const getStrengthBgColor = (level: string) => {
    switch (level) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthText = (level: string) => {
    switch (level) {
      case 'weak':
        return 'Weak';
      case 'medium':
        return 'Medium';
      case 'strong':
        return 'Strong';
      default:
        return 'Very Weak';
    }
  };

  // Password confirmation validation
  const validateConfirmation = (confirmPassword: string) => {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }
    
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    
    return null;
  };

  return {
    ...validation,
    
    // Helper functions
    getStrengthColor,
    getStrengthBgColor,
    getStrengthText,
    validateConfirmation,
    
    // Computed properties
    strengthPercentage: validation.strength * 100,
    hasMinLength: validation.checks.minLength,
    hasUppercase: validation.checks.hasUppercase,
    hasLowercase: validation.checks.hasLowercase,
    hasNumbers: validation.checks.hasNumbers,
    hasSpecialChars: validation.checks.hasSpecialChars,
    
    // Requirements list for UI
    requirements: [
      {
        text: `At least ${validationOptions.minLength} characters`,
        met: validation.checks.minLength,
        required: true
      },
      {
        text: 'Uppercase letter (A-Z)',
        met: validation.checks.hasUppercase,
        required: validationOptions.requireUppercase || false
      },
      {
        text: 'Lowercase letter (a-z)',
        met: validation.checks.hasLowercase,
        required: validationOptions.requireLowercase || false
      },
      {
        text: 'Number (0-9)',
        met: validation.checks.hasNumbers,
        required: validationOptions.requireNumbers || false
      },
      {
        text: 'Special character (!@#$%^&*)',
        met: validation.checks.hasSpecialChars,
        required: validationOptions.requireSpecialChars || false
      }
    ].filter(req => req.required)
  };
}
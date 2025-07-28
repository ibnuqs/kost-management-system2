// src/utils/errorHandler.ts - Centralized Error Handling
import { toast } from 'react-hot-toast';
import { ApiError } from '../types/api';

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = 'GENERIC_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly fields: Record<string, string[]>;

  constructor(message: string, fields: Record<string, string[]> = {}) {
    super(message, 'VALIDATION_ERROR', 422);
    this.fields = fields;
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', 0);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND_ERROR', 404);
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = 'Request timeout') {
    super(message, 'TIMEOUT_ERROR', 408);
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 'SERVER_ERROR', 500);
  }
}

// Error Handler Class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCounts: Map<string, number> = new Map();
  private lastErrorTime: Map<string, number> = new Map();
  private readonly maxErrorsPerMinute = 5;
  private readonly errorCooldownMs = 60000; // 1 minute

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private shouldSuppressError(errorCode: string): boolean {
    const now = Date.now();
    const lastTime = this.lastErrorTime.get(errorCode) || 0;
    const count = this.errorCounts.get(errorCode) || 0;

    // Reset count if cooldown period has passed
    if (now - lastTime > this.errorCooldownMs) {
      this.errorCounts.set(errorCode, 0);
      this.lastErrorTime.set(errorCode, now);
      return false;
    }

    // Check if we've exceeded the error limit
    if (count >= this.maxErrorsPerMinute) {
      return true;
    }

    // Increment count and update time
    this.errorCounts.set(errorCode, count + 1);
    this.lastErrorTime.set(errorCode, now);
    return false;
  }

  public handleError(error: any, context?: string): void {
    const appError = this.parseError(error);
    
    // Log error for development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error in ${context || 'Unknown Context'}`);
      console.error('Error:', appError);
      console.error('Original error:', error);
      console.groupEnd();
    }

    // Suppress repeated errors
    if (this.shouldSuppressError(appError.code)) {
      return;
    }

    // Show appropriate user notification
    this.showUserNotification(appError);

    // Send to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(appError, context);
    }
  }

  private parseError(error: any): AppError {
    // Already an AppError
    if (error instanceof AppError) {
      return error;
    }

    // Axios/API response error
    if (error?.response) {
      const { status, data } = error.response;
      const message = data?.message || data?.error || 'Request failed';

      switch (status) {
        case 400:
          return new ValidationError(message, data?.errors);
        case 401:
          return new AuthenticationError(message);
        case 403:
          return new AuthorizationError(message);
        case 404:
          return new NotFoundError(message);
        case 408:
          return new TimeoutError(message);
        case 422:
          return new ValidationError(message, data?.errors);
        case 500:
        case 502:
        case 503:
        case 504:
          return new ServerError(message);
        default:
          return new AppError(message, 'HTTP_ERROR', status);
      }
    }

    // Network/connection error
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      return new TimeoutError('Request timeout');
    }

    if (error?.code === 'ERR_NETWORK' || !error?.response) {
      return new NetworkError('Network connection failed');
    }

    // Generic JavaScript error
    if (error instanceof Error) {
      return new AppError(error.message, 'JAVASCRIPT_ERROR');
    }

    // String error
    if (typeof error === 'string') {
      return new AppError(error);
    }

    // Unknown error type
    return new AppError('An unexpected error occurred', 'UNKNOWN_ERROR');
  }

  private showUserNotification(error: AppError): void {
    const options = {
      duration: this.getToastDuration(error),
      id: error.code, // Prevent duplicate toasts
    };

    switch (error.code) {
      case 'VALIDATION_ERROR':
        toast.error(error.message, options);
        break;
      case 'AUTH_ERROR':
        toast.error('Please log in to continue', options);
        break;
      case 'AUTHORIZATION_ERROR':
        toast.error('You do not have permission to perform this action', options);
        break;
      case 'NOT_FOUND_ERROR':
        toast.error('The requested resource was not found', options);
        break;
      case 'NETWORK_ERROR':
        toast.error('Please check your internet connection', options);
        break;
      case 'TIMEOUT_ERROR':
        toast.error('Request is taking too long. Please try again', options);
        break;
      case 'SERVER_ERROR':
        toast.error('Server error. Please try again later', options);
        break;
      default:
        toast.error(error.message || 'Something went wrong', options);
    }
  }

  private getToastDuration(error: AppError): number {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return 4000;
      case 'NETWORK_ERROR':
      case 'SERVER_ERROR':
        return 6000;
      default:
        return 4000;
    }
  }

  private reportError(error: AppError, context?: string): void {
    // In production, send to error reporting service
    // Example: Sentry, LogRocket, etc.
    try {
      // This would be replaced with actual error reporting service
      console.error('Error reported:', {
        error: {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
          stack: error.stack,
        },
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    } catch (reportingError) {
      // Silently fail error reporting
    }
  }

  public clearErrorCounts(): void {
    this.errorCounts.clear();
    this.lastErrorTime.clear();
  }
}

// Convenience functions
export const errorHandler = ErrorHandler.getInstance();

export const handleError = (error: any, context?: string): void => {
  errorHandler.handleError(error, context);
};

export const createErrorHandler = (context: string) => {
  return (error: any) => handleError(error, context);
};

// React hook for error handling
export const useErrorHandler = (context?: string) => {
  return (error: any) => handleError(error, context);
};

// Async function wrapper with error handling
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      return null;
    }
  };
};

// Form error helpers
export const getFieldError = (
  errors: Record<string, string[]> | undefined,
  field: string
): string | undefined => {
  return errors?.[field]?.[0];
};

export const hasFieldError = (
  errors: Record<string, string[]> | undefined,
  field: string
): boolean => {
  return Boolean(errors?.[field]?.length);
};

export const formatValidationErrors = (
  errors: Record<string, string[]>
): string => {
  return Object.values(errors)
    .flat()
    .join(', ');
};

export default ErrorHandler;
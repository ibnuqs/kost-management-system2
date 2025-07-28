// pages/Auth/index.ts
// Main Auth module exports - everything you need from Auth

// Re-export all the important parts
export * from './types';
export * from './utils';
export * from './hooks';
export * from './contexts';
export * from './services';
export * from './components';
export * from './pages';

// Named exports for convenience
export {
  // Pages
  Login,
  Register,
  ForgotPassword,
  ResetPassword
} from './pages';

export {
  // Context & Hooks
  AuthProvider,
  useAuth
} from './contexts';

export {
  // Custom Hooks
  useAuthForm,
  usePasswordValidation
} from './hooks';

export {
  // Services
  authService
} from './services';

export {
  // UI Components
  
  AuthInput,
  AuthButton,
  PasswordInput,
  AuthLayout,
  LoadingSpinner,
  LoadingOverlay,
  ErrorAlert,
  SuccessAlert
} from './components';

// Type exports for isolatedModules
export type {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  AuthContextType
} from './types';

// Common utilities
export {
  validateEmail,
  validatePassword,
  validateName,
  AUTH_ROUTES,
  REDIRECT_ROUTES
} from './utils';
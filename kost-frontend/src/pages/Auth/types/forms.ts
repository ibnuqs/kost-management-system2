// pages/Auth/types/forms.ts
// Form-specific types for Auth components

export interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  terms: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordFormData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

// Form validation types
export type FormErrors<T> = {
  [K in keyof T]?: string;
};

export interface FormValidationRule<T> {
  required?: boolean;
  validator?: (value: T) => string | null;
  dependencies?: string[]; // For fields that depend on other fields
}

export type FormValidationRules<T> = {
  [K in keyof T]?: FormValidationRule<T[K]>;
};

// Password strength types
export interface PasswordStrength {
  score: number; // 0-1
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
  };
  feedback: string[];
}

// Form state management
export interface FormState<T> {
  values: T;
  errors: FormErrors<T>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitCount: number;
}

export interface FormHookOptions<T> {
  initialValues: T;
  validationRules?: FormValidationRules<T>;
  onSubmit: (values: T) => Promise<void>;
  enableReinitialize?: boolean;
}

// Component prop types
export interface BaseFormProps {
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  error?: string;
}

export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}
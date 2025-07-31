import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import authService from '../services/authService'; // Fixed import
import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthContextType,
  AuthState,
  ChangePasswordData,
  ForgotPasswordData,
  ResetPasswordData
} from '../types';
import { SUCCESS_MESSAGES } from '../utils/constants';

// Auth reducer actions
type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CHECKED'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  hasCheckedAuth: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        token: action.payload ? authService.getToken() : null,
        isLoading: false,
        error: null, // Clear error on successful user set
      };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_CHECKED':
      return { ...state, hasCheckedAuth: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
        hasCheckedAuth: true,
      };
    
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const cachedUser = authService.getUser();
      const token = authService.getToken();

      if (!token || !cachedUser) {
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_CHECKED', payload: true });
        return;
      }

      // Use cached user data immediately
      dispatch({ type: 'SET_USER', payload: cachedUser });

      // Verify with server in background
      try {
        const result = await authService.getCurrentUser();
        
        if (result.success && result.user) {
          dispatch({ type: 'SET_USER', payload: result.user });
        } else {
          // Token is invalid, clear auth
          authService.clearAuth();
          dispatch({ type: 'LOGOUT' });
        }
      } catch {
        // Keep cached data if server is unreachable
        // Don't clear auth on network errors
      }
    } catch {
      authService.clearAuth();
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_CHECKED', payload: true });
    }
  };

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const result = await authService.login(credentials);
      
      if (result.success && result.user) {
        dispatch({ type: 'SET_USER', payload: result.user });
        toast.success(result.message || SUCCESS_MESSAGES.LOGIN_SUCCESS);
        return result;
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Login failed' });
        toast.error(result.error || 'Login failed');
        return result;
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData: RegisterData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const result = await authService.register(userData);
      
      if (result.success && result.user) {
        dispatch({ type: 'SET_USER', payload: result.user });
        toast.success(result.message || SUCCESS_MESSAGES.REGISTRATION_SUCCESS);
        return result;
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Registration failed' });
        toast.error(result.error || 'Registration failed');
        return result;
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
      toast.success(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
    } catch {
      // Clear local state even if API call fails
      authService.clearAuth();
      dispatch({ type: 'LOGOUT' });
      toast.success(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
    }
  };

  const loadUser = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const result = await authService.getCurrentUser();
      
      if (result.success && result.user) {
        dispatch({ type: 'SET_USER', payload: result.user });
        return result;
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to load user' });
        return result;
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || 'Failed to load user';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const result = await authService.updateProfile(userData);
      
      if (result.success && result.user) {
        dispatch({ type: 'SET_USER', payload: result.user });
        toast.success(result.message || SUCCESS_MESSAGES.PROFILE_UPDATED);
        return result;
      } else {
        toast.error(result.error || 'Failed to update profile');
        return result;
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || 'Failed to update profile';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    try {
      const data: ChangePasswordData = {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      };

      const result = await authService.changePassword(data);
      
      if (result.success) {
        toast.success(result.message || SUCCESS_MESSAGES.PASSWORD_CHANGED);
        return result;
      } else {
        toast.error(result.error || 'Failed to change password');
        return result;
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || 'Failed to change password';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const data: ForgotPasswordData = { email };
      const result = await authService.forgotPassword(data);
      
      if (result.success) {
        toast.success(result.message || SUCCESS_MESSAGES.RESET_EMAIL_SENT);
        return result;
      } else {
        toast.error(result.error || 'Failed to send reset email');
        return result;
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || 'Failed to send reset email';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (token: string, password: string, confirmPassword: string) => {
    try {
      const data: ResetPasswordData = {
        token,
        password,
        password_confirmation: confirmPassword
      };

      const result = await authService.resetPassword(data);
      
      if (result.success) {
        toast.success(result.message || SUCCESS_MESSAGES.PASSWORD_RESET);
        return result;
      } else {
        toast.error(result.error || 'Failed to reset password');
        return result;
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || 'Failed to reset password';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Helper functions aligned with Laravel User model
  const hasRole = (role: string): boolean => {
    return state.user?.role === role;
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const isTenant = (): boolean => {
    return hasRole('tenant');
  };

  const isActive = (): boolean => {
    return state.user?.status === 'active';
  };

  const isInactive = (): boolean => {
    return state.user?.status === 'inactive';
  };

  const isSuspended = (): boolean => {
    return state.user?.status === 'suspended';
  };

  const value: AuthContextType = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    hasCheckedAuth: state.hasCheckedAuth,

    // Actions
    login,
    register,
    logout,
    loadUser,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError,

    // Helpers
    hasRole,
    isAdmin,
    isTenant,
    isActive,
    isInactive,
    isSuspended,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
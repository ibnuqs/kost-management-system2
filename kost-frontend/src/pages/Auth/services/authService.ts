// pages/Auth/services/authService.ts
// Authentication service for API calls

import api from '../../../utils/api'; // Use the existing api instance
import { 
  LoginCredentials, 
  RegisterData, 
  User, 
  AuthResponse,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
} from '../types/auth';
import { 
  STORAGE_KEYS 
} from '../utils/constants';
import { 
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getUserData,
  setUserData,
  removeUserData,
  clearAuthStorage
} from '../utils/helpers';

// Type definitions for API error responses
interface AxiosError {
  response?: {
    data?: {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
    status?: number;
  };
  message?: string;
  code?: string;
}


class AuthService {
  constructor() {
    // No need for setupInterceptors since api.ts already handles it
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Attempting login (email omitted for security)
      console.log('🔍 AuthService: Attempting login...');
      
      let response;
      try {
        response = await api.post('/auth/login', {
          email: credentials.email,
          password: credentials.password,
          remember: credentials.remember || false,
        });
      } catch (mainError: unknown) {
        // If main login fails with timeout, try test endpoint
        console.warn('⚠️ Main login endpoint failed, trying test endpoint...');
        const axiosError = mainError as AxiosError;
        if (axiosError.code === 'ECONNABORTED') {
          try {
            const testResponse = await api.post('/test-login', {
              email: credentials.email,
              password: credentials.password,
            });
            console.log('✅ Test login endpoint worked');
            response = testResponse;
          } catch {
            console.error('❌ Test login endpoint also failed');
            throw mainError; // Throw original error
          }
        } else {
          throw mainError;
        }
      }

      // Login response received

      // ✅ FIXED: Handle mixed content response
      let responseData;
      
      try {
        // Handle case where response might have mixed content or be string
        if (typeof response.data === 'string') {
          // Try to extract JSON from string response
          const jsonMatch = response.data.match(/\{.*\}$/s);
          if (jsonMatch) {
            responseData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('Invalid response format - no JSON found');
          }
        } else {
          responseData = response.data;
        }
      } catch {
        // Failed to parse response (details omitted for security)
        
        return {
          success: false,
          error: 'Invalid server response format'
        };
      }

      // ✅ FIXED: Validate response structure
      if (!responseData || typeof responseData !== 'object') {
        return {
          success: false,
          error: 'Invalid response data structure'
        };
      }

      if (responseData.success && responseData.data) {
        // Laravel backend returns: { success: true, data: { user, token }, message }
        const { user, token } = responseData.data;
        
        if (!user || !token) {
          return {
            success: false,
            error: 'Invalid login response: missing user or token'
          };
        }
        
        this.setToken(token);
        this.setUser(user);

        // Handle remember me
        if (credentials.remember) {
          localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
        }

        // Login successful

        return {
          success: true,
          user,
          token,
          message: responseData.message || 'Login successful'
        };
      } else {
        return {
          success: false,
          error: responseData.message || 'Login failed'
        };
      }
    } catch (error: unknown) {
      // Login error occurred
      
      // Clear any partial auth data
      this.clearAuth();
      
      // Handle different error response structures
      let message = 'The provided credentials are incorrect.';
      
      const axiosError = error as AxiosError;
      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.response?.data?.error) {
        message = axiosError.response.data.error;
      } else if ((error as Error).message) {
        message = (error as Error).message;
      }
      
      return {
        success: false,
        error: message
      };
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Attempting registration
      
      const response = await api.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password_confirmation,
        phone: userData.phone,
        role: 'tenant', // Default role for self-registration
      });

      // Registration response received

      const responseData = response.data;
      
      if (responseData.success && responseData.data) {
        const { user, token } = responseData.data;
        
        this.setToken(token);
        this.setUser(user);

        return {
          success: true,
          user,
          token,
          message: responseData.message || 'Registration successful'
        };
      } else {
        return {
          success: false,
          error: responseData.message || 'Registration failed'
        };
      }
    } catch (error: unknown) {
      // Registration error occurred
      
      let message = 'Registration failed';
      
      const axiosError = error as AxiosError;
      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.response?.data?.errors) {
        // Handle Laravel validation errors
        const errors = Object.values(axiosError.response.data.errors).flat();
        message = errors.join(', ');
      } else if ((error as Error).message) {
        message = (error as Error).message;
      }
      
      return {
        success: false,
        error: message
      };
    }
  }

  async logout(): Promise<void> {
    try {
      // Attempting logout
      
      // Try to call logout endpoint, but don't fail if it errors
      try {
        await api.post('/auth/logout');
        // Logout endpoint called successfully
      } catch {
        // Logout endpoint failed, continuing with local cleanup
      }
    } catch {
      // Logout error occurred
    } finally {
      // Always clear local auth data
      this.clearAuth();
      // Auth data cleared
    }
  }

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      // Getting current user
      
      // Check if we have a token first
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'No authentication token found'
        };
      }
      
      const response = await api.get('/auth/profile');
      // Get user response received
      
      const responseData = response.data;
      
      if (responseData.success && responseData.data) {
        const user = responseData.data;
        this.setUser(user);
        
        return {
          success: true,
          user,
          message: responseData.message || 'User data loaded'
        };
      } else {
        return {
          success: false,
          error: responseData.message || 'Failed to load user data'
        };
      }
    } catch (error: unknown) {
      // Get user error occurred
      
      // If token is invalid (401), clear auth data
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        // Clearing invalid auth data
        this.clearAuth();
      }
      
      let message = 'Failed to load user data';
      
      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if ((error as Error).message) {
        message = (error as Error).message;
      }
      
      return {
        success: false,
        error: message
      };
    }
  }

  async updateProfile(userData: Partial<User>): Promise<AuthResponse> {
    try {
      // Updating profile
      
      const response = await api.put('/auth/profile', userData);
      // Update profile response received
      
      const responseData = response.data;
      
      if (responseData.success && responseData.data) {
        const user = responseData.data;
        this.setUser(user);
        
        return {
          success: true,
          user,
          message: responseData.message || 'Profile updated successfully'
        };
      } else {
        return {
          success: false,
          error: responseData.message || 'Failed to update profile'
        };
      }
    } catch (error: unknown) {
      // Update profile error occurred
      
      let message = 'Failed to update profile';
      
      const axiosError = error as AxiosError;
      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.response?.data?.errors) {
        const errors = Object.values(axiosError.response.data.errors).flat();
        message = errors.join(', ');
      } else if ((error as Error).message) {
        message = (error as Error).message;
      }
      
      return {
        success: false,
        error: message
      };
    }
  }

  async changePassword(data: ChangePasswordData): Promise<AuthResponse> {
    try {
      // Changing password
      
      const response = await api.put('/auth/profile', {
        current_password: data.current_password,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      const responseData = response.data;

      return {
        success: responseData.success || true,
        message: responseData.message || 'Password changed successfully'
      };
    } catch (error: unknown) {
      // Change password error occurred
      
      let message = 'Failed to change password';
      
      const axiosError = error as AxiosError;
      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.response?.data?.errors) {
        const errors = Object.values(axiosError.response.data.errors).flat();
        message = errors.join(', ');
      } else if ((error as Error).message) {
        message = (error as Error).message;
      }
      
      return {
        success: false,
        error: message
      };
    }
  }

  async forgotPassword(data: ForgotPasswordData): Promise<AuthResponse> {
    try {
      // Sending forgot password email
      
      const response = await api.post('/auth/forgot-password', { 
        email: data.email 
      });
      
      const responseData = response.data;

      return {
        success: responseData.success || true,
        message: responseData.message || 'Password reset link sent to your email'
      };
    } catch (error: unknown) {
      // Forgot password error occurred
      
      let message = 'Failed to send reset email';
      
      const axiosError = error as AxiosError;
      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if ((error as Error).message) {
        message = (error as Error).message;
      }
      
      return {
        success: false,
        error: message
      };
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
    try {
      // Resetting password
      
      const response = await api.post('/auth/reset-password', {
        token: data.token,
        password: data.password,
        password_confirmation: data.password_confirmation
      });

      const responseData = response.data;

      return {
        success: responseData.success || true,
        message: responseData.message || 'Password reset successfully'
      };
    } catch (error: unknown) {
      // Reset password error occurred
      
      let message = 'Failed to reset password';
      
      const axiosError = error as AxiosError;
      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.response?.data?.errors) {
        const errors = Object.values(axiosError.response.data.errors).flat();
        message = errors.join(', ');
      } else if ((error as Error).message) {
        message = (error as Error).message;
      }
      
      return {
        success: false,
        error: message
      };
    }
  }

  // Token management
  getToken(): string | null {
    return getAuthToken();
  }

  setToken(token: string): void {
    setAuthToken(token);
  }

  removeToken(): void {
    removeAuthToken();
  }

  // User data management
  getUser(): User | null {
    return getUserData();
  }

  setUser(user: User): void {
    setUserData(user);
  }

  removeUser(): void {
    removeUserData();
  }

  // Clear all auth data
  clearAuth(): void {
    clearAuthStorage();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    
    // Auth check performed (details omitted for security)
    
    return !!(token && user);
  }

  // Role checks - aligned with Laravel User model
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isTenant(): boolean {
    return this.hasRole('tenant');
  }

  // Status checks - aligned with Laravel User model
  isActive(): boolean {
    const user = this.getUser();
    return user?.status === 'active';
  }

  isInactive(): boolean {
    const user = this.getUser();
    return user?.status === 'inactive';
  }

  isSuspended(): boolean {
    const user = this.getUser();
    return user?.status === 'suspended';
  }

  // Utility methods
  getCurrentUserRole(): string | null {
    const user = this.getUser();
    return user?.role || null;
  }

  getCurrentUserStatus(): string | null {
    const user = this.getUser();
    return user?.status || null;
  }

  // Check if remember me is enabled
  isRememberMeEnabled(): boolean {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
  }

  // Refresh user data
  async refreshUserData(): Promise<AuthResponse> {
    return this.getCurrentUser();
  }
}

// Export singleton instance
export default new AuthService();
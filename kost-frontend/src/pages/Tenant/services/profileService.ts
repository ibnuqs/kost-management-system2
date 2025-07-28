// File: src/pages/Tenant/services/profileService.ts
import api, { endpoints, ApiResponse } from '../../../utils/api';
import { 
  TenantProfile, 
  ProfileUpdateData,
  SecuritySettings,
  ProfileStats,
  AccountActivity,
  ProfileCompletion,
  PreferenceSettings,
  DocumentUpload
} from '../types/profile';

class ProfileService {
  /**
   * Get profile
   */
  async getProfile(): Promise<any> {
    const response = await api.get<ApiResponse<any>>(endpoints.tenant.profile.index);
    return response.data.data;
  }

  /**
   * Update profile
   */
  async updateProfile(data: {
    name?: string;
    phone?: string;
    email?: string;
    avatar?: File;
  }): Promise<{ message: string }> {
    // If avatar is provided, use FormData for multipart upload
    if (data.avatar) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value);
        }
      });

      const response = await api.put<ApiResponse<{ message: string }>>(
        endpoints.tenant.profile.update, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    } else {
      // For simple data, use JSON
      const { avatar, ...updateData } = data;
      const response = await api.put<ApiResponse<{ message: string }>>(
        endpoints.tenant.profile.update, 
        updateData
      );
      return response.data.data;
    }
  }

  /**
   * Change password
   */
  async changePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<{ message: string }> {
    const response = await api.put<ApiResponse<{ message: string }>>(
      endpoints.tenant.profile.update, 
      data
    );
    return response.data.data || response.data;
  }

  /**
   * Get profile statistics
   */
  async getProfileStats(): Promise<ProfileStats> {
    const response = await api.get<ApiResponse<ProfileStats>>(`/tenant/profile/stats`);
    return response.data.data;
  }

  /**
   * Get account activity logs
   */
  async getAccountActivity(limit?: number): Promise<AccountActivity[]> {
    const response = await api.get<ApiResponse<AccountActivity[]>>(`/tenant/profile/activity`, {
      params: { limit }
    });
    return response.data.data;
  }

  /**
   * Get profile completion status
   */
  async getProfileCompletion(): Promise<ProfileCompletion> {
    const response = await api.get<ApiResponse<ProfileCompletion>>(`/tenant/profile/completion`);
    return response.data.data;
  }

  /**
   * Get security settings
   */
  async getSecuritySettings(): Promise<SecuritySettings> {
    const response = await api.get<ApiResponse<SecuritySettings>>(`/tenant/profile/security`);
    return response.data.data;
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
    const response = await api.put<ApiResponse<SecuritySettings>>(`/tenant/profile/security`, settings);
    return response.data.data;
  }

  /**
   * Enable two-factor authentication
   */
  async enableTwoFactor(): Promise<{ qr_code: string; secret: string }> {
    const response = await api.post<ApiResponse<{ qr_code: string; secret: string }>>(`/tenant/profile/2fa/enable`);
    return response.data.data;
  }

  /**
   * Confirm two-factor authentication
   */
  async confirmTwoFactor(token: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/tenant/profile/2fa/confirm`, { token });
    return response.data.data;
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(password: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/tenant/profile/2fa/disable`, { password });
    return response.data.data;
  }

  /**
   * Get preference settings
   */
  async getPreferences(): Promise<PreferenceSettings> {
    const response = await api.get<ApiResponse<PreferenceSettings>>(`/tenant/profile/preferences`);
    return response.data.data;
  }

  /**
   * Update preference settings
   */
  async updatePreferences(preferences: Partial<PreferenceSettings>): Promise<PreferenceSettings> {
    const response = await api.put<ApiResponse<PreferenceSettings>>(`/tenant/profile/preferences`, preferences);
    return response.data.data;
  }

  /**
   * Upload document
   */
  async uploadDocument(file: File, type: string): Promise<DocumentUpload> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    
    const response = await api.post<ApiResponse<DocumentUpload>>(`/tenant/profile/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  /**
   * Get uploaded documents
   */
  async getDocuments(): Promise<DocumentUpload[]> {
    const response = await api.get<ApiResponse<DocumentUpload[]>>(`/tenant/profile/documents`);
    return response.data.data;
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<any> {
    const response = await api.delete<ApiResponse<any>>(`/tenant/profile/documents/${documentId}`);
    return response.data.data;
  }

  /**
   * Download document
   */
  async downloadDocument(documentId: string): Promise<Blob> {
    const response = await api.get(`/tenant/profile/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Update emergency contact
   */
  async updateEmergencyContact(data: {
    emergency_contact_name: string;
    emergency_contact_phone: string;
  }): Promise<TenantProfile> {
    const response = await api.put<ApiResponse<TenantProfile>>(`/tenant/profile/emergency-contact`, data);
    return response.data.data;
  }

  /**
   * Verify phone number
   */
  async verifyPhoneNumber(phone: string): Promise<{ verification_code_sent: boolean }> {
    const response = await api.post<ApiResponse<{ verification_code_sent: boolean }>>(`/tenant/profile/verify-phone`, { phone });
    return response.data.data;
  }

  /**
   * Confirm phone verification
   */
  async confirmPhoneVerification(code: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/tenant/profile/confirm-phone`, { code });
    return response.data.data;
  }

  /**
   * Verify email address
   */
  async verifyEmail(): Promise<{ verification_email_sent: boolean }> {
    const response = await api.post<ApiResponse<{ verification_email_sent: boolean }>>(`/tenant/profile/verify-email`);
    return response.data.data;
  }

  /**
   * Get active sessions
   */
  async getActiveSessions(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`/tenant/profile/sessions`);
    return response.data.data;
  }

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string): Promise<any> {
    const response = await api.delete<ApiResponse<any>>(`/tenant/profile/sessions/${sessionId}`);
    return response.data.data;
  }

  /**
   * Revoke all other sessions
   */
  async revokeAllSessions(): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/tenant/profile/sessions/revoke-all`);
    return response.data.data;
  }

  /**
   * Delete account
   */
  async deleteAccount(password: string, reason?: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/tenant/profile/delete`, { 
      password, 
      reason 
    });
    return response.data.data;
  }

  /**
   * Export profile data
   */
  async exportProfileData(): Promise<Blob> {
    const response = await api.get(`/tenant/profile/export`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export const profileService = new ProfileService();
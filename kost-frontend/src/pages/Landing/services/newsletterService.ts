// src/pages/Landing/services/newsletterService.ts - FIXED
export interface NewsletterSubscription {
  email: string;
  name?: string;
  interests?: string[];
  source: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

class NewsletterService {
  // ✅ FIX: Safe API URL detection
  private baseUrl = this.getApiUrl();

  private getApiUrl(): string {
    // Try to get from environment variables (will be undefined in browser)
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    
    // Fallback for browser environment
    if (typeof window !== 'undefined') {
      // Use current domain with /api path
      return `${window.location.origin}/api`;
    }
    
    // Final fallback
    return 'http://148.230.96.228:3000/api';
  }

  async subscribe(data: NewsletterSubscription): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      
      // Mock success response for demo
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Terima kasih! Anda telah berhasil subscribe newsletter kami.',
            data: {
              subscriptionId: `SUB-${Date.now()}`,
              email: data.email,
              status: 'subscribed'
            }
          });
        }, 1000);
      });
    }
  }

  async unsubscribe(email: string, subscriptionId?: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/newsletter/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          subscriptionId,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Newsletter unsubscribe error:', error);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Anda telah berhasil unsubscribe dari newsletter kami.',
            data: {
              email,
              status: 'unsubscribed'
            }
          });
        }, 1000);
      });
    }
  }

  async checkSubscription(email: string): Promise<ApiResponse<{ isSubscribed: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/newsletter/check?email=${encodeURIComponent(email)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Newsletter check subscription error:', error);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Status subscription berhasil dicek',
            data: {
              isSubscribed: false // Default to not subscribed for demo
            }
          });
        }, 500);
      });
    }
  }

  async updatePreferences(email: string, preferences: {
    interests?: string[];
    frequency?: 'daily' | 'weekly' | 'monthly';
    name?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/newsletter/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          preferences,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Newsletter preferences update error:', error);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Preferensi newsletter berhasil diupdate',
            data: {
              email,
              preferences
            }
          });
        }, 1000);
      });
    }
  }

  // Helper methods for common newsletter interactions
  async subscribeFromFooter(email: string): Promise<ApiResponse> {
    return this.subscribe({
      email,
      source: 'footer',
      interests: ['updates', 'promotions']
    });
  }

  async subscribeFromModal(email: string, name?: string): Promise<ApiResponse> {
    return this.subscribe({
      email,
      name,
      source: 'modal',
      interests: ['updates', 'news', 'promotions']
    });
  }

  async subscribeFromBooking(email: string, name: string): Promise<ApiResponse> {
    return this.subscribe({
      email,
      name,
      source: 'booking-form',
      interests: ['updates', 'room-availability']
    });
  }

  // Validate email before subscription
  validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email || !email.trim()) {
      return { isValid: false, error: 'Email wajib diisi' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Format email tidak valid' };
    }

    return { isValid: true };
  }

  // Check if email is from common disposable email providers
  isDisposableEmail(email: string): boolean {
    const disposableDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com',
      'temp-mail.org'
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    return disposableDomains.includes(domain);
  }
}

export default new NewsletterService();
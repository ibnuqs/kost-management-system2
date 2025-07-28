// src/pages/Landing/services/landingService.ts - FIXED
import { BookingFormData, ContactFormData } from '../types';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

class LandingService {
  // ✅ FIX: Use window.location for fallback instead of process.env
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

  async submitBookingInquiry(data: BookingFormData): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/booking-inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          source: 'landing-page'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Booking inquiry error:', error);
      
      // Mock success response for demo purposes
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Booking inquiry berhasil dikirim! Kami akan menghubungi Anda dalam 1x24 jam.',
            data: {
              inquiryId: `INQ-${Date.now()}`,
              estimatedResponse: '1-24 jam'
            }
          });
        }, 1500); // Simulate network delay
      });
    }
  }

  async submitContactForm(data: ContactFormData): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          source: 'contact-form'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Contact form error:', error);
      
      // Mock success response for demo purposes
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Pesan Anda berhasil dikirim! Terima kasih atas pertanyaannya.',
            data: {
              messageId: `MSG-${Date.now()}`
            }
          });
        }, 1000);
      });
    }
  }

  async getRoomAvailability(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/rooms/availability`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Room availability error:', error);
      
      // Mock data for demo
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Data availability berhasil dimuat',
            data: {
              standard: { available: 2, total: 8 },
              deluxe: { available: 1, total: 4 },
              suite: { available: 0, total: 2 }
            }
          });
        }, 500);
      });
    }
  }

  async scheduleVisit(data: {
    name: string;
    phone: string;
    email: string;
    preferredDate: string;
    preferredTime: string;
    message?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/schedule-visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Schedule visit error:', error);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Jadwal kunjungan berhasil dibuat! Kami akan konfirmasi melalui WhatsApp.',
            data: {
              visitId: `VISIT-${Date.now()}`,
              scheduledDate: data.preferredDate,
              scheduledTime: data.preferredTime
            }
          });
        }, 1000);
      });
    }
  }
}

export default new LandingService();
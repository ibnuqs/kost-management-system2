// src/pages/Landing/services/analyticsService.ts - FIXED
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, unknown>;
}

export interface PageViewEvent {
  page: string;
  title: string;
  referrer?: string;
  timestamp: string;
}

class AnalyticsService {
  private isEnabled: boolean;
  private userId: string | null = null;
  private sessionId: string;

  constructor() {
    // ✅ FIX: Safe environment check
    this.isEnabled = this.getEnvironment() === 'production';
    this.sessionId = this.generateSessionId();
    this.initializeUserId();
  }

  // ✅ FIX: Safe environment detection
  private getEnvironment(): string {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
      return process.env.NODE_ENV;
    }
    
    // Browser fallback - check hostname
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '148.230.96.228') {
        return 'development';
      }
      return 'production';
    }
    
    return 'development';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeUserId(): void {
    // Try to get existing user ID from localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const existingUserId = localStorage.getItem('kos_user_id');
        if (existingUserId) {
          this.userId = existingUserId;
        } else {
          this.userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('kos_user_id', this.userId);
        }
      } else {
        // Fallback if localStorage is not available
        this.userId = `temp_${Date.now()}`;
      }
    } catch {
      // Fallback if localStorage is not available
      this.userId = `temp_${Date.now()}`;
    }
  }

  // Track page views
  trackPageView(page: string, title: string): void {
    if (!this.isEnabled) return;

    const event: PageViewEvent = {
      page,
      title,
      referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
      timestamp: new Date().toISOString()
    };

    this.sendEvent('page_view', event);
  }

  // Track user interactions
  trackEvent(event: string, category: string, action: string, label?: string, value?: number, properties?: Record<string, unknown>): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      action,
      label,
      value,
      properties: {
        ...properties,
        userId: this.userId,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown'
      }
    };

    this.sendEvent('user_interaction', analyticsEvent);
  }

  // Track specific landing page events
  trackBookingInquiry(roomType: string, source: string = 'unknown'): void {
    this.trackEvent('booking_inquiry', 'conversion', 'submit_booking_form', roomType, undefined, {
      source,
      roomType
    });
  }

  trackContactSubmission(subject: string): void {
    this.trackEvent('contact_submission', 'engagement', 'submit_contact_form', subject);
  }

  trackModalOpen(modalType: string): void {
    this.trackEvent('modal_open', 'engagement', 'open_modal', modalType);
  }

  trackModalClose(modalType: string, timeSpent?: number): void {
    this.trackEvent('modal_close', 'engagement', 'close_modal', modalType, timeSpent);
  }

  trackButtonClick(buttonName: string, section: string): void {
    this.trackEvent('button_click', 'engagement', 'click_button', buttonName, undefined, {
      section
    });
  }

  trackScrollDepth(percentage: number): void {
    if (percentage % 25 === 0) { // Track at 25%, 50%, 75%, 100%
      this.trackEvent('scroll_depth', 'engagement', 'scroll', `${percentage}%`, percentage);
    }
  }

  trackPhoneCall(): void {
    this.trackEvent('phone_call', 'conversion', 'click_phone_number');
  }

  trackWhatsAppClick(): void {
    this.trackEvent('whatsapp_click', 'conversion', 'click_whatsapp');
  }

  trackEmailClick(): void {
    this.trackEvent('email_click', 'conversion', 'click_email');
  }

  trackImageView(imageType: string, imageName: string): void {
    this.trackEvent('image_view', 'engagement', 'view_image', imageType, undefined, {
      imageName
    });
  }

  trackVirtualTour(): void {
    this.trackEvent('virtual_tour', 'engagement', 'start_virtual_tour');
  }

  trackTimeOnPage(timeSpent: number): void {
    this.trackEvent('time_on_page', 'engagement', 'page_duration', undefined, timeSpent);
  }

  // Send events to analytics service
  private async sendEvent(type: string, data: unknown): Promise<void> {
    try {
      // Send to Google Analytics 4 if available
      if (typeof window !== 'undefined' && window.gtag) {
        const eventData = data as AnalyticsEvent | PageViewEvent;
        const eventName = 'event' in eventData ? eventData.event : ('action' in eventData ? (eventData as AnalyticsEvent).action : type);
        const category = 'category' in eventData ? (eventData as AnalyticsEvent).category : 'page';
        const label = 'label' in eventData ? (eventData as AnalyticsEvent).label : undefined;
        const value = 'value' in eventData ? (eventData as AnalyticsEvent).value : undefined;
        const properties = 'properties' in eventData ? (eventData as AnalyticsEvent).properties : undefined;
        
        window.gtag('event', eventName, {
          event_category: category,
          event_label: label,
          value: value,
          custom_parameters: properties
        });
      }

      // Send to custom analytics endpoint
      const analyticsUrl = this.getAnalyticsUrl();
      if (analyticsUrl) {
        await fetch(analyticsUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type,
            data,
            timestamp: new Date().toISOString()
          }),
        });
      }

      // Log to console in development
      if (this.getEnvironment() === 'development') {
        console.log('Analytics Event:', { type, data });
      }
    } catch (error: unknown) {
      console.error('Analytics error:', error);
    }
  }

  // ✅ FIX: Safe analytics URL detection
  private getAnalyticsUrl(): string | null {
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_ANALYTICS_URL) {
      return process.env.REACT_APP_ANALYTICS_URL;
    }
    return null;
  }

  // Track user session duration
  startSession(): void {
    const startTime = Date.now();
    
    // Track when user leaves the page
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        const duration = Date.now() - startTime;
        this.trackTimeOnPage(Math.round(duration / 1000)); // Convert to seconds
      });
    }
  }

  // Initialize scroll tracking
  initializeScrollTracking(): void {
    if (typeof window === 'undefined') return;

    let maxScroll = 0;
    let scrollTimeout: NodeJS.Timeout;

    window.addEventListener('scroll', () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollPercentage > maxScroll) {
        maxScroll = scrollPercentage;
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.trackScrollDepth(maxScroll);
        }, 1000); // Debounce scroll events
      }
    }, { passive: true });
  }
}

// Extend window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default new AnalyticsService();
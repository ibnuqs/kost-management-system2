// src/pages/Landing/components/LandingLayout.tsx - POSITIONING FIX
import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import Navigation from './Navigation';
import { useModalState } from '../hooks';
import { analyticsService } from '../services';
import { 
  generatePageTitle, 
  generateMetaDescription, 
  injectStructuredData, 
  generateStructuredData 
} from '../utils/seo';
import { CONTACT_INFO, KOS_PROPERTY } from '../utils/constants';
import { generateWhatsAppUrl } from '../utils/helpers';

interface LandingLayoutProps {
  children: React.ReactNode;
  onBookingClick: () => void;
  onLoginClick?: () => void;
  className?: string;
}

export const LandingLayout: React.FC<LandingLayoutProps> = ({
  children,
  onBookingClick,
  onLoginClick,
  className = ''
}) => {
  const { closeAllModals } = useModalState();
  const [isVisible, setIsVisible] = useState(false);
  const maxScrollRef = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const removeStructuredDataRef = useRef<(() => void) | null>(null);

  // Memoized handlers
  const handleWhatsAppClick = useCallback(() => {
    try {
      const message = `Halo! Saya tertarik dengan ${KOS_PROPERTY.name}. Mohon informasinya.`;
      const whatsappUrl = generateWhatsAppUrl(CONTACT_INFO.whatsapp, message);
      window.open(whatsappUrl, '_blank');
      analyticsService.trackWhatsAppClick();
    } catch (error) {
      console.error('WhatsApp click error:', error);
    }
  }, []);

  const handlePhoneClick = useCallback(() => {
    try {
      window.open(`tel:${CONTACT_INFO.phone}`, '_self');
      analyticsService.trackPhoneCall();
    } catch (error) {
      console.error('Phone click error:', error);
    }
  }, []);

  const handleBookingClick = useCallback(() => {
    onBookingClick();
    analyticsService.trackButtonClick('booking_nav', 'navigation');
  }, [onBookingClick]);

  const handleLoginClick = useCallback(() => {
    if (onLoginClick) {
      onLoginClick();
      analyticsService.trackButtonClick('login_nav', 'navigation');
    }
  }, [onLoginClick]);

  // Initialize analytics and SEO
  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        // Reset body styles yang mungkin mengganggu
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';

        // Track page view
        analyticsService.trackPageView('/', 'Landing Page');
        analyticsService.startSession();
        analyticsService.initializeScrollTracking();

        // Set SEO meta tags
        const title = generatePageTitle();
        const description = generateMetaDescription();
        
        if (mounted) {
          document.title = title;
          
          // Update meta description
          let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
          if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
          }
          metaDescription.setAttribute('content', description);

          // Update viewport meta tag if not exists
          let viewport = document.querySelector('meta[name="viewport"]');
          if (!viewport) {
            viewport = document.createElement('meta');
            viewport.setAttribute('name', 'viewport');
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
            document.head.appendChild(viewport);
          }

          // Inject structured data
          const removeStructuredData = injectStructuredData(generateStructuredData());
          removeStructuredDataRef.current = removeStructuredData;

          // Show floating buttons after a delay
          setTimeout(() => {
            if (mounted) {
              setIsVisible(true);
            }
          }, 2000);
        }
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    initializeApp();

    return () => {
      mounted = false;
      if (removeStructuredDataRef.current) {
        removeStructuredDataRef.current();
      }
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      try {
        // Close modals on Escape
        if (event.key === 'Escape') {
          closeAllModals();
        }
        
        // Quick booking shortcut (Ctrl/Cmd + B)
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
          event.preventDefault();
          onBookingClick();
          analyticsService.trackEvent('keyboard_shortcut', 'engagement', 'quick_booking', 'ctrl_b');
        }

        // Quick WhatsApp shortcut (Ctrl/Cmd + W)
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'w') {
          event.preventDefault();
          handleWhatsAppClick();
          analyticsService.trackEvent('keyboard_shortcut', 'engagement', 'quick_whatsapp', 'ctrl_w');
        }
      } catch (error) {
        console.error('Keyboard shortcut error:', error);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeAllModals, onBookingClick, handleWhatsAppClick]);

  // Optimized scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      try {
        const { scrollY, innerHeight } = window;
        const { scrollHeight } = document.documentElement;
        
        if (scrollHeight <= innerHeight) return;
        
        const scrollPercentage = Math.round((scrollY / (scrollHeight - innerHeight)) * 100);

        if (scrollPercentage > maxScrollRef.current) {
          maxScrollRef.current = scrollPercentage;
          
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }
          
          scrollTimeoutRef.current = setTimeout(() => {
            if (maxScrollRef.current > 0 && maxScrollRef.current % 25 === 0) {
              analyticsService.trackScrollDepth(maxScrollRef.current);
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Scroll tracking error:', error);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={`min-h-screen bg-white ${className}`}
      style={{
        margin: 0,
        padding: 0,
        width: '100%',
        minHeight: '100vh',
        position: 'relative'
      }}
    >
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only fixed top-4 left-4 z-[60] bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Navigation - Ensure it's always visible */}
      <Navigation
        onBookingClick={handleBookingClick}
        onLoginClick={onLoginClick ? handleLoginClick : undefined}
      />

      {/* Main Content - NO padding-top to avoid double spacing */}
      <main 
        id="main-content" 
        className="relative focus:outline-none w-full" 
        tabIndex={-1}
        style={{
          margin: 0,
          padding: 0,
          width: '100%'
        }}
      >
        {children}
      </main>

      {/* Floating Quick Actions */}
      <div 
        className={`
          fixed bottom-6 right-6 z-40 space-y-3 transition-all duration-500
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        `}
        role="complementary"
        aria-label="Quick contact actions"
      >
        {/* WhatsApp Float Button */}
        <button
          onClick={handleWhatsAppClick}
          className="group relative w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          aria-label={`Chat WhatsApp dengan ${KOS_PROPERTY.name}`}
          title="Chat via WhatsApp"
        >
          <MessageCircle 
            size={24} 
            className="group-hover:scale-110 transition-transform duration-200" 
          />
          
          {/* Tooltip */}
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            Chat WhatsApp
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
          </div>
        </button>

        {/* Phone Float Button */}
        <button
          onClick={handlePhoneClick}
          className="group relative w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`Telepon ${KOS_PROPERTY.name} di ${CONTACT_INFO.phone}`}
          title="Hubungi via telepon"
        >
          <Phone 
            size={20} 
            className="group-hover:scale-110 transition-transform duration-200" 
          />
          
          {/* Tooltip */}
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            {CONTACT_INFO.phone}
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
          </div>
        </button>
      </div>

      {/* Loading indicator for slow connections */}
      <noscript>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center max-w-sm mx-4 shadow-xl">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900">JavaScript Required</h2>
            <p className="text-gray-600 mb-4">
              Please enable JavaScript to view this website properly and access all features.
            </p>
            <p className="text-sm text-gray-500">
              For the best experience, please update your browser and enable JavaScript.
            </p>
          </div>
        </div>
      </noscript>

      {/* Performance and SEO optimizations - Safe JSON embedding */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": generatePageTitle(),
          "description": generateMetaDescription(),
          "url": typeof window !== 'undefined' ? window.location.href : '',
          "mainEntity": {
            "@type": "LodgingBusiness",
            "name": KOS_PROPERTY.name,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": KOS_PROPERTY.location.district,
              "addressCountry": "ID"
            },
            "telephone": CONTACT_INFO.phone
          }
        })}
      </script>
    </div>
  );
};

export default LandingLayout;
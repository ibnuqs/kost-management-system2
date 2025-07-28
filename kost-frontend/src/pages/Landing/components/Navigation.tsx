import React, { useState, useCallback } from 'react';
import { Menu, X, Phone, MessageCircle, Calendar, LogIn } from 'lucide-react';

interface NavigationProps {
  onBookingClick: () => void;
  onLoginClick?: () => void;
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  onBookingClick,
  onLoginClick,
  className = ''
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Simple scroll detection
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWhatsAppClick = () => {
    const message = 'Halo! Saya tertarik dengan Potuna Kos. Bisa minta informasi lebih lanjut?';
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhoneClick = () => {
    window.open('tel:+6281234567890', '_self');
  };

  const handleNavClick = (href: string) => {
    const element = document.getElementById(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleBookingClick = () => {
    onBookingClick();
    setIsMobileMenuOpen(false);
  };

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    }
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigationItems = [
    { label: 'Beranda', href: 'hero' },
    { label: 'Fasilitas', href: 'features' },
    { label: 'Harga', href: 'pricing' },
    { label: 'Review', href: 'testimonials' },
  ];

  return (
    <>
      <nav 
        className={`
          fixed top-0 left-0 right-0 w-full h-16 z-50 transition-all duration-300
          ${isScrolled 
            ? 'bg-white shadow-lg text-blue-900' 
            : 'bg-white/95 backdrop-blur-sm text-blue-900 shadow-sm'
          }
          ${className}
        `}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-xl text-blue-900">
                POTUNA KOS
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              {navigationItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="text-blue-700 hover:text-blue-900 transition-colors font-medium"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={handleLoginClick}
                className="flex items-center gap-2 text-blue-700 hover:text-blue-900 px-3 py-2 rounded-lg font-medium transition-colors"
              >
                <LogIn size={16} />
                Login
              </button>
              <button
                onClick={onBookingClick}
                className="flex items-center gap-2 bg-orange-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-500 transition-colors"
              >
                <Calendar size={16} />
                Book Sekarang
              </button>
            </div>

            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-blue-700 hover:text-blue-900"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <div className="absolute top-16 left-0 right-0 bg-white shadow-lg">
            <div className="px-4 py-6">
              
              <div className="space-y-4 mb-6">
                {navigationItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className="block w-full text-left py-3 px-4 text-blue-700 hover:bg-blue-50 hover:text-blue-900 rounded-lg transition-colors font-medium"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={handlePhoneClick}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-teal-400/20 text-teal-600 rounded-lg hover:bg-teal-400/30 transition-colors"
                >
                  <Phone size={18} />
                  <span className="font-medium">Call</span>
                </button>

                <button
                  onClick={handleWhatsAppClick}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-teal-400/20 text-teal-600 rounded-lg hover:bg-teal-400/30 transition-colors"
                >
                  <MessageCircle size={18} />
                  <span className="font-medium">WhatsApp</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={handleLoginClick}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </button>
                <button
                  onClick={handleBookingClick}
                  className="flex items-center justify-center gap-2 bg-orange-400 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-500 transition-colors"
                >
                  <Calendar size={18} />
                  <span>Book</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
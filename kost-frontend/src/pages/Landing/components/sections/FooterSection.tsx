import React from 'react';
import { 
  MapPin, Phone, Mail, MessageCircle, Facebook, Instagram, 
  Heart, ExternalLink, ArrowUp, Calendar 
} from 'lucide-react';

interface FooterSectionProps {
  onBookingClick: () => void;
  className?: string;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  onBookingClick,
  className = ''
}) => {
  const currentYear = new Date().getFullYear();

  const handleWhatsAppClick = () => {
    const message = 'Halo! Saya ingin bertanya tentang Potuna Kos';
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: 'Beranda', href: '#hero' },
    { name: 'Fasilitas', href: '#features' },
    { name: 'Harga Kamar', href: '#pricing' },
    { name: 'Testimoni', href: '#testimonials' },
  ];

  const roomLinks = [
    { name: 'Kamar Standard', href: '#pricing' },
    { name: 'Kamar Deluxe', href: '#pricing' },
  ];

  return (
    <footer className={`bg-blue-900 text-white ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4">POTUNA KOS</h3>
            <p className="text-blue-200 mb-6 leading-relaxed">
              Kos nyaman dan strategis di Jagakarsa, Jakarta Selatan. Hunian terpercaya untuk mahasiswa dan pekerja.
            </p>
            
            {/* Social Media */}
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-teal-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-teal-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-teal-400 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-blue-200 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Room Types */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Tipe Kamar</h4>
            <ul className="space-y-3">
              {roomLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-blue-200 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Hubungi Kami</h4>
            <div className="space-y-4">
              
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-teal-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    Jalan M Khafi I, Gg. SD H. Simin No.91, RT.2/RW.4, Jagakarsa, Jakarta Selatan 12620
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={20} className="text-teal-400" />
                <a 
                  href="tel:+6281234567890"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  +62 812-3456-7890
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={20} className="text-teal-400" />
                <a 
                  href="mailto:info@potunakos.com"
                  className="text-blue-200 hover:text-white transition-colors break-all"
                >
                  info@potunakos.com
                </a>
              </div>

              <div className="flex items-center gap-3">
                <MessageCircle size={20} className="text-teal-400" />
                <button 
                  onClick={handleWhatsAppClick}
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  WhatsApp 24/7
                </button>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="mt-6 p-4 bg-blue-800 rounded-lg">
              <h5 className="font-semibold mb-2">Jam Operasional</h5>
              <div className="text-sm text-blue-200 space-y-1">
                <div>Senin - Jumat: 08:00 - 17:00</div>
                <div>Sabtu - Minggu: 09:00 - 15:00</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section in Footer */}
        <div className="py-8 border-t border-slate-800">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Masih ada pertanyaan?</h3>
            <p className="text-blue-200 mb-6">Tim kami siap membantu Anda 24/7</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onBookingClick}
                className="flex items-center justify-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                <Calendar size={18} />
                Booking Sekarang
              </button>
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center justify-center gap-2 border border-teal-400 text-teal-400 hover:bg-blue-800 px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                <MessageCircle size={18} />
                Chat WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-blue-800 flex flex-col md:flex-row justify-between items-center">
          <div className="text-blue-300 text-sm mb-4 md:mb-0">
            <p className="flex items-center gap-1">
              © {currentYear} POTUNA KOS. Made with 
              <Heart size={16} className="text-red-500 mx-1" fill="currentColor" />
              for comfortable living
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="p-2 bg-blue-800 rounded-full hover:bg-teal-400 transition-colors"
              aria-label="Back to top"
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
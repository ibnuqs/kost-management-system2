import React from 'react';
import { Phone, MessageCircle, Mail, MapPin, Clock, Star, Calendar, Home } from 'lucide-react';

interface CTASectionProps {
  onBookingClick: () => void;
  onContactClick: () => void;
  className?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
  onBookingClick,
  onContactClick,
  className = ''
}) => {
  const handleWhatsAppClick = () => {
    const message = 'Halo! Saya tertarik untuk mengetahui lebih lanjut tentang Potuna Kos. Mohon informasinya. Terima kasih!';
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhoneClick = () => {
    window.open('tel:+6281234567890', '_self');
  };

  const handleEmailClick = () => {
    window.open('mailto:info@potunakos.com', '_self');
  };

  const handleDirectionsClick = () => {
    window.open('https://maps.google.com', '_blank');
  };

  return (
    <section id="cta" className={`py-16 lg:py-24 bg-gradient-to-br from-blue-600 to-blue-800 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center text-white mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Siap Pindah ke Hunian Impian Anda?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Jangan tunggu lagi! Kamar terbatas dan peminat sangat tinggi. 
            Segera booking untuk mendapatkan kamar terbaik.
          </p>
          
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
            <Star className="text-yellow-300" size={20} fill="currentColor" />
            <span className="font-semibold">Hubungi untuk info ketersediaan kamar</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={onBookingClick}
              className="flex items-center justify-center gap-2 bg-orange-400 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-500 transition-colors duration-200 shadow-lg"
            >
              <Calendar size={20} />
              Booking Sekarang
            </button>
            
            <button
              onClick={handleWhatsAppClick}
              className="flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-200"
            >
              <MessageCircle size={20} />
              Chat WhatsApp
            </button>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div 
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white text-center hover:bg-white/20 transition-all duration-300 cursor-pointer"
            onClick={handleWhatsAppClick}
          >
            <div className="w-12 h-12 bg-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={24} />
            </div>
            <h3 className="font-semibold mb-2">WhatsApp</h3>
            <p className="text-white/80 text-sm mb-3">Respon cepat 24/7</p>
            <p className="font-mono text-sm">+62 812-3456-7890</p>
          </div>

          <div 
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white text-center hover:bg-white/20 transition-all duration-300 cursor-pointer"
            onClick={handlePhoneClick}
          >
            <div className="w-12 h-12 bg-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone size={24} />
            </div>
            <h3 className="font-semibold mb-2">Telepon</h3>
            <p className="text-white/80 text-sm mb-3">Jam kerja tersedia</p>
            <p className="font-mono text-sm">+62 812-3456-7890</p>
          </div>

          <div 
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white text-center hover:bg-white/20 transition-all duration-300 cursor-pointer"
            onClick={handleEmailClick}
          >
            <div className="w-12 h-12 bg-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={24} />
            </div>
            <h3 className="font-semibold mb-2">Email</h3>
            <p className="text-white/80 text-sm mb-3">Untuk inquiry detail</p>
            <p className="text-sm break-all">info@potunakos.com</p>
          </div>

          <div 
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white text-center hover:bg-white/20 transition-all duration-300 cursor-pointer"
            onClick={handleDirectionsClick}
          >
            <div className="w-12 h-12 bg-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={24} />
            </div>
            <h3 className="font-semibold mb-2">Lokasi</h3>
            <p className="text-white/80 text-sm mb-3">Kunjungi langsung</p>
            <p className="text-sm">Jl. M Khafi I, Gg. SD H. Simin No.91, Jagakarsa</p>
          </div>
        </div>

        {/* Operating Hours & Additional Info */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Clock size={24} />
              <h3 className="text-xl font-semibold">Jam Operasional</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Senin - Jumat</span>
                <span className="font-semibold">08:00 - 17:00</span>
              </div>
              <div className="flex justify-between">
                <span>Sabtu - Minggu</span>
                <span className="font-semibold">09:00 - 15:00</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-sm text-white/80">
                  WhatsApp tersedia 24/7 untuk emergency
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Aksi Cepat</h3>
            <div className="space-y-3">
              <button
                onClick={onBookingClick}
                className="w-full flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Calendar size={20} />
                <span>Form Booking Online</span>
              </button>
              
              <button
                onClick={onContactClick}
                className="w-full flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <MessageCircle size={20} />
                <span>Tanya Jawab</span>
              </button>
              
              <button
                onClick={handleDirectionsClick}
                className="w-full flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <MapPin size={20} />
                <span>Lihat di Maps</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-16 text-white">
          <p className="text-lg mb-4 flex items-center justify-center gap-2">
            <Home size={20} />
            <strong>Rumah kedua yang nyaman menanti Anda</strong> 
            <Home size={20} />
          </p>
          <p className="text-blue-100">
            Bergabunglah dengan 100+ mahasiswa yang sudah merasakan kenyamanan tinggal di sini
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
import React from 'react';
import { Star, Users, MessageCircle } from 'lucide-react';

interface TestimonialsSectionProps {
  className?: string;
}

// Removed fake testimonials - will be replaced with real ones when available

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  className = ''
}) => {

  return (
    <section id="testimonials" className={`py-16 lg:py-24 bg-blue-50 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-4">
            Mengapa Memilih Potuna Kos?
          </h2>
          <p className="text-lg text-blue-700 max-w-2xl mx-auto">
            Keunggulan yang membuat penghuni nyaman tinggal di sini
          </p>
        </div>

        {/* Keunggulan */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200 text-center">
            <div className="w-12 h-12 bg-teal-400/20 text-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Lokasi Strategis</h3>
            <p className="text-blue-700">Dekat dengan kampus dan fasilitas umum di Jakarta Selatan</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200 text-center">
            <div className="w-12 h-12 bg-teal-400/20 text-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Pengelolaan Profesional</h3>
            <p className="text-blue-700">Dikelola dengan baik untuk kenyamanan bersama</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200 text-center">
            <div className="w-12 h-12 bg-teal-400/20 text-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Layanan Responsif</h3>
            <p className="text-blue-700">Tim pengelola siap membantu kebutuhan penghuni</p>
          </div>
        </div>

        {/* Simple CTA */}
        <div className="text-center bg-blue-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            Tertarik Tinggal di Sini?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Hubungi kami untuk informasi lebih lanjut dan jadwalkan kunjungan
          </p>
          <button className="bg-orange-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-500 transition-colors duration-200">
            Hubungi Kami
          </button>
        </div>
      </div>
    </section>
  );
};
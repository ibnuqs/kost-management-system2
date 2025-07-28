import React from 'react';
import { Check, Star, MessageCircle } from 'lucide-react';
import { RoomType } from '../../types';

// Simple pricing card component
const SimplePricingCard: React.FC<{
  roomType: RoomType;
  onBookNow: (roomType: RoomType) => void;
  onViewDetails: (roomType: RoomType) => void;
}> = ({ roomType, onBookNow, onViewDetails }) => {
  const isAvailable = roomType.available > 0;
  
  return (
    <div className={`
      relative bg-white rounded-xl shadow-sm border-2 transition-all duration-200
      ${roomType.featured 
        ? 'border-blue-500 shadow-lg' 
        : 'border-slate-200 hover:border-blue-300'
      }
    `}>
      {roomType.featured && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Star size={14} fill="currentColor" />
            Populer
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {roomType.name}
          </h3>
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="text-2xl font-bold text-blue-600">
              Hubungi untuk Harga
            </span>
          </div>
          <p className="text-sm text-slate-600">
            Harga bersaing sesuai kondisi pasar
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="font-semibold text-slate-900">{roomType.size}</div>
            <div className="text-slate-600">Ukuran</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="font-semibold text-slate-900">{roomType.capacity} orang</div>
            <div className="text-slate-600">Kapasitas</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-center p-3 rounded-lg text-sm bg-blue-50 text-blue-700">
            <div className="font-semibold">
              Informasi Ketersediaan
            </div>
            <div className="text-xs mt-1">
              Hubungi kami untuk cek kamar kosong
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-slate-900 mb-3 text-sm">Fasilitas:</h4>
          <ul className="space-y-2">
            {roomType.facilities.slice(0, 4).map((facility, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">{facility}</span>
              </li>
            ))}
            {roomType.facilities.length > 4 && (
              <li className="text-sm text-blue-600 font-medium">
                +{roomType.facilities.length - 4} fasilitas lainnya
              </li>
            )}
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onBookNow(roomType)}
            className="w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-200 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Tanya Harga & Booking
          </button>

          <button
            onClick={() => onViewDetails(roomType)}
            className="w-full py-3 px-4 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
          >
            Info Lebih Lanjut
          </button>
        </div>
      </div>
    </div>
  );
};

interface PricingSectionProps {
  onBookNow: (roomType: RoomType) => void;
  onViewDetails: (roomType: RoomType) => void;
  onContactClick: () => void;
  className?: string;
}

// Room types data - prices to be confirmed with actual rates
const roomTypes: RoomType[] = [
  {
    id: '1',
    name: 'Kamar Standard',
    price: 0, // Harga akan disesuaikan sesuai kondisi pasar
    deposit: 0, // Biasanya 1x sewa bulanan
    size: 'Ukuran standar',
    capacity: 1,
    available: 0, // Akan diupdate sesuai ketersediaan real
    total: 0,
    facilities: ['Kasur', 'Lemari', 'Meja', 'WiFi', 'Listrik'],
    description: 'Kamar dengan fasilitas dasar untuk kenyamanan sehari-hari',
    featured: false,
    images: []
  },
  {
    id: '2',
    name: 'Kamar Deluxe',
    price: 0, // Harga akan disesuaikan sesuai kondisi pasar
    deposit: 0, // Biasanya 1x sewa bulanan
    size: 'Lebih luas',
    capacity: 1,
    available: 0, // Akan diupdate sesuai ketersediaan real
    total: 0,
    facilities: ['Kasur', 'Lemari', 'Meja Kerja', 'AC', 'WiFi', 'Kamar Mandi Dalam'],
    description: 'Kamar dengan fasilitas lebih lengkap dan nyaman',
    featured: true,
    images: []
  }
];

export const PricingSection: React.FC<PricingSectionProps> = ({
  onBookNow,
  onViewDetails,
  onContactClick,
  className = ''
}) => {
  return (
    <section id="pricing" className={`py-16 lg:py-24 bg-white ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Pilihan Harga Kamar
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Berbagai pilihan kamar dengan harga terjangkau dan fasilitas lengkap
          </p>
          
          <div className="inline-flex items-center gap-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <span className="text-slate-700">Butuh konsultasi?</span>
            <button
              onClick={onContactClick}
              className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200"
            >
              <MessageCircle size={16} />
              Hubungi Kami
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {roomTypes.map((roomType) => (
            <SimplePricingCard
              key={roomType.id}
              roomType={roomType}
              onBookNow={onBookNow}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>

        {/* Simple Info */}
        <div className="bg-slate-50 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            Informasi Umum
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm max-w-2xl mx-auto">
            <div className="bg-white p-4 rounded-lg">
              <div className="font-semibold text-slate-900">Sistem Pembayaran</div>
              <div className="text-slate-600">Bulanan, fleksibel</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="font-semibold text-slate-900">Informasi Lengkap</div>
              <div className="text-slate-600">Hubungi kami</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
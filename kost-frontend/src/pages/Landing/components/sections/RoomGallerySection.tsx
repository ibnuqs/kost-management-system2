// src/pages/Landing/components/sections/RoomGallerySection.tsx - Simple Version
import React from 'react';
import { Camera } from 'lucide-react';

interface RoomGallerySectionProps {
  className?: string;
}

export const RoomGallerySection: React.FC<RoomGallerySectionProps> = ({
  className = ''
}) => {
  const rooms = [
    {
      name: "Kamar Standard",
      price: "1jt",
      description: "WiFi, Kasur, Lemari, Kamar Mandi Luar"
    },
    {
      name: "Kamar Premium", 
      price: "1.5jt",
      description: "AC, WiFi, Kasur, Lemari, Kamar Mandi Dalam",
      popular: true
    }
  ];

  return (
    <section id="gallery" className={`py-12 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Pilihan Kamar</h2>
          <p className="text-gray-600">Semua kamar bersih dan nyaman</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {rooms.map((room, index) => (
            <div key={index} className="text-center">
              
              {room.popular && (
                <div className="inline-block bg-emerald-500 text-white px-3 py-1 text-xs rounded-full mb-3">
                  TERPOPULER
                </div>
              )}
              
              <div className="h-48 bg-gray-200 mb-4 flex items-center justify-center">
                <Camera size={24} className="text-gray-500" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">{room.name}</h3>
              <p className="text-gray-600 mb-3">{room.description}</p>
              <div className="text-2xl font-bold text-emerald-600">Rp {room.price}/bulan</div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="bg-emerald-500 text-white px-6 py-2 rounded font-semibold hover:bg-emerald-600">
            Hubungi Kami
          </button>
        </div>
      </div>
    </section>
  );
};
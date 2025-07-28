// src/pages/Landing/components/ui/PricingCard.tsx - FIXED
import React from 'react';
import { Check, Star } from 'lucide-react';
import { RoomType } from '../../types';
import { formatPrice } from '../../utils/helpers';

interface PricingCardProps {
  roomType: RoomType;
  onBookNow: (roomType: RoomType) => void;
  onViewDetails: (roomType: RoomType) => void;
  className?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  roomType,
  onBookNow,
  onViewDetails,
  className = ''
}) => {
  const isAvailable = roomType.available > 0;

  return (
    <div
      className={`
        relative bg-white rounded-xl shadow-sm border-2 transition-all duration-300
        hover:scale-105 transform
        ${roomType.featured 
          ? 'border-blue-500 shadow-lg scale-105' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
        }
        ${className}
      `}
    >
      {roomType.featured && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
            <Star size={14} fill="currentColor" />
            Paling Populer
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {roomType.name}
          </h3>
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-3xl font-bold text-blue-600">
              {formatPrice(roomType.price)}
            </span>
            <span className="text-gray-500 text-sm">/bulan</span>
          </div>
          <p className="text-sm text-gray-600">
            Deposit: {formatPrice(roomType.deposit)}
          </p>
        </div>

        {/* Room Info */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900">{roomType.size}</div>
              <div className="text-gray-600">Ukuran</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900">{roomType.capacity} orang</div>
              <div className="text-gray-600">Kapasitas</div>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="mb-6">
          <div className={`
            text-center p-3 rounded-lg
            ${isAvailable 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
            }
          `}>
            <div className="font-semibold">
              {isAvailable 
                ? `${roomType.available} kamar tersedia` 
                : 'Tidak tersedia'
              }
            </div>
            <div className="text-sm opacity-75">
              dari {roomType.total} kamar total
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Fasilitas:</h4>
          <ul className="space-y-2">
            {roomType.facilities.slice(0, 6).map((facility, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{facility}</span>
              </li>
            ))}
            {roomType.facilities.length > 6 && (
              <li className="text-sm text-blue-600 font-medium">
                +{roomType.facilities.length - 6} fasilitas lainnya
              </li>
            )}
          </ul>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            {roomType.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => onBookNow(roomType)}
            disabled={!isAvailable}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200
              hover:scale-105 active:scale-95 transform
              ${isAvailable
                ? roomType.featured
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isAvailable ? 'Booking Sekarang' : 'Tidak Tersedia'}
          </button>

          <button
            onClick={() => onViewDetails(roomType)}
            className="w-full py-3 px-4 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 hover:scale-105 active:scale-95 transform"
          >
            Lihat Detail
          </button>
        </div>
      </div>

      {/* Featured overlay */}
      {roomType.featured && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-xl pointer-events-none" />
      )}
    </div>
  );
};

export default PricingCard;
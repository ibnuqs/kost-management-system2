// src/pages/Landing/components/ui/TestimonialCard.tsx - FIXED
import React from 'react';
import { Star, Quote } from 'lucide-react';
import { TestimonialItem } from '../../types';
import { getImageUrl } from '../../utils/helpers';

interface TestimonialCardProps {
  testimonial: TestimonialItem;
  className?: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  className = ''
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={`
          ${index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
          }
        `}
      />
    ));
  };

  return (
    <div
      className={`
        group bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative
        transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:scale-105
        transform
        ${className}
      `}
    >
      {/* Quote Icon */}
      <div className="mb-4">
        <Quote className="text-blue-600 opacity-60" size={32} />
      </div>

      {/* Content */}
      <div className="mb-6">
        <p className="text-gray-700 leading-relaxed italic">
          "{testimonial.content}"
        </p>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-4">
        {renderStars(testimonial.rating)}
      </div>

      {/* Author Info */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          <img
            src={getImageUrl(testimonial.avatar)}
            alt={testimonial.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=3b82f6&color=fff&size=48`;
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">
            {testimonial.name}
          </h4>
          <p className="text-sm text-gray-600 truncate">
            {testimonial.role}
          </p>
          <p className="text-xs text-blue-600 font-medium">
            Tinggal {testimonial.duration}
          </p>
        </div>
      </div>

      {/* Decorative border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default TestimonialCard;
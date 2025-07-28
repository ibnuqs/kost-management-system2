// src/pages/Landing/components/modals/GalleryModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { GalleryModalProps } from '../../types';
import { getImageUrl } from '../../utils/helpers';
import { slideInFromBottom, fadeIn } from '../../utils/animations';
import { analyticsService } from '../../services';

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  images,
  startIndex = 0,
  category = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(startIndex);
      setZoom(1);
      setRotation(0);
      setIsLoading(true);
      setImageError(false);
      analyticsService.trackModalOpen('gallery');
    }
  }, [isOpen, startIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNext();
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case '+':
        case '=':
          event.preventDefault();
          handleZoomIn();
          break;
        case '-':
          event.preventDefault();
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          event.preventDefault();
          handleRotate();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const goToNext = useCallback(() => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
    setRotation(0);
    setIsLoading(true);
    setImageError(false);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
    setRotation(0);
    setIsLoading(true);
    setImageError(false);
  }, [images.length]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = async () => {
    if (!images[currentIndex]) return;

    try {
      const imageUrl = getImageUrl(images[currentIndex]);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `kos-image-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      analyticsService.trackEvent('image_download', 'engagement', 'download_gallery_image', category);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const imageUrl = getImageUrl(currentImage);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm" {...fadeIn}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-4 text-white">
          <h3 className="text-lg font-semibold">
            {category || 'Gallery'} ({currentIndex + 1} of {images.length})
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
            title="Zoom Out (- key)"
          >
            <ZoomOut size={20} />
          </button>
          
          <span className="text-white text-sm min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
            title="Zoom In (+ key)"
          >
            <ZoomIn size={20} />
          </button>

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            title="Rotate (R key)"
          >
            <RotateCw size={20} />
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            title="Download Image"
          >
            <Download size={20} />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            title="Close (Esc key)"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 text-white hover:bg-white/20 rounded-full transition-colors z-10"
            title="Previous Image (← key)"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 text-white hover:bg-white/20 rounded-full transition-colors z-10"
            title="Next Image (→ key)"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Main Image Container */}
      <div 
        className="absolute inset-0 flex items-center justify-center p-4 cursor-pointer"
        onClick={(e) => {
          // Close modal when clicking on background (not image)
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div 
          className="relative max-w-full max-h-full overflow-hidden"
          {...slideInFromBottom}
        >
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}

          {/* Error State */}
          {imageError && (
            <div className="flex items-center justify-center w-96 h-64 bg-gray-800 text-white">
              <div className="text-center">
                <X size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Failed to load image</p>
                <button
                  onClick={() => {
                    setImageError(false);
                    setIsLoading(true);
                  }}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Main Image */}
          {!imageError && (
            <img
              src={imageUrl}
              alt={`Gallery image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain cursor-zoom-in"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease-out'
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              onClick={(e) => {
                e.stopPropagation();
                if (zoom === 1) {
                  handleZoomIn();
                } else {
                  setZoom(1);
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Bottom Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center gap-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setZoom(1);
                  setRotation(0);
                  setIsLoading(true);
                  setImageError(false);
                }}
                className={`
                  flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                  ${index === currentIndex 
                    ? 'border-white scale-110' 
                    : 'border-transparent hover:border-white/50'
                  }
                `}
              >
                <img
                  src={getImageUrl(image)}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://picsum.photos/64/64?random=thumb${index}`;
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="absolute bottom-4 left-4 text-white text-xs opacity-70">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 space-y-1">
          <div>← → Navigate</div>
          <div>+ - Zoom</div>
          <div>R Rotate</div>
          <div>Esc Close</div>
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;
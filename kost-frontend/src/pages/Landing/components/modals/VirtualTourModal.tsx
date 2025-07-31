// src/pages/Landing/components/modals/VirtualTourModal.tsx
import React, { useEffect, useState } from 'react';
import { X, Play, Pause, RotateCcw, Maximize, Volume2, VolumeX, Mouse, Search, Smartphone, Keyboard } from 'lucide-react';
import { VirtualTourModalProps } from '../../types';
import { slideInFromBottom, fadeIn } from '../../utils/animations';
import { analyticsService } from '../../services';

export const VirtualTourModal: React.FC<VirtualTourModalProps> = ({
  isOpen,
  onClose,
  tourUrl,
  roomType = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Track modal open and virtual tour start
  useEffect(() => {
    if (isOpen) {
      analyticsService.trackModalOpen('virtual_tour');
      analyticsService.trackVirtualTour();
    }
  }, [isOpen]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Demo tour data - In real implementation, this would come from props or API
  const demoTours = {
    standard: {
      url: 'https://momento360.com/e/u/2d3f1a2b1c9e4f5a6b7c8d9e0f1a2b3c?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium',
      title: 'Virtual Tour - Kamar Standard'
    },
    deluxe: {
      url: 'https://momento360.com/e/u/3e4f2b3c2d0f5a6b7c8d9e0f1a2b3c4d?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium',
      title: 'Virtual Tour - Kamar Deluxe'
    },
    suite: {
      url: 'https://momento360.com/e/u/4f5a3c4d3e1a6b7c8d9e0f1a2b3c4d5e?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium',
      title: 'Virtual Tour - Suite Room'
    },
    common: {
      url: 'https://momento360.com/e/u/5a6b4d5e4f2b7c8d9e0f1a2b3c4d5e6f?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium',
      title: 'Virtual Tour - Area Bersama'
    }
  };

  // Use demo tour or provided URL
  const currentTour = demoTours[roomType as keyof typeof demoTours] || {
    url: tourUrl || demoTours.common.url,
    title: `Virtual Tour ${roomType ? `- ${roomType}` : '- Kos Putri Melati'}`
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In real implementation, you would control the 360 player
    analyticsService.trackEvent('virtual_tour_control', 'engagement', isPlaying ? 'pause' : 'play', roomType);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    // In real implementation, you would control the audio
    analyticsService.trackEvent('virtual_tour_control', 'engagement', isMuted ? 'unmute' : 'mute', roomType);
  };

  const handleReset = () => {
    // In real implementation, you would reset the 360 view
    analyticsService.trackEvent('virtual_tour_control', 'engagement', 'reset_view', roomType);
    // Reload iframe to reset position
    setIsLoading(true);
    const iframe = document.getElementById('virtual-tour-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = currentTour.url; // Reload with original URL
    }
  };

  const handleFullscreen = async () => {
    const container = document.getElementById('virtual-tour-container');
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        analyticsService.trackEvent('virtual_tour_control', 'engagement', 'enter_fullscreen', roomType);
      } else {
        await document.exitFullscreen();
        analyticsService.trackEvent('virtual_tour_control', 'engagement', 'exit_fullscreen', roomType);
      }
    } catch (error: unknown) {
      console.error('Fullscreen error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90" {...fadeIn}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-white">
          <h3 className="text-lg font-semibold">{currentTour.title}</h3>
          <p className="text-sm opacity-75">Gunakan mouse/touch untuk melihat sekeliling</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Play/Pause Control */}
          <button
            onClick={handlePlayPause}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          {/* Mute/Unmute Control */}
          <button
            onClick={handleMuteToggle}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {/* Reset View */}
          <button
            onClick={handleReset}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            title="Reset View"
          >
            <RotateCcw size={20} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            <Maximize size={20} />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            title="Close Virtual Tour"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main Tour Container */}
      <div 
        id="virtual-tour-container"
        className="absolute inset-0 flex items-center justify-center p-4"
        {...slideInFromBottom}
      >
        <div className="relative w-full h-full max-w-6xl max-h-[80vh] bg-black rounded-lg overflow-hidden">
          
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-lg">Loading Virtual Tour...</p>
                <p className="text-sm opacity-75">Please wait</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-10">
              <div className="text-center p-8">
                <X size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Virtual Tour Unavailable</h3>
                <p className="text-gray-300 mb-6">
                  Sorry, the virtual tour is currently unavailable. Please try again later or contact us for a live tour.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setHasError(false);
                      setIsLoading(true);
                    }}
                    className="block w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      // Open WhatsApp for live tour request
                      const message = `Halo! Virtual tour tidak dapat dimuat. Bisakah saya menjadwalkan kunjungan langsung untuk melihat ${roomType ? `kamar ${roomType}` : 'kos'}? Terima kasih!`;
                      const whatsappUrl = `https://wa.me/628123456789?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="block w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Request Live Tour via WhatsApp
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Virtual Tour Iframe */}
          {!hasError && (
            <iframe
              id="virtual-tour-iframe"
              src={currentTour.url}
              className="w-full h-full border-0"
              title={currentTour.title}
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              style={{ minHeight: '400px' }}
            />
          )}

          {/* Demo Notice */}
          {!hasError && !isLoading && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">💡 Demo Virtual Tour</p>
                  <p className="opacity-75">Ini adalah contoh virtual tour. Tour asli akan tersedia setelah implementasi.</p>
                </div>
                <button
                  onClick={() => {
                    const message = `Halo! Saya tertarik dengan virtual tour yang sesungguhnya untuk ${roomType ? `kamar ${roomType}` : 'Kos Putri Melati'}. Kapan bisa dijadwalkan? Terima kasih!`;
                    const whatsappUrl = `https://wa.me/628123456789?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors whitespace-nowrap"
                >
                  Request Real Tour
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-white text-xs opacity-70">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1">
            <Mouse size={14} />
            Drag to look around
          </div>
          <div className="flex items-center gap-1">
            <Search size={14} />
            Scroll to zoom
          </div>
          <div className="flex items-center gap-1">
            <Smartphone size={14} />
            Touch and drag on mobile
          </div>
          <div className="flex items-center gap-1">
            <Keyboard size={14} />
            Use arrow keys for navigation
          </div>
        </div>
      </div>

      {/* Room Type Selector */}
      <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-sm rounded-lg p-3">
        <p className="text-white text-sm font-medium mb-2">View Other Areas:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(demoTours).map(([key, tour]) => (
            <button
              key={key}
              onClick={() => {
                if (key !== roomType) {
                  // Reload with new tour
                  setIsLoading(true);
                  setHasError(false);
                  const iframe = document.getElementById('virtual-tour-iframe') as HTMLIFrameElement;
                  if (iframe) {
                    iframe.src = tour.url;
                  }
                  analyticsService.trackEvent('virtual_tour_navigation', 'engagement', 'change_room', key);
                }
              }}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                key === roomType || (!roomType && key === 'common')
                  ? 'bg-primary-600 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {key === 'common' ? 'Area Bersama' : 
               key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile-specific controls */}
      <div className="md:hidden absolute top-16 left-4 right-4 bg-black/30 backdrop-blur-sm rounded-lg p-3 text-white text-center text-sm">
        <p className="flex items-center justify-center gap-1">
          <Smartphone size={16} />
          Putar perangkat untuk pengalaman yang lebih baik
        </p>
      </div>
    </div>
  );
};
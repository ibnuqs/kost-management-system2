// src/pages/Landing/hooks/useModalState.ts
import { useState, useCallback } from 'react';

export interface ModalState {
  booking: boolean;
  gallery: boolean;
  virtualTour: boolean;
  contact: boolean;
}

export interface ModalOptions {
  roomType?: string;
  images?: string[];
  startIndex?: number;
  category?: string;
}

export const useModalState = () => {
  const [modals, setModals] = useState<ModalState>({
    booking: false,
    gallery: false,
    virtualTour: false,
    contact: false
  });

  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [galleryCategory, setGalleryCategory] = useState<string>('');

  const openModal = useCallback((modalName: keyof ModalState, options?: ModalOptions) => {
    // Handle modal-specific options
    if (modalName === 'booking' && options?.roomType) {
      setSelectedRoomType(options.roomType);
    }
    
    if (modalName === 'gallery' && options?.images) {
      setGalleryImages(options.images);
      setGalleryStartIndex(options.startIndex || 0);
      setGalleryCategory(options.category || '');
    }
    
    setModals(prev => ({
      ...prev,
      [modalName]: true
    }));
  }, []);

  const closeModal = useCallback((modalName: keyof ModalState) => {
    setModals(prev => ({
      ...prev,
      [modalName]: false
    }));
    
    // Reset modal-specific state when closing
    if (modalName === 'booking') {
      setSelectedRoomType(null);
    }
    
    if (modalName === 'gallery') {
      setGalleryImages([]);
      setGalleryStartIndex(0);
      setGalleryCategory('');
    }
  }, []);

  const closeAllModals = useCallback(() => {
    setModals({
      booking: false,
      gallery: false,
      virtualTour: false,
      contact: false
    });
    
    // Reset all modal-specific state
    setSelectedRoomType(null);
    setGalleryImages([]);
    setGalleryStartIndex(0);
    setGalleryCategory('');
  }, []);

  const isAnyModalOpen = Object.values(modals).some(isOpen => isOpen);

  return {
    modals,
    selectedRoomType,
    galleryImages,
    galleryStartIndex,
    galleryCategory,
    isAnyModalOpen,
    openModal,
    closeModal,
    closeAllModals
  };
};
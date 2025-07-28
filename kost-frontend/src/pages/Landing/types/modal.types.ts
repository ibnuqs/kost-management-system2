// src/pages/Landing/types/modal.types.ts - FIXED
import { RoomType } from './landing.types';
import { BookingFormData, ContactFormData } from './form.types';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface BookingModalProps extends ModalProps {
  // ✅ FIX: Change roomType to string | undefined instead of RoomType
  roomType?: string;
  onSubmitBooking: (data: BookingFormData) => void;
}

export interface GalleryModalProps extends ModalProps {
  images: string[];
  startIndex?: number;
  category?: string;
}

export interface VirtualTourModalProps extends ModalProps {
  tourUrl: string;
  // ✅ FIX: Change roomType to string | undefined instead of string
  roomType?: string;
}

export interface ContactModalProps extends ModalProps {
  onSubmitContact: (data: ContactFormData) => void;
}
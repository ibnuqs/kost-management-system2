// src/pages/Landing/types/form.types.ts
export interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  roomType: string;
  preferredDate: string;
  duration: number; // months
  message?: string;
}

export interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

export interface BookingInquiryData {
  name: string;
  phone: string;
  email: string;
  roomType: string;
  moveInDate: string;
  duration: number;
  budget: number;
  message?: string;
}
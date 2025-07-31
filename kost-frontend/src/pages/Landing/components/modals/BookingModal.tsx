// src/pages/Landing/components/modals/BookingModal.tsx - FIXED
import React, { useEffect, useMemo, useCallback } from 'react';
import { X, Calendar, User, Phone, Mail, MessageSquare, Home } from 'lucide-react';
import { AnimatedButton } from '../ui';
import { BookingModalProps, BookingFormData } from '../../types';
import { useLandingForm } from '../../hooks';
import { ROOM_TYPES } from '../../utils/constants';
import { validateName, validatePhone, validateEmail, validateRequired, validateDate, validateDuration } from '../../utils/validators';
import { formatPrice, generateBookingMessage, generateWhatsAppUrl } from '../../utils/helpers';
import { landingService, analyticsService } from '../../services';
import toast from 'react-hot-toast';

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  roomType,
  onSubmitBooking
}) => {
  // ✅ FIX: Memoize selected room to prevent re-creation
  const selectedRoom = useMemo(() => 
    roomType ? ROOM_TYPES.find(room => room.id === roomType) : ROOM_TYPES[0], 
    [roomType]
  );

  // ✅ FIX: Memoize initial values to prevent re-creation
  const initialValues: BookingFormData = useMemo(() => ({
    name: '',
    phone: '',
    email: '',
    roomType: selectedRoom?.id || '',
    preferredDate: '',
    duration: 6,
    message: ''
  }), [selectedRoom?.id]);

  // ✅ FIX: Memoize validators to prevent re-creation
  const validators = useMemo(() => ({
    name: validateName,
    phone: validatePhone,
    email: validateEmail,
    roomType: (value: string) => validateRequired(value, 'Tipe kamar'),
    preferredDate: validateDate,
    duration: validateDuration,
    message: () => null // Optional field
  }), []);

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValue
  } = useLandingForm(initialValues, validators);

  // ✅ FIX: Memoize selected room data
  const selectedRoomData = useMemo(() => 
    ROOM_TYPES.find(room => room.id === values.roomType), 
    [values.roomType]
  );

  // ✅ FIX: Update room type when prop changes - use useEffect properly
  useEffect(() => {
    if (roomType && roomType !== values.roomType) {
      setValue('roomType', roomType);
    }
  }, [roomType, setValue, values.roomType]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        reset();
      }, 300); // Delay reset to avoid visual glitch
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, reset]);

  // Track modal open
  useEffect(() => {
    if (isOpen) {
      analyticsService.trackModalOpen('booking');
    }
  }, [isOpen]);

  const handleFormSubmit = useCallback(async (formData: BookingFormData) => {
    try {
      // Submit to service
      const response = await landingService.submitBookingInquiry(formData);
      
      if (response.success) {
        toast.success(response.message);
        
        // Generate WhatsApp message
        if (selectedRoomData) {
          const whatsappMessage = generateBookingMessage(formData, selectedRoomData);
          const whatsappUrl = generateWhatsAppUrl('628123456789', whatsappMessage);
          
          // Ask user if they want to continue to WhatsApp
          const continueToWhatsApp = window.confirm(
            'Booking inquiry berhasil dikirim! Apakah Anda ingin melanjutkan ke WhatsApp untuk konfirmasi langsung?'
          );
          
          if (continueToWhatsApp) {
            window.open(whatsappUrl, '_blank');
          }
        }
        
        // Call parent callback
        onSubmitBooking(formData);
        
        // Track conversion
        analyticsService.trackBookingInquiry(selectedRoomData?.name || 'unknown', 'booking_modal');
        
        // Close modal
        onClose();
      } else {
        toast.error('Gagal mengirim booking inquiry. Silakan coba lagi.');
      }
    } catch (error: unknown) {
      console.error('Booking submission error:', error);
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    }
  }, [selectedRoomData, onSubmitBooking, onClose]);

  const handleDirectWhatsApp = useCallback(() => {
    if (selectedRoomData) {
      const message = `Halo! Saya tertarik dengan ${selectedRoomData.name} di Kos Putri Melati. Mohon informasi lebih lanjut mengenai ketersediaan dan proses booking. Terima kasih!`;
      const whatsappUrl = generateWhatsAppUrl('628123456789', message);
      window.open(whatsappUrl, '_blank');
      analyticsService.trackWhatsAppClick();
    }
  }, [selectedRoomData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Booking Kamar</h2>
                <p className="text-gray-600">Isi form untuk reservasi kamar</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Tutup modal"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Selected Room Info */}
            {selectedRoomData && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <Home className="text-blue-600" size={20} />
                  <h3 className="font-semibold text-blue-900">{selectedRoomData.name}</h3>
                  {selectedRoomData.featured && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">Popular</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Harga: </span>
                    <span className="font-semibold">{formatPrice(selectedRoomData.price)}/bulan</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ukuran: </span>
                    <span className="font-semibold">{selectedRoomData.size}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tersedia: </span>
                    <span className={`font-semibold ${selectedRoomData.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedRoomData.available > 0 ? `${selectedRoomData.available} kamar` : 'Tidak tersedia'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Deposit: </span>
                    <span className="font-semibold">{formatPrice(selectedRoomData.deposit)}</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(handleFormSubmit);
            }} className="space-y-6">
              
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pribadi</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User size={16} className="inline mr-1" />
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={values.name}
                      onChange={handleChange('name')}
                      onBlur={handleBlur('name')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Masukkan nama lengkap"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} className="inline mr-1" />
                      Nomor WhatsApp *
                    </label>
                    <input
                      type="tel"
                      value={values.phone}
                      onChange={handleChange('phone')}
                      onBlur={handleBlur('phone')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="08123456789"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={values.email}
                    onChange={handleChange('email')}
                    onBlur={handleBlur('email')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="email@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Detail Booking</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Home size={16} className="inline mr-1" />
                      Tipe Kamar *
                    </label>
                    <select
                      value={values.roomType}
                      onChange={handleChange('roomType')}
                      onBlur={handleBlur('roomType')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.roomType ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Pilih tipe kamar</option>
                      {ROOM_TYPES.map((room) => (
                        <option key={room.id} value={room.id} disabled={room.available === 0}>
                          {room.name} - {formatPrice(room.price)}/bulan {room.available === 0 ? '(Tidak tersedia)' : ''}
                        </option>
                      ))}
                    </select>
                    {errors.roomType && <p className="text-red-500 text-sm mt-1">{errors.roomType}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={16} className="inline mr-1" />
                      Tanggal Mulai *
                    </label>
                    <input
                      type="date"
                      value={values.preferredDate}
                      onChange={handleChange('preferredDate')}
                      onBlur={handleBlur('preferredDate')}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.preferredDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.preferredDate && <p className="text-red-500 text-sm mt-1">{errors.preferredDate}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durasi Sewa (bulan) *
                  </label>
                  <select
                    value={values.duration}
                    onChange={handleChange('duration')}
                    onBlur={handleBlur('duration')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.duration ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {Array.from({ length: 24 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>
                        {month} bulan {month >= 12 && `(${Math.floor(month / 12)} tahun)`}
                      </option>
                    ))}
                  </select>
                  {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                </div>
              </div>

              {/* Additional Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare size={16} className="inline mr-1" />
                  Pesan Tambahan
                </label>
                <textarea
                  value={values.message}
                  onChange={handleChange('message')}
                  onBlur={handleBlur('message')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ceritakan sedikit tentang diri Anda atau pertanyaan khusus..."
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <AnimatedButton
                  type="submit"
                  loading={isSubmitting}
                  disabled={selectedRoomData?.available === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  icon="Send"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Booking Inquiry'}
                </AnimatedButton>

                <AnimatedButton
                  type="button"
                  variant="outline"
                  onClick={handleDirectWhatsApp}
                  className="border-green-500 text-green-600 hover:bg-green-50"
                  icon="MessageCircle"
                >
                  Chat WhatsApp
                </AnimatedButton>
              </div>

              {/* Disclaimer */}
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="mb-1">* Booking inquiry ini bukan konfirmasi reservasi final.</p>
                <p>* Tim kami akan menghubungi Anda dalam 1x24 jam untuk konfirmasi dan proses selanjutnya.</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
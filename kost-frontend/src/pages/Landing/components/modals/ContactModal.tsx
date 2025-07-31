// src/pages/Landing/components/modals/ContactModal.tsx - FIXED
import React, { useEffect, useMemo, useCallback } from 'react';
import { X, User, Mail, Phone, MessageSquare, MessageCircle } from 'lucide-react';
import { AnimatedButton } from '../ui';
import { ContactModalProps, ContactFormData } from '../../types';
import { useLandingForm } from '../../hooks';
import { validateName, validateEmail, validatePhone, validateSubject, validateMessage } from '../../utils/validators';
import { generateContactMessage, generateWhatsAppUrl } from '../../utils/helpers';
import { landingService, analyticsService } from '../../services';
import { CONTACT_INFO } from '../../utils/constants';
import toast from 'react-hot-toast';

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSubmitContact
}) => {
  // ✅ FIX: Memoize initial values to prevent re-creation
  const initialValues: ContactFormData = useMemo(() => ({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  }), []);

  // ✅ FIX: Memoize validators to prevent re-creation
  const validators = useMemo(() => ({
    name: validateName,
    phone: validatePhone,
    email: validateEmail,
    subject: validateSubject,
    message: (value: string) => validateMessage(value, true) // Required
  }), []);

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  } = useLandingForm(initialValues, validators);

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
      analyticsService.trackModalOpen('contact');
    }
  }, [isOpen]);

  const handleFormSubmit = useCallback(async (formData: ContactFormData) => {
    try {
      // Submit to service
      const response = await landingService.submitContactForm(formData);
      
      if (response.success) {
        toast.success(response.message);
        
        // Ask user if they want to continue to WhatsApp
        const continueToWhatsApp = window.confirm(
          'Pesan berhasil dikirim! Apakah Anda ingin melanjutkan ke WhatsApp untuk respon yang lebih cepat?'
        );
        
        if (continueToWhatsApp) {
          const whatsappMessage = generateContactMessage(formData.name, formData.subject);
          const whatsappUrl = generateWhatsAppUrl(CONTACT_INFO.whatsapp, whatsappMessage);
          window.open(whatsappUrl, '_blank');
        }
        
        // Call parent callback
        onSubmitContact(formData);
        
        // Track conversion
        analyticsService.trackContactSubmission(formData.subject);
        
        // Close modal
        onClose();
      } else {
        toast.error('Gagal mengirim pesan. Silakan coba lagi.');
      }
    } catch (error: unknown) {
      console.error('Contact submission error:', error);
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    }
  }, [onSubmitContact, onClose]);

  const handleDirectWhatsApp = useCallback(() => {
    const message = values.name 
      ? `Halo! Saya ${values.name}. ${values.subject ? `Saya ingin bertanya tentang ${values.subject}.` : 'Saya ingin bertanya tentang Kos Putri Melati.'} ${values.message ? `\n\n${values.message}` : ''}`
      : 'Halo! Saya ingin bertanya tentang Kos Putri Melati.';
    
    const whatsappUrl = generateWhatsAppUrl(CONTACT_INFO.whatsapp, message);
    window.open(whatsappUrl, '_blank');
    analyticsService.trackWhatsAppClick();
  }, [values.name, values.subject, values.message]);

  // ✅ FIX: Memoize common subjects to prevent re-creation
  const commonSubjects = useMemo(() => [
    'Informasi Kamar',
    'Harga dan Pembayaran',
    'Fasilitas',
    'Lokasi dan Transportasi',
    'Syarat dan Ketentuan',
    'Jadwal Kunjungan',
    'Lainnya'
  ], []);

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
                <h2 className="text-2xl font-bold text-gray-900">Hubungi Kami</h2>
                <p className="text-gray-600">Ada pertanyaan? Kami siap membantu Anda</p>
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
            {/* Quick Contact Options */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <button
                onClick={handleDirectWhatsApp}
                className="flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <MessageCircle size={20} />
                <span className="font-medium">Chat WhatsApp</span>
              </button>
              
              <a
                href={`tel:${CONTACT_INFO.phone}`}
                className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                onClick={() => analyticsService.trackPhoneCall()}
              >
                <Phone size={20} />
                <span className="font-medium">Telepon</span>
              </a>
            </div>

            {/* Contact Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(handleFormSubmit);
            }} className="space-y-6">
              
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kontak</h4>
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
                      Nomor Telepon *
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

              {/* Message Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Pesan Anda</h4>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subjek *
                  </label>
                  <select
                    value={values.subject}
                    onChange={handleChange('subject')}
                    onBlur={handleBlur('subject')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.subject ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Pilih subjek pertanyaan</option>
                    {commonSubjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare size={16} className="inline mr-1" />
                    Pesan *
                  </label>
                  <textarea
                    value={values.message}
                    onChange={handleChange('message')}
                    onBlur={handleBlur('message')}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Tuliskan pertanyaan atau pesan Anda secara detail..."
                  />
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                  <p className="text-gray-500 text-xs mt-1">
                    {values.message.length}/500 karakter
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <AnimatedButton
                  type="submit"
                  loading={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  icon="Send"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
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

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-lg p-4 mt-6">
                <h5 className="font-semibold text-gray-900 mb-3">Kontak Langsung</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-blue-600" />
                    <span>{CONTACT_INFO.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} className="text-green-600" />
                    <span>WhatsApp 24/7</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-blue-600" />
                    <span className="break-all">{CONTACT_INFO.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">⏰ {CONTACT_INFO.operatingHours.weekdays}</span>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                <p className="mb-1 flex items-center gap-1">
                  <Mail size={12} />
                  Pesan melalui form: Respon dalam 2-6 jam (jam kerja)
                </p>
                <p className="mb-1 flex items-center gap-1">
                  <MessageCircle size={12} />
                  WhatsApp: Respon langsung 24/7
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
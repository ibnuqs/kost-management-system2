// src/pages/Landing/utils/helpers.ts
import { BookingFormData, RoomType } from '../types';

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const formatPriceShort = (price: number): string => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}jt`;
  }
  if (price >= 1000) {
    return `${(price / 1000).toFixed(0)}rb`;
  }
  return price.toString();
};

export const formatPhoneNumber = (phone: string): string => {
  // Convert to WhatsApp format
  let formatted = phone.replace(/\D/g, '');
  
  if (formatted.startsWith('0')) {
    formatted = '62' + formatted.slice(1);
  } else if (!formatted.startsWith('62')) {
    formatted = '62' + formatted;
  }
  
  return formatted;
};

export const formatPhoneDisplay = (phone: string): string => {
  // Format for display: 0812-3456-7890
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('62')) {
    const withoutCountryCode = '0' + cleaned.slice(2);
    return withoutCountryCode.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  
  return cleaned.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
};

export const generateWhatsAppUrl = (phone: string, message: string): string => {
  const formattedPhone = formatPhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

export const generateBookingMessage = (data: BookingFormData, roomType: RoomType): string => {
  const message = `Halo, saya tertarik untuk booking kamar di Kos Putri Melati.

📋 *Detail Booking:*
• Nama: ${data.name}
• Tipe Kamar: ${roomType.name}
• Harga: ${formatPrice(roomType.price)}/bulan
• Tanggal Masuk: ${formatDate(data.preferredDate)}
• Durasi: ${data.duration} bulan
• Phone: ${data.phone}
• Email: ${data.email}

${data.message ? `💬 *Pesan Tambahan:*\n${data.message}\n\n` : ''}Mohon info lebih lanjut mengenai ketersediaan dan proses booking. Terima kasih! 🙏`;

  return message;
};

export const generateContactMessage = (name: string, subject: string): string => {
  return `Halo, saya ${name}. Saya ingin bertanya tentang ${subject} di Kos Putri Melati.`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const scrollToSection = (sectionId: string): void => {
  const element = document.getElementById(sectionId);
  if (element) {
    const headerOffset = 80; // Height of fixed header
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

export const scrollToTop = (): void => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

export const getImageUrl = (imagePath: string): string => {
  // Handle relative paths and return full URL
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // For local development, you might want to use placeholder images
  if (imagePath.startsWith('/images/')) {
    return `https://picsum.photos/800/600?random=${imagePath.split('/').pop()}`;
  }
  
  return imagePath;
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const isValidImageUrl = (url: string): boolean => {
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
  return imageExtensions.test(url) || url.includes('picsum.photos');
};

export const generateShareUrl = (platform: 'whatsapp' | 'facebook' | 'twitter', url: string, text: string): string => {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  
  switch (platform) {
    case 'whatsapp':
      return `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    default:
      return url;
  }
};
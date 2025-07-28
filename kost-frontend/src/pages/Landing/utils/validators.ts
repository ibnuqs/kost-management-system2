// src/pages/Landing/utils/validators.ts
export const validateName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Nama wajib diisi';
  }
  if (name.trim().length < 2) {
    return 'Nama minimal 2 karakter';
  }
  if (name.trim().length > 50) {
    return 'Nama maksimal 50 karakter';
  }
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone.trim()) {
    return 'Nomor telepon wajib diisi';
  }
  
  const cleanPhone = phone.replace(/\s/g, '');
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  
  if (!phoneRegex.test(cleanPhone)) {
    return 'Format nomor telepon tidak valid (contoh: 08123456789)';
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return 'Email wajib diisi';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Format email tidak valid';
  }
  return null;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value.trim()) {
    return `${fieldName} wajib diisi`;
  }
  return null;
};

export const validateDate = (date: string): string | null => {
  if (!date) {
    return 'Tanggal wajib dipilih';
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return 'Tanggal tidak boleh kurang dari hari ini';
  }
  
  // Max 6 months from now
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);
  
  if (selectedDate > maxDate) {
    return 'Tanggal maksimal 6 bulan dari sekarang';
  }
  
  return null;
};

export const validateDuration = (duration: number): string | null => {
  if (!duration || duration <= 0) {
    return 'Durasi wajib diisi';
  }
  
  if (duration < 1) {
    return 'Durasi minimal 1 bulan';
  }
  
  if (duration > 24) {
    return 'Durasi maksimal 24 bulan';
  }
  
  return null;
};

export const validateMessage = (message: string, required: boolean = false): string | null => {
  if (required && !message.trim()) {
    return 'Pesan wajib diisi';
  }
  
  if (message.length > 500) {
    return 'Pesan maksimal 500 karakter';
  }
  
  return null;
};

export const validateSubject = (subject: string): string | null => {
  if (!subject.trim()) {
    return 'Subjek wajib diisi';
  }
  
  if (subject.trim().length < 3) {
    return 'Subjek minimal 3 karakter';
  }
  
  if (subject.trim().length > 100) {
    return 'Subjek maksimal 100 karakter';
  }
  
  return null;
};
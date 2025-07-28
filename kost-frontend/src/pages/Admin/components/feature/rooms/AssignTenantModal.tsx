// File: src/pages/Admin/components/feature/rooms/AssignTenantModal.tsx
import React, { useState, useEffect } from 'react';
import { X, User, DollarSign, Calendar, AlertCircle, UserPlus, ChevronDown } from 'lucide-react';
import { roomService } from '../../../services/roomService'; // RE-ENABLED: Using the actual service now
import type { TenantAssignmentData } from '../../../types/room';

// --- TYPE DEFINITIONS ---
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface AssignTenantModalProps {
  isOpen: boolean;
  room: any;
  onClose: () => void;
  onSubmit: (data: TenantAssignmentData) => void;
}

interface FormErrors {
  user_id?: string;
  monthly_rent?: string;
  start_date?: string;
}

// --- COMPONENT START ---
export const AssignTenantModal: React.FC<AssignTenantModalProps> = ({
  isOpen,
  room,
  onClose,
  onSubmit,
}) => {
  // --- STATE MANAGEMENT ---
  const [tenantData, setTenantData] = useState<TenantAssignmentData>({
    user_id: '',
    monthly_rent: '',
    start_date: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // --- SPECIFIC DEBUGGING EFFECTS ---
  useEffect(() => {
    console.log(`🕵️‍♂️ [Modal State Change] isOpen: ${isOpen}`);
    if(isOpen) {
        console.log('🚪 Modal dibuka untuk kamar:', room);
    }
  }, [isOpen, room]);

  useEffect(() => {
    console.log('📝 [Form Data Update]', tenantData);
  }, [tenantData]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
        console.warn('🚦 [Validation Error Update]', errors);
    }
  }, [errors]);


  // --- CORE LOGIC & EFFECTS ---

  // Effect to load available users when the modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('Effect triggered: Loading available users.');
      loadAvailableUsers();
    }
  }, [isOpen]);

  // Effect to initialize the form when the modal opens or the room changes
  useEffect(() => {
    if (isOpen && room) {
      console.log('✨ Effect terpicu: Menginisialisasi data form.');
      const initialData = {
        user_id: '',
        monthly_rent: room.monthly_price || '',
        start_date: new Date().toISOString().split('T')[0],
      };
      setTenantData(initialData);
      console.log('✍️  Form diinisialisasi dengan data:', initialData);

      // Reset states
      setErrors({});
      setUserSearch('');
      setShowUserDropdown(false);
      console.log('🧹 State di-reset untuk sesi modal baru.');
    }
  }, [isOpen, room]);

  // Function to fetch available tenants from the service
  const loadAvailableUsers = async () => {
    console.group('[Function] loadAvailableUsers');
    setLoadingUsers(true);
    console.log('Loading users started.');
    try {
      const users = await roomService.getAvailableTenants();
      
      console.log('Raw data from roomService.getAvailableTenants():', users);

      if (Array.isArray(users)) {
        if(users.length > 0) {
            console.log(`Success: Received ${users.length} available users.`);
        } else {
            console.warn(`Success, but no available users returned (empty array).`);
        }
        setAvailableUsers(users);
      } else {
        console.error('ERROR: Received data is not an array!', users);
        setAvailableUsers([]);
      }

    } catch (error) {
      console.error('CRITICAL ERROR in loadAvailableUsers:', error);
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
      console.log('User loading completed.');
      console.groupEnd();
    }
  };

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  useEffect(() => {
    console.log(`Filter: Search term "${userSearch}". Found ${filteredUsers.length} of ${availableUsers.length} users.`);
  }, [userSearch, availableUsers, filteredUsers]);


  const validateForm = (): boolean => {
    console.group('🛡️ [Function] validateForm');
    const newErrors: FormErrors = {};
    console.log('Memvalidasi data:', tenantData);

    if (!tenantData.user_id.trim()) {
      newErrors.user_id = 'Silakan pilih penyewa';
    } else if (!availableUsers.find(u => u.id.toString() === tenantData.user_id)) {
      newErrors.user_id = 'Silakan pilih penyewa yang valid dari daftar';
    }

    if (!tenantData.monthly_rent.trim()) {
      newErrors.monthly_rent = 'Sewa bulanan harus diisi';
    } else {
      const rent = parseFloat(tenantData.monthly_rent);
      if (isNaN(rent) || rent <= 0) {
        newErrors.monthly_rent = 'Masukkan jumlah sewa yang valid';
      }
    }

    if (!tenantData.start_date) {
      newErrors.start_date = 'Tanggal mulai harus diisi';
    } else {
      const startDate = new Date(tenantData.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        newErrors.start_date = 'Tanggal mulai tidak boleh di masa lalu';
      }
    }

    setErrors(newErrors);
    console.log('Hasil validasi (errors):', newErrors);
    console.groupEnd();
    return Object.keys(newErrors).length === 0;
  };

  // --- HANDLER FUNCTIONS ---

  const handleChange = (field: keyof TenantAssignmentData, value: string) => {
    setTenantData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors[field as keyof FormErrors];
          return newErrors;
      });
    }
  };

  const handleUserSelect = (user: User) => {
    console.log('👤 Pengguna dipilih:', user);
    handleChange('user_id', user.id.toString());
    setUserSearch(user.name);
    setShowUserDropdown(false);
    console.log('🔽 Dropdown ditutup setelah pemilihan.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.group('[Function] handleSubmit');
    
    if (!validateForm()) {
        console.log('Submission failed: Validation errors exist.');
        console.groupEnd();
        return;
    }

    console.log('Validation successful. Proceeding with submission:', tenantData);
    setLoading(true);
    try {
      await onSubmit(tenantData);
      console.log('Submission successful, closing modal.');
      onClose();
    } catch (error) {
      console.error('Submission error (handled by parent component):', error);
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  const handleRentChange = (value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, '');
    handleChange('monthly_rent', cleanValue);
  };

  const handleFocus = () => {
    console.log('🖱️ Fokus pada input pencarian, menampilkan dropdown.');
    setShowUserDropdown(true);
  };

  const handleClickOutside = () => {
    console.log('🖱️ Klik di luar, menyembunyikan dropdown.');
    setShowUserDropdown(false);
  };

  // Helper function to format price display
  const formatPriceDisplay = (price: string): string => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;
    return numPrice.toLocaleString('id-ID');
  };
  
  // --- RENDER LOGIC ---

  if (!isOpen || !room) {
    if (!isOpen) console.log('🚫 Modal tidak dirender: isOpen false.');
    if (!room) console.log('🚫 Modal tidak dirender: room null/undefined.');
    return null;
  }

  const selectedUser = availableUsers.find(u => u.id.toString() === tenantData.user_id);

  console.log(`🎨 [Render] Modal sedang dirender. Dropdown: ${showUserDropdown}, Loading: ${loadingUsers}`);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-visible shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserPlus className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Tugaskan Penyewa ke Kamar {room.room_number}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {room.room_name} - Atur penugasan penyewa baru
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 p-1 transition-colors disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Penyewa <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setShowUserDropdown(true);
                      if (!e.target.value) {
                        handleChange('user_id', '');
                      }
                    }}
                    onFocus={handleFocus}
                    disabled={loading || loadingUsers}
                    placeholder={loadingUsers ? "Memuat pengguna..." : "Cari dan pilih penyewa..."}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 ${
                      errors.user_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  
                  {/* Dropdown - FIXED: Increased z-index to ensure it's on top */}
                  {showUserDropdown && !loadingUsers && (
                    <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleUserSelect(user)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.phone && (
                              <div className="text-xs text-gray-400">{user.phone}</div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          {userSearch ? 'Pengguna tidak ditemukan' : 'Tidak ada penyewa tersedia'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {selectedUser && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm font-medium text-green-900">{selectedUser.name}</div>
                    <div className="text-xs text-green-700">{selectedUser.email}</div>
                  </div>
                )}
                
                {errors.user_id && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.user_id}
                  </div>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Cari dan pilih dari pengguna yang saat ini tidak aktif menyewa
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sewa Bulanan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={tenantData.monthly_rent}
                    onChange={(e) => handleRentChange(e.target.value)}
                    disabled={loading}
                    placeholder="1500000"
                    className={`w-full pl-10 pr-16 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 ${
                      errors.monthly_rent ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    IDR
                  </div>
                </div>
                {tenantData.monthly_rent && !errors.monthly_rent && (
                  <p className="mt-1 text-sm text-gray-600">
                    Rp {formatPriceDisplay(tenantData.monthly_rent)}
                  </p>
                )}
                {errors.monthly_rent && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.monthly_rent}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    value={tenantData.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                    disabled={loading}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 ${
                      errors.start_date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.start_date && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.start_date}
                  </div>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Tanggal saat penyewa akan mulai menempati kamar ini
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Ringkasan Kamar</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><span className="font-medium">Kamar:</span> {room.room_number} - {room.room_name}</p>
                  <p><span className="font-medium">Harga Dasar:</span> Rp {parseFloat(room.monthly_price || '0').toLocaleString('id-ID')}</p>
                  <p><span className="font-medium">Status:</span> {room.status}</p>
                </div>
              </div>
            </form>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || Object.keys(errors).length > 0 || !tenantData.user_id}
              className="w-full inline-flex justify-center items-center gap-2 rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menugaskan...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Tugaskan Penyewa
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:w-auto sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
      
      {showUserDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleClickOutside}
        />
      )}
    </div>
  );
};

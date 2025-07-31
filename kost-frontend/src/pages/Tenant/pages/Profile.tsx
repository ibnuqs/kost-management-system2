// File: src/pages/Tenant/pages/Profile.tsx
import React, { useState } from 'react';
import { User, Edit, Save, X, CreditCard, Key, Lock } from 'lucide-react';
import { useProfile, useUpdateProfile, useChangePassword } from '../hooks/useProfile';
import { toast } from 'react-hot-toast';
import { useRfidCards, useToggleCardStatus } from '../hooks/useRfidCards';
import { useTenantDashboard } from '../hooks/useTenantDashboard';
import { PageHeader } from '../components/layout/Header';
import { Card, InfoCard } from '../components/ui/Card';
import { Button } from '../components/ui/Buttons';
import { Input } from '../components/ui/Forms';
import { StatusBadge, LoadingSpinner, ProgressBar } from '../components/ui/Status';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getRfidStatusLabel } from '../types/rfid';
import { ProfileUpdateData } from '../types/profile';
import { mergeClasses } from '../utils/helpers';
import { MOBILE_SPECIFIC } from '../utils/constants';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<ProfileUpdateData>>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [isManagingCards, setIsManagingCards] = useState(false);
  
  const { profile, isLoading, isError } = useProfile();
  const { dashboardData } = useTenantDashboard();
  const { cards } = useRfidCards();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const toggleCardStatus = useToggleCardStatus();

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({});
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(editedProfile);
      setIsEditing(false);
      setEditedProfile({});
    } catch {
      // Error handled by mutation
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error('Password baru dan konfirmasi password tidak sama');
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      toast.error('Password baru minimal 8 karakter');
      return;
    }

    try {
      await changePassword.mutateAsync(passwordData);
      setIsChangingPassword(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch {
      // Error handled by mutation
    }
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    });
  };

  const handleToggleCardStatus = async (cardId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await toggleCardStatus.mutateAsync({ cardId, status: newStatus });
    } catch {
      // Error handled by mutation
    }
  };

  // Calculate profile completion
  const getProfileCompletion = () => {
    if (!profile) return 0;
    const fields = [
      profile.name,
      profile.email,
      profile.phone,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Gagal Memuat Profil
          </h2>
          <p className="text-gray-600 mb-4">
            {error?.message || 'Terjadi kesalahan saat memuat profil Anda.'}
          </p>
          <Button onClick={() => window.location.reload()} variant="primary">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat profil Anda..." />
      </div>
    );
  }

  const profileCompletion = getProfileCompletion();

  return (
    <div className={mergeClasses(
      'min-h-screen bg-gray-50',
      MOBILE_SPECIFIC.MOBILE_PADDING,
      'pb-24 md:pb-6'
    )}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Profil Saya"
          subtitle="Kelola informasi akun Anda"
          icon={User}
          actions={
            !isEditing ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleEdit}
                icon={Edit}
              >
                Edit Profil
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCancel}
                  icon={X}
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  loading={updateProfile.isPending}
                  icon={Save}
                >
                  Simpan
                </Button>
              </div>
            )
          }
        />

        {/* Profile Completion */}
        {profileCompletion < 100 && (
          <InfoCard
            type="info"
            title="Lengkapi Profil Anda"
            message={`Profil Anda ${profileCompletion}% selesai. Tambahkan informasi lebih lanjut untuk meningkatkan keamanan dan pengalaman akun Anda.`}
            action={{
              label: "Lanjutkan Pengaturan",
              onClick: () => setIsEditing(true)
            }}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Informasi Pribadi</h3>
              </div>

              <div className="space-y-4">
                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nama Lengkap"
                    value={isEditing ? editedProfile.name : profile?.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    required
                  />
                  
                  <Input
                    label="Email"
                    type="email"
                    value={isEditing ? editedProfile.email : profile?.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    required
                  />
                  
                  <Input
                    label="Nomor Telepon"
                    value={isEditing ? editedProfile.phone : profile?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Contoh: +62812-3456-7890"
                    className="sm:col-span-2"
                  />
                </div>
              </div>
            </Card>

            {/* Change Password */}
            <Card>
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-900">Ubah Password</h3>
              </div>

              {!isChangingPassword ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">
                    Untuk keamanan akun Anda, ubah password secara berkala
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => setIsChangingPassword(true)}
                    icon={Lock}
                  >
                    Ubah Password
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    label="Password Saat Ini"
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                    required
                    placeholder="Masukkan password saat ini"
                  />
                  
                  <Input
                    label="Password Baru"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                    required
                    placeholder="Minimal 8 karakter"
                  />
                  
                  <Input
                    label="Konfirmasi Password Baru"
                    type="password"
                    value={passwordData.new_password_confirmation}
                    onChange={(e) => handlePasswordChange('new_password_confirmation', e.target.value)}
                    required
                    placeholder="Ulangi password baru"
                  />

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCancelPasswordChange}
                      icon={X}
                    >
                      Batal
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleChangePassword}
                      loading={changePassword.isPending}
                      icon={Save}
                    >
                      Simpan Password
                    </Button>
                  </div>
                </div>
              )}
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tenancy Info */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Info Sewa</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Kamar</span>
                  <span className="font-medium">{dashboardData?.tenant_info?.room_number || '-'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Sewa Bulanan</span>
                  <span className="font-medium">{formatCurrency(dashboardData?.tenant_info?.monthly_rent || 0)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tanggal Masuk</span>
                  <span className="font-medium">
                    {dashboardData?.tenant_info?.start_date ? formatDate(dashboardData.tenant_info.start_date) : '-'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <StatusBadge
                    status={dashboardData?.tenant_info?.status === 'active' ? 'success' : 'warning'}
                    label={dashboardData?.tenant_info?.status === 'active' ? 'Aktif' : dashboardData?.tenant_info?.status || 'Tidak Diketahui'}
                    size="sm"
                  />
                </div>
              </div>
            </Card>

            {/* Profile Completion */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Kelengkapan Profil</h3>
              </div>

              <ProgressBar
                value={profileCompletion}
                max={100}
                color={profileCompletion >= 80 ? 'green' : profileCompletion >= 50 ? 'yellow' : 'red'}
                size="lg"
                showLabel
                animated
              />

              <p className="text-sm text-gray-600 mt-2">
                {profileCompletion >= 80 
                  ? 'Hebat! Profil Anda sudah lengkap.'
                  : 'Lengkapi profil Anda untuk keamanan dan pengalaman yang lebih baik.'
                }
              </p>
            </Card>

            {/* RFID Cards */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Kartu RFID</h3>
              </div>

              <div className="space-y-3">
                {(Array.isArray(cards) ? cards.length : 0) === 0 ? (
                  <p className="text-sm text-gray-500">Tidak ada kartu RFID terdaftar</p>
                ) : (
                  !isManagingCards ? (
                    // View mode - tampilkan kartu saja
                    (Array.isArray(cards) ? cards.slice(0, 3) : []).map((card) => (
                      <div key={card.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{card.uid}</p>
                        </div>
                        <StatusBadge
                          status={card.status === 'active' ? 'success' : 'warning'}
                          label={getRfidStatusLabel(card.status)}
                          size="sm"
                        />
                      </div>
                    ))
                  ) : (
                    // Management mode - tampilkan dengan tombol toggle
                    (Array.isArray(cards) ? cards : []).map((card) => (
                      <div key={card.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{card.uid}</p>
                          <p className="text-xs text-gray-500">Kartu #{card.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge
                            status={card.status === 'active' ? 'success' : 'warning'}
                            label={getRfidStatusLabel(card.status)}
                            size="sm"
                          />
                          <Button
                            variant={card.status === 'active' ? 'secondary' : 'primary'}
                            size="sm"
                            onClick={() => handleToggleCardStatus(card.id, card.status)}
                            loading={toggleCardStatus.isPending}
                          >
                            {card.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                          </Button>
                        </div>
                      </div>
                    ))
                  )
                )}
                
                <Button 
                  variant="secondary" 
                  size="sm" 
                  fullWidth
                  onClick={() => setIsManagingCards(!isManagingCards)}
                  disabled={(Array.isArray(cards) ? cards.length : 0) === 0}
                >
                  {isManagingCards ? 'Selesai' : 'Kelola Kartu'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
// File: src/pages/Tenant/components/feature/profile/PersonalInfo.tsx
import React, { useState } from 'react';
import { User, Edit, Save, X, Camera, Phone, Mail, Briefcase } from 'lucide-react';
import { useProfile, useUpdateProfile, useUploadProfilePhoto } from '../../../hooks/useProfile';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Buttons';
import { Input, Textarea } from '../../ui/Forms';
import { StatusBadge, ProgressBar } from '../../ui/Status';
import { ProfileUpdateData } from '../../../types/profile';
import { getInitials } from '../../../utils/helpers';
import { mergeClasses } from '../../../utils/helpers';

interface PersonalInfoProps {
  className?: string;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ProfileUpdateData>({});
  
  const { profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadPhoto = useUploadProfilePhoto();

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({
      name: profile?.user?.name || '',
      email: profile?.user?.email || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      occupation: profile?.occupation || '',
      company_name: profile?.company_name || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({});
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(editedData);
      setIsEditing(false);
      setEditedData({});
    } catch {
      // Error handled by mutation
    }
  };

  const handleInputChange = (field: keyof ProfileUpdateData, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadPhoto.mutate(file);
    }
  };

  const getProfileCompletion = () => {
    if (!profile) return 0;
    const fields = [
      profile.user?.name,
      profile.user?.email,
      profile.phone,
      profile.address,
      profile.occupation,
      profile.company_name,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const completion = getProfileCompletion();

  if (isLoading) {
    return (
      <Card className={mergeClasses('animate-pulse', className)}>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Personal Information</h3>
        </div>
        
        {!isEditing ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleEdit}
            icon={Edit}
          >
            Edit
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancel}
              icon={X}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              loading={updateProfile.isPending}
              icon={Save}
            >
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Profile Completion */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-800">Profile Completion</span>
          <span className="text-sm font-bold text-blue-600">{completion}%</span>
        </div>
        <ProgressBar
          value={completion}
          max={100}
          color={completion >= 80 ? 'green' : completion >= 50 ? 'blue' : 'yellow'}
          size="md"
          animated
        />
        <p className="text-xs text-blue-600 mt-2">
          {completion >= 80 
            ? 'Great! Your profile is well completed.'
            : 'Complete your profile for better experience.'
          }
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Photo Section */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="relative">
            {profile?.profile_photo ? (
              <img
                src={profile.profile_photo}
                alt={profile.user?.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {getInitials(profile?.user?.name || '')}
              </div>
            )}
            
            {isEditing && (
              <label className="absolute -bottom-1 -right-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </div>
              </label>
            )}
            
            {uploadPhoto.isPending && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900">
              {profile?.user?.name || 'No name set'}
            </h4>
            <p className="text-sm text-gray-600">
              {profile?.user?.email || 'No email set'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Room {profile?.room_number || 'N/A'}
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={isEditing ? editedData.name : profile?.user?.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={!isEditing}
            required
            leftIcon={User}
            placeholder="Enter your full name"
          />
          
          <Input
            label="Email Address"
            type="email"
            value={isEditing ? editedData.email : profile?.user?.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={!isEditing}
            required
            leftIcon={Mail}
            placeholder="your.email@example.com"
          />
          
          <Input
            label="Phone Number"
            value={isEditing ? editedData.phone : profile?.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={!isEditing}
            leftIcon={Phone}
            placeholder="+62xxx-xxxx-xxxx"
            helperText="Used for emergency contact and notifications"
          />
          
          <Input
            label="Occupation"
            value={isEditing ? editedData.occupation : profile?.occupation || ''}
            onChange={(e) => handleInputChange('occupation', e.target.value)}
            disabled={!isEditing}
            leftIcon={Briefcase}
            placeholder="Your job title"
          />
          
          <Input
            label="Company Name"
            value={isEditing ? editedData.company_name : profile?.company_name || ''}
            onChange={(e) => handleInputChange('company_name', e.target.value)}
            disabled={!isEditing}
            placeholder="Company or organization"
            className="sm:col-span-2"
          />
        </div>

        <Textarea
          label="Address"
          value={isEditing ? editedData.address : profile?.address || ''}
          onChange={(e) => handleInputChange('address', e.target.value)}
          disabled={!isEditing}
          rows={3}
          placeholder="Your current address"
          helperText="This will be used for official correspondence"
        />

        {/* Account Status */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Account Status</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Account Status</p>
              <StatusBadge
                status={profile?.status === 'active' ? 'success' : 'warning'}
                label={profile?.status || 'Unknown'}
                size="sm"
                className="mt-1"
              />
            </div>
            
            <div>
              <p className="text-gray-600">Email Verified</p>
              <StatusBadge
                status={profile?.user?.email_verified_at ? 'success' : 'warning'}
                label={profile?.user?.email_verified_at ? 'Verified' : 'Unverified'}
                size="sm"
                className="mt-1"
              />
            </div>
            
            <div>
              <p className="text-gray-600">Profile Completion</p>
              <StatusBadge
                status={completion >= 80 ? 'success' : completion >= 50 ? 'info' : 'warning'}
                label={`${completion}%`}
                size="sm"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonalInfo;
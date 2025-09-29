import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { User, Mail, Phone, MapPin, Calendar, Shield, Settings, Bell, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '../services/api/auth';

// Save button component
function SaveButton({ onClick, disabled, isLoading }: { onClick: () => void; disabled: boolean; isLoading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2 bg-curex-blue-600 text-white rounded-lg hover:bg-curex-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Save Changes
        </>
      )}
    </button>
  );
}

export default function ProfilePage() {
  const { t } = useTranslation(['pharmacy']);
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: typeof user?.address === 'string' ? {
      street: user.address,
      city: '',
      state: '',
      zip_code: '',
      country: ''
    } : user?.address || {
      street: '',
      city: '',
      state: '',
      zip_code: '',
      country: ''
    },
    date_of_birth: user?.date_of_birth || '',
    gender: user?.gender || '',
  });

  // Sync form data with user data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: typeof user.address === 'string' ? {
          street: user.address,
          city: '',
          state: '',
          zip_code: '',
          country: ''
        } : user.address || {
          street: '',
          city: '',
          state: '',
          zip_code: '',
          country: ''
        },
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
      });
    }
  }, [user]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Debug: Log what we're sending
      console.log('Sending profile data:', formData);
      
      // Call the API to update the user profile
      const updatedUser = await authService.updateProfile(formData);
      
      // Update the local user state
      updateUser(updatedUser);
      
      // Update the form data with the new user data
      setFormData({
        first_name: updatedUser.first_name || '',
        last_name: updatedUser.last_name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone || '',
        address: typeof updatedUser.address === 'string' ? {
          street: updatedUser.address,
          city: '',
          state: '',
          zip_code: '',
          country: ''
        } : updatedUser.address || {
          street: '',
          city: '',
          state: '',
          zip_code: '',
          country: ''
        },
        date_of_birth: updatedUser.date_of_birth || '',
        gender: updatedUser.gender || '',
      });
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: typeof user?.address === 'string' ? {
        street: user.address,
        city: '',
        state: '',
        zip_code: '',
        country: ''
      } : user?.address || {
        street: '',
        city: '',
        state: '',
        zip_code: '',
        country: ''
      },
      date_of_birth: user?.date_of_birth || '',
      gender: user?.gender || '',
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case UserRole.PATIENT:
        return 'Patient';
      case UserRole.PHARMACIST:
        return 'Pharmacist';
      case UserRole.ADMIN:
        return 'Administrator';
      case UserRole.GOVERNMENT_OFFICIAL:
        return 'Government Official';
      case UserRole.INSURANCE_PROVIDER:
        return 'Insurance Provider';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Profile Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your profile and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-curex-blue-500 to-curex-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {user?.first_name && user?.last_name 
                      ? `${user.first_name} ${user.last_name}` 
                      : user?.name || 'User'
                    }
                  </h3>
                  <p className="text-curex-teal-600 dark:text-curex-teal-400 font-medium mb-2">
                    {getRoleLabel(user?.role || '')}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {user?.email}
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Account Status</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Member Since</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${
                isEditing ? 'ring-2 ring-curex-blue-200 border-curex-blue-300' : ''
              }`}>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Personal Information
                      {isEditing && (
                        <span className="ml-2 text-sm text-curex-blue-600 font-normal">
                          (Editing)
                        </span>
                      )}
                    </h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 text-curex-blue-600 hover:text-curex-blue-700 font-medium"
                      >
                        <Settings className="h-4 w-4" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-3 items-center">
                        <SaveButton 
                          onClick={handleSave}
                          disabled={isLoading}
                          isLoading={isLoading}
                        />
                        <button
                          onClick={handleCancel}
                          disabled={isLoading}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {/* Error and Success Messages */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">{success}</p>
                          <p className="text-xs text-green-600 mt-1">Your profile has been updated successfully.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-curex-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">{user?.first_name || 'Not provided'}</p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-curex-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">{user?.last_name || 'Not provided'}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-curex-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">{user?.email || 'Not provided'}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-curex-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">{user?.phone || 'Not provided'}</p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date of Birth
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          name="date_of_birth"
                          value={formData.date_of_birth}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-curex-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">
                          {user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'Not provided'}
                        </p>
                      )}
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Gender
                      </label>
                      {isEditing ? (
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-curex-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      ) : (
                        <p className="text-gray-900 dark:text-white">{user?.gender || 'Not provided'}</p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Address
                      </label>
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            name="address.street"
                            value={formData.address.street}
                            onChange={handleInputChange}
                            placeholder="Street Address"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-curex-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              name="address.city"
                              value={formData.address.city}
                              onChange={handleInputChange}
                              placeholder="City"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-curex-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                            <input
                              type="text"
                              name="address.state"
                              value={formData.address.state}
                              onChange={handleInputChange}
                              placeholder="State"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-curex-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              name="address.zip_code"
                              value={formData.address.zip_code}
                              onChange={handleInputChange}
                              placeholder="ZIP Code"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-curex-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                            <input
                              type="text"
                              name="address.country"
                              value={formData.address.country}
                              onChange={handleInputChange}
                              placeholder="Country"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-curex-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-900 dark:text-white">
                          {(() => {
                            if (typeof user?.address === 'string') {
                              return user.address;
                            }
                            if (user?.address && typeof user.address === 'object' && 'street' in user.address) {
                              const addr = user.address as any;
                              return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip_code}`;
                            }
                            return 'Not provided';
                          })()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Security Settings
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Update your password</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 text-curex-blue-600 hover:text-curex-blue-700 font-medium">
                        Change
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your notification preferences</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 text-curex-blue-600 hover:text-curex-blue-700 font-medium">
                        Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

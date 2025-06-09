import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateProfile, changePassword, error } = useContext(AuthContext);
  
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    address: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Load user data into form
  useEffect(() => {
    if (user && user.profile) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.profile.phone_number || '',
        address: user.profile.address || ''
      });
    }
  }, [user]);
  
  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };
  
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };
  
  const validateProfile = () => {
    const errors = {};
    
    if (!profileData.first_name) {
      errors.first_name = t('First name is required');
    }
    
    if (!profileData.last_name) {
      errors.last_name = t('Last name is required');
    }
    
    if (!profileData.phone_number) {
      errors.phone_number = t('Phone number is required');
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validatePassword = () => {
    const errors = {};
    
    if (!passwordData.old_password) {
      errors.old_password = t('Current password is required');
    }
    
    if (!passwordData.new_password) {
      errors.new_password = t('New password is required');
    } else if (passwordData.new_password.length < 8) {
      errors.new_password = t('Password must be at least 8 characters');
    }
    
    if (!passwordData.confirm_password) {
      errors.confirm_password = t('Please confirm your new password');
    } else if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = t('Passwords do not match');
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (validateProfile()) {
      setIsSubmittingProfile(true);
      const success = await updateProfile(profileData);
      setIsSubmittingProfile(false);
      
      if (success) {
        setProfileSuccess(true);
        setTimeout(() => {
          setProfileSuccess(false);
        }, 3000);
      }
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (validatePassword()) {
      setIsSubmittingPassword(true);
      const success = await changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      setIsSubmittingPassword(false);
      
      if (success) {
        setPasswordSuccess(true);
        setPasswordData({
          old_password: '',
          new_password: '',
          confirm_password: ''
        });
        setTimeout(() => {
          setPasswordSuccess(false);
        }, 3000);
      }
    }
  };
  
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6 bg-white border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">{t('Profile')}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">{t('Personal Information')}</h2>
                
                {profileSuccess && (
                  <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{t('Profile updated successfully!')}</span>
                  </div>
                )}
                
                {error && !passwordSuccess && (
                  <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{typeof error === 'object' ? JSON.stringify(error) : error}</span>
                  </div>
                )}
                
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      {t('Email address')}
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        disabled
                        value={user.email || ''}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">{t('Email cannot be changed')}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                        {t('First name')}
                      </label>
                      <div className="mt-1">
                        <input
                          id="first_name"
                          name="first_name"
                          type="text"
                          required
                          value={profileData.first_name}
                          onChange={handleProfileChange}
                          className={`appearance-none block w-full px-3 py-2 border ${
                            profileErrors.first_name ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        />
                        {profileErrors.first_name && (
                          <p className="mt-2 text-sm text-red-600">{profileErrors.first_name}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                        {t('Last name')}
                      </label>
                      <div className="mt-1">
                        <input
                          id="last_name"
                          name="last_name"
                          type="text"
                          required
                          value={profileData.last_name}
                          onChange={handleProfileChange}
                          className={`appearance-none block w-full px-3 py-2 border ${
                            profileErrors.last_name ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        />
                        {profileErrors.last_name && (
                          <p className="mt-2 text-sm text-red-600">{profileErrors.last_name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                      {t('Phone number')}
                    </label>
                    <div className="mt-1">
                      <input
                        id="phone_number"
                        name="phone_number"
                        type="tel"
                        required
                        value={profileData.phone_number}
                        onChange={handleProfileChange}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          profileErrors.phone_number ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      />
                      {profileErrors.phone_number && (
                        <p className="mt-2 text-sm text-red-600">{profileErrors.phone_number}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      {t('Address')}
                    </label>
                    <div className="mt-1">
                      <input
                        id="address"
                        name="address"
                        type="text"
                        value={profileData.address}
                        onChange={handleProfileChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmittingProfile}
                      className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        isSubmittingProfile ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmittingProfile ? t('Updating...') : t('Update Profile')}
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Change Password */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">{t('Change Password')}</h2>
                
                {passwordSuccess && (
                  <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{t('Password changed successfully!')}</span>
                  </div>
                )}
                
                {error && !profileSuccess && (
                  <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{typeof error === 'object' ? JSON.stringify(error) : error}</span>
                  </div>
                )}
                
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="old_password" className="block text-sm font-medium text-gray-700">
                      {t('Current Password')}
                    </label>
                    <div className="mt-1">
                      <input
                        id="old_password"
                        name="old_password"
                        type="password"
                        required
                        value={passwordData.old_password}
                        onChange={handlePasswordChange}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          passwordErrors.old_password ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      />
                      {passwordErrors.old_password && (
                        <p className="mt-2 text-sm text-red-600">{passwordErrors.old_password}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                      {t('New Password')}
                    </label>
                    <div className="mt-1">
                      <input
                        id="new_password"
                        name="new_password"
                        type="password"
                        required
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          passwordErrors.new_password ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      />
                      {passwordErrors.new_password && (
                        <p className="mt-2 text-sm text-red-600">{passwordErrors.new_password}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                      {t('Confirm New Password')}
                    </label>
                    <div className="mt-1">
                      <input
                        id="confirm_password"
                        name="confirm_password"
                        type="password"
                        required
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          passwordErrors.confirm_password ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      />
                      {passwordErrors.confirm_password && (
                        <p className="mt-2 text-sm text-red-600">{passwordErrors.confirm_password}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmittingPassword}
                      className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        isSubmittingPassword ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmittingPassword ? t('Changing...') : t('Change Password')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
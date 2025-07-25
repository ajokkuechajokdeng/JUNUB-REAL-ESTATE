
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';

const Register = () => {
  const { t } = useTranslation();
  const { register, error, isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
    phone_number: '',
    address: '',
    role: 'tenant',
    company: '',
    bio: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      if (user?.profile?.role === 'agent') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, navigate, user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = t('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('Email is invalid');
    }

    if (!formData.first_name) {
      errors.first_name = t('First name is required');
    }

    if (!formData.last_name) {
      errors.last_name = t('Last name is required');
    }

    if (!formData.password) {
      errors.password = t('Password is required');
    } else if (formData.password.length < 8) {
      errors.password = t('Password must be at least 8 characters');
    }

    if (!formData.password2) {
      errors.password2 = t('Please confirm your password');
    } else if (formData.password !== formData.password2) {
      errors.password2 = t('Passwords do not match');
    }

    if (!formData.phone_number) {
      errors.phone_number = t('Phone number is required');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper to render backend errors nicely
  const renderBackendError = (err) => {
    if (!err) return null;
    if (typeof err === 'string') return err;
    if (typeof err === 'object') {
      return (
        <ul>
          {Object.entries(err).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}
            </li>
          ))}
        </ul>
      );
    }
    return JSON.stringify(err);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      setIsSubmitting(true);
      const registerSuccess = await register(formData);
      setIsSubmitting(false);

      if (registerSuccess) {
        setSuccess(true);
        // No need to navigate here, AuthContext.register will handle redirection based on role
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Back Arrow */}
      {location.pathname !== "/" && (
        <button
          onClick={() => navigate(-1)}
          className="fixed top-20 left-4 z-50 bg-white rounded-full shadow-lg p-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          aria-label="Go back"
        >
          <svg
            className="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t('Create a new account')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('Or')}{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            {t('sign in to your existing account')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{renderBackendError(error)}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{t('Registration successful! Redirecting...')}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* ...existing form fields... */}
            {/* No changes needed here */}
            {/* ... */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('Email address')}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    formErrors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {formErrors.email && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
                )}
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
                    autoComplete="given-name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      formErrors.first_name ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                  {formErrors.first_name && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.first_name}</p>
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
                    autoComplete="family-name"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      formErrors.last_name ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                  {formErrors.last_name && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.last_name}</p>
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
                  autoComplete="tel"
                  required
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    formErrors.phone_number ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {formErrors.phone_number && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.phone_number}</p>
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
                  autoComplete="street-address"
                  value={formData.address}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Register as')}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    formData.role === 'tenant' 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setFormData({...formData, role: 'tenant'})}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 h-6 w-6 mt-0.5 ${
                      formData.role === 'tenant' ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${
                        formData.role === 'tenant' ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {t('Tenant')}
                      </h3>
                      <p className={`text-xs mt-1 ${
                        formData.role === 'tenant' ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {t('Browse properties, save favorites, and contact agents about listings')}
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    formData.role === 'agent' 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setFormData({...formData, role: 'agent'})}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 h-6 w-6 mt-0.5 ${
                      formData.role === 'agent' ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${
                        formData.role === 'agent' ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {t('Agent')}
                      </h3>
                      <p className={`text-xs mt-1 ${
                        formData.role === 'agent' ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {t('List and manage properties, respond to inquiries, and grow your business')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hidden select for form submission */}
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="sr-only"
                aria-hidden="true"
              >
                <option value="tenant">{t('Tenant')}</option>
                <option value="agent">{t('Agent')}</option>
              </select>
            </div>

            {formData.role === 'agent' && (
              <>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    {t('Company')}
                  </label>
                  <div className="mt-1">
                    <input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder={t('Your real estate company or agency')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    {t('Professional Bio')}
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder={t('Tell potential clients about your experience and expertise')}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('Password')}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    formErrors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {formErrors.password && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password2" className="block text-sm font-medium text-gray-700">
                {t('Confirm password')}
              </label>
              <div className="mt-1">
                <input
                  id="password2"
                  name="password2"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password2}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    formErrors.password2 ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {formErrors.password2 && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.password2}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center px-2 py-1 rounded text-xs font-medium ${
                  isSubmitting 
                    ? 'opacity-70 cursor-not-allowed bg-blue-600 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                }`}
              >
                {isSubmitting ? t('Creating account...') : t('Create account')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

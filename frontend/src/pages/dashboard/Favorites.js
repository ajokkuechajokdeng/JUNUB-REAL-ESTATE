import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';

/**
 * Tenant-specific component for viewing favorite properties
 */
const Favorites = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="bg-gray-100 min-h-screen pt-24 pb-12">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('My Favorites')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('View and manage your favorite properties')}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t('Tenant-only feature')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('This page is only accessible to users with the tenant role.')}
          </p>
          <div className="mt-6">
            <Link
              to="/my-rentals"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('View My Rentals')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Agent-specific component for managing their properties
 */
const MyProperties = () => {
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
          <h1 className="text-3xl font-bold text-gray-900">{t('My Properties')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('Manage your property listings')}
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
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t('Agent-only feature')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('This page is only accessible to users with the agent role.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyProperties;
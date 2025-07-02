import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

/**
 * Agent-specific component for adding new properties
 */
const AddProperty = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-100 min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('Add New Property')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('Create a new property listing')}
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t('Agent-only feature')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('This page is only accessible to users with the agent role.')}
          </p>
          <div className="mt-6">
            <Link
              to="/my-properties"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('View My Properties')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;
import React from 'react';
import { useTranslation } from 'react-i18next';

const MyRentals = () => {
  const { t } = useTranslation();

  // Placeholder for now; you can fetch and display tenant's rentals here
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">{t('My Rentals')}</h1>
      <div className="bg-white shadow rounded p-6">
        <p className="text-gray-700">{t('You have not rented any properties yet.')}</p>
      </div>
    </div>
  );
};

export default MyRentals;

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('About Us')}</h3>
            <p className="text-gray-300">
              {t('JunubRental is a platform for finding and listing properties for rent and sale in South Sudan.')}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('Quick Links')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  {t('Home')}
                </Link>
              </li>
              <li>
                <Link to="/properties" className="text-gray-300 hover:text-white">
                  {t('Properties')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white">
                  {t('Login')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white">
                  {t('Register')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('Contact Us')}</h3>
            <ul className="space-y-2 text-gray-300">
              <li>{t('Email')}: info@junubrental.com</li>
              <li>{t('Phone')}: +211 920 000 000</li>
              <li>{t('Address')}: Juba, South Sudan</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('Language')}</h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => changeLanguage('en')} 
                className={`px-3 py-1 rounded ${i18n.language === 'en' ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                English
              </button>
              <button 
                onClick={() => changeLanguage('ar')} 
                className={`px-3 py-1 rounded ${i18n.language === 'ar' ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                العربية
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} JunubRental. {t('All rights reserved.')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // Add scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white text-gray-800 shadow-lg py-2' : 'bg-blue-600 text-white shadow-md py-3'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className={`text-xl font-bold ${scrolled ? 'text-blue-600' : 'text-white'}`}>
              JUNUB REAL ESTATE
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                scrolled 
                  ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:ring-blue-500' 
                  : 'text-white hover:text-blue-200 hover:bg-blue-700 focus:ring-white'
              } focus:outline-none focus:ring-2 focus:ring-inset`}
              aria-expanded="false"
            >
              <span className="sr-only">{t('Open main menu')}</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language switcher for desktop */}
            <div className="flex items-center space-x-2 mr-4">
              <button 
                onClick={() => changeLanguage('en')} 
                className={`px-2 py-1 rounded text-xs font-medium ${
                  i18n.language === 'en' 
                    ? (scrolled ? 'bg-blue-600 text-white' : 'bg-white text-blue-600') 
                    : (scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-blue-700')
                }`}
              >
                English
              </button>
              <button 
                onClick={() => changeLanguage('ar')} 
                className={`px-2 py-1 rounded text-xs font-medium ${
                  i18n.language === 'ar' 
                    ? (scrolled ? 'bg-blue-600 text-white' : 'bg-white text-blue-600') 
                    : (scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-blue-700')
                }`}
              >
                العربية
              </button>
            </div>

            {isAuthenticated() ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive('/dashboard') 
                      ? (scrolled ? 'bg-blue-100 text-blue-700' : 'bg-blue-700 text-white') 
                      : (scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-blue-600' : 'text-white hover:bg-blue-700')
                  }`}
                >
                  {t('Dashboard')}
                </Link>
                <Link 
                  to="/properties" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive('/properties') 
                      ? (scrolled ? 'bg-blue-100 text-blue-700' : 'bg-blue-700 text-white') 
                      : (scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-blue-600' : 'text-white hover:bg-blue-700')
                  }`}
                >
                  {t('Properties')}
                </Link>

                {/* Show 'My Properties' and 'Add Property' for agents, 'My Rentals' for tenants */}
                {user?.profile?.role === 'agent' && (
                  <>
                    <Link 
                      to="/my-properties" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive('/my-properties') 
                          ? (scrolled ? 'bg-blue-100 text-blue-700' : 'bg-blue-700 text-white') 
                          : (scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-blue-600' : 'text-white hover:bg-blue-700')
                      }`}
                    >
                      {t('My Properties')}
                    </Link>
                    <Link 
                      to="/add-property" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive('/add-property') 
                          ? (scrolled ? 'bg-blue-100 text-blue-700' : 'bg-blue-700 text-white') 
                          : (scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-blue-600' : 'text-white hover:bg-blue-700')
                      }`}
                    >
                      {t('Add Property')}
                    </Link>
                  </>
                )}

                {user?.profile?.role === 'tenant' && (
                  <>
                    <Link 
                      to="/my-rentals" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive('/my-rentals') 
                          ? (scrolled ? 'bg-blue-100 text-blue-700' : 'bg-blue-700 text-white') 
                          : (scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-blue-600' : 'text-white hover:bg-blue-700')
                      }`}
                    >
                      {t('My Rentals')}
                    </Link>
                    <Link 
                      to="/favorites" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive('/favorites') 
                          ? (scrolled ? 'bg-blue-100 text-blue-700' : 'bg-blue-700 text-white') 
                          : (scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-blue-600' : 'text-white hover:bg-blue-700')
                      }`}
                    >
                      {t('Favorites')}
                    </Link>
                  </>
                )}

                <div className="relative group ml-2">
                  <button className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-blue-700'
                  }`}>
                    <span>{user?.first_name || user?.email}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-200">
                      {user?.profile?.role === 'agent' ? t('Logged in as Agent') : t('Logged in as Tenant')}
                    </div>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      {t('Profile')}
                    </Link>
                    <button 
                      onClick={logout} 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {t('Logout')}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    scrolled 
                      ? 'text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white' 
                      : 'text-white border border-white hover:bg-white hover:text-blue-600'
                  }`}
                >
                  {t('Login')}
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    scrolled 
                      ? 'text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white' 
                      : 'text-white border border-white hover:bg-white hover:text-blue-600'
                  }`}
                >
                  {t('Register')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden mt-4`}>
          <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 rounded-md ${
            scrolled ? 'bg-white text-gray-800 shadow-lg' : 'bg-blue-600 text-white'
          }`}>
            {/* Language switcher for mobile */}
            <div className="flex items-center space-x-2 px-3 py-2 border-b border-gray-200 mb-2">
              <span className="text-sm font-medium mr-2">
                {t('Language')}:
              </span>
              <button 
                onClick={() => changeLanguage('en')} 
                className={`px-2 py-1 rounded text-xs font-medium ${
                  i18n.language === 'en' 
                    ? (scrolled ? 'bg-blue-600 text-white' : 'bg-white text-blue-600') 
                    : (scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-blue-700')
                }`}
              >
                English
              </button>
              <button 
                onClick={() => changeLanguage('ar')} 
                className={`px-2 py-1 rounded text-xs font-medium ${
                  i18n.language === 'ar' 
                    ? (scrolled ? 'bg-blue-600 text-white' : 'bg-white text-blue-600') 
                    : (scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-blue-700')
                }`}
              >
                العربية
              </button>
            </div>
            {isAuthenticated() && (
              <div className={`px-3 py-2 text-sm ${
                scrolled ? 'text-gray-500 border-b border-gray-200' : 'text-blue-200 border-b border-blue-500'
              }`}>
                {user?.profile?.role === 'agent' ? t('Logged in as Agent') : t('Logged in as Tenant')}
              </div>
            )}

            {isAuthenticated() ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/dashboard') 
                      ? (scrolled ? 'bg-blue-100 text-blue-700' : 'bg-blue-700 text-white') 
                      : (scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-blue-600' : 'text-white hover:bg-blue-700')
                  }`}
                >
                  {t('Dashboard')}
                </Link>
                <Link 
                  to="/properties" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/properties') 
                      ? (scrolled ? 'bg-blue-100 text-blue-700' : 'bg-blue-700 text-white') 
                      : (scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-blue-600' : 'text-white hover:bg-blue-700')
                  }`}
                >
                  {t('Properties')}
                </Link>

                {/* Show 'My Properties' and 'Add Property' for agents, 'My Rentals' for tenants */}
                {user?.profile?.role === 'agent' && (
                  <>
                    <Link 
                      to="/my-properties" 
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive('/my-properties') 
                          ? (scrolled ? 'bg-blue-100 text-blue-700' : 'bg-blue-700 text-white') 
                          : (scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-blue-600' : 'text-white hover:bg-blue-700')
                      }`}
                    >
                      {t('My Properties')}
                    </Link>
                    <Link 
                      to="/add-property" 
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive('/add-property') 
                          ? (scrolled ? 'bg-blue-100 text-blue-700' : 'bg-blue-700 text-white') 
                          : (scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-blue-600' : 'text-white hover:bg-blue-700')
                      }`}
                    >
                      {t('Add Property')}
                    </Link>
                  </>
                )}

                {user?.profile?.role === 'tenant' && (
                  <>
                    <Link 
                      to="/my-rentals" 
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive('/my-rentals') 
                          ? (scrolled ? 'bg-blue-100 text-blue-700' : 'bg-blue-700 text-white') 
                          : (scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-blue-600' : 'text-white hover:bg-blue-700')
                      }`}
                    >
                      {t('My Rentals')}
                    </Link>
                    <Link 
                      to="/favorites" 
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive('/favorites') 
                          ? (scrolled ? 'bg-blue-100 text-blue-700' : 'bg-blue-700 text-white') 
                          : (scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-blue-600' : 'text-white hover:bg-blue-700')
                      }`}
                    >
                      {t('Favorites')}
                    </Link>
                  </>
                )}

                <div className={`${scrolled ? 'border-t border-gray-200 mt-2 pt-2' : 'border-t border-blue-500 mt-2 pt-2'}`}>
                  <Link 
                    to="/profile" 
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/profile') 
                        ? (scrolled ? 'bg-blue-100 text-blue-700' : 'bg-blue-700 text-white') 
                        : (scrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-blue-600' : 'text-white hover:bg-blue-700')
                    }`}
                  >
                    {t('Profile')}
                  </Link>
                  <button 
                    onClick={logout} 
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      scrolled ? 'text-red-600 hover:bg-red-50' : 'text-white hover:bg-red-700'
                    }`}
                  >
                    {t('Logout')}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 py-2">
                <Link 
                  to="/login" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    scrolled ? 'text-blue-600 hover:bg-blue-50' : 'text-white hover:bg-blue-700'
                  }`}
                >
                  {t('Login')}
                </Link>
                <Link 
                  to="/register" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    scrolled 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {t('Register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

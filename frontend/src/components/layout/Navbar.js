import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useContext(AuthContext);

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold">
              JUNUB REAL ESTATE
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated() ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200">
                  {t('Dashboard')}
                </Link>
                <Link to="/properties" className="hover:text-blue-200">
                  {t('Properties')}
                </Link>
                {/* Show 'My Properties' and 'Add Property' for agents, 'My Rentals' for tenants */}
                {user?.role === 'agent' && (
                  <>
                    <Link to="/my-properties" className="hover:text-blue-200">
                      {t('My Properties')}
                    </Link>
                    <Link to="/add-property" className="hover:text-blue-200">
                      {t('Add Property')}
                    </Link>
                  </>
                )}
                {user?.role === 'tenant' && (
                  <Link to="/my-rentals" className="hover:text-blue-200">
                    {t('My Rentals')}
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center hover:text-blue-200">
                    <span>{user?.first_name || user?.email}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
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
              <>
                <Link to="/login" className="hover:text-blue-200">
                  {t('Login')}
                </Link>
                <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100">
                  {t('Register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
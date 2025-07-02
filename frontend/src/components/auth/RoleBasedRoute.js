import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

/**
 * A route component that restricts access based on user role.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string|string[]} props.allowedRoles - Role(s) allowed to access this route
 * @param {string} [props.redirectTo='/dashboard'] - Path to redirect to if unauthorized
 */
const RoleBasedRoute = ({ children, allowedRoles, redirectTo = '/dashboard' }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  // Check if user has the required role
  const userRole = user?.profile?.role;
  const hasRequiredRole = Array.isArray(allowedRoles) 
    ? allowedRoles.includes(userRole)
    : userRole === allowedRoles;

  // Render children if user has the required role, otherwise redirect
  return hasRequiredRole ? children : <Navigate to={redirectTo} />;
};

export default RoleBasedRoute;
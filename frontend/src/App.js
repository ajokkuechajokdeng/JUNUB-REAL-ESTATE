import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/auth/Profile';
import PropertyList from './pages/properties/PropertyList';
import PropertyDetail from './pages/properties/PropertyDetail';
import AddProperty from './pages/properties/AddProperty';
import EditProperty from './pages/properties/EditProperty';
import Dashboard from './pages/dashboard/Dashboard';
import MyRentals from './pages/dashboard/MyRentals';
import MyProperties from './pages/dashboard/MyProperties';
import Favorites from './pages/dashboard/Favorites';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';
import useAlan from './hooks/useAlan';

function App() {
  const { t } = useTranslation();
  useAlan();

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/properties" element={<PropertyList />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/my-rentals" element={
              <RoleBasedRoute allowedRoles="tenant" redirectTo="/dashboard">
                <MyRentals />
              </RoleBasedRoute>
            } />
            <Route path="/favorites" element={
              <RoleBasedRoute allowedRoles="tenant" redirectTo="/dashboard">
                <Favorites />
              </RoleBasedRoute>
            } />
            <Route path="/my-properties" element={
              <RoleBasedRoute allowedRoles="agent" redirectTo="/dashboard">
                <MyProperties />
              </RoleBasedRoute>
            } />
            <Route path="/add-property" element={
              <RoleBasedRoute allowedRoles="agent" redirectTo="/dashboard">
                <AddProperty />
              </RoleBasedRoute>
            } />
            <Route path="/properties/edit/:id" element={
              <RoleBasedRoute allowedRoles="agent" redirectTo="/dashboard">
                <EditProperty />
              </RoleBasedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;

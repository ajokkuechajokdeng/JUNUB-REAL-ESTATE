import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Load user data if token exists
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getProfile();
          setUser(res.data);
        } catch (err) {
          console.error("Error loading user:", err);
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authAPI.login(email, password);
      const { access, refresh } = res.data;
      localStorage.setItem("token", access);
      localStorage.setItem("refreshToken", refresh);
      setToken(access);
      const userRes = await authAPI.getProfile();
      setUser(userRes.data);
      // Redirect based on role
      if (userRes.data?.profile?.role === "agent") {
        navigate("/dashboard");
      } else {
        navigate("/my-rentals");
      }
      return true;
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
      return false;
    }
  };

  // Register function
  const register = async (userData) => {
    setError(null);
    try {
      const res = await authAPI.register(userData);
      const { access, refresh } = res.data;
      localStorage.setItem("token", access);
      localStorage.setItem("refreshToken", refresh);
      setToken(access);
      const userRes = await authAPI.getProfile();
      setUser(userRes.data);
      // Redirect based on role (default tenant)
      if (userRes.data?.profile?.role === "agent") {
        navigate("/dashboard");
      } else {
        navigate("/my-rentals");
      }
      return true;
    } catch (err) {
      let msg = "Registration failed. Please try again.";
      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          msg = err.response.data;
        } else if (typeof err.response.data === "object") {
          msg = Object.entries(err.response.data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join(" | ");
        }
      }
      setError(msg);
      return false;
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await authAPI.updateProfile(profileData);
      setUser({ ...user, ...res.data });
      return true;
    } catch (err) {
      setError(
        err.response?.data || "Failed to update profile. Please try again."
      );
      return false;
    }
  };

  // Change password function
  const changePassword = async (passwordData) => {
    setError(null);
    try {
      await authAPI.changePassword(passwordData);
      return true;
    } catch (err) {
      setError(
        err.response?.data || "Failed to change password. Please try again."
      );
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  // Check if user is authenticated
  const isAuthenticated = () => !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

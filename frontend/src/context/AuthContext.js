import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import axios from "axios";

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
          console.log("Loading user data from token");
          const res = await authAPI.getProfile();
          console.log("User data loaded:", res.data);
          console.log("User role loaded:", res.data?.profile?.role);
          setUser(res.data);
        } catch (err) {
          console.error("Error loading user:", err);
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        console.log("No token found, user not authenticated");
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

      // Debug: Log user data after login
      console.log("User data after login:", userRes.data);
      console.log("User role after login:", userRes.data?.profile?.role);

      setUser(userRes.data);
      // Redirect based on role
      if (userRes.data?.profile?.role === "agent") {
        console.log("Redirecting to agent dashboard");
        navigate("/dashboard");
      } else {
        console.log("Redirecting to tenant rentals");
        navigate("/");
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
      // Debug: Log the role being sent during registration
      console.log("Registering with role:", userData.role);

      const res = await authAPI.register(userData);
      const { access, refresh } = res.data;
      localStorage.setItem("token", access);
      localStorage.setItem("refreshToken", refresh);
      setToken(access);
      const userRes = await authAPI.getProfile();

      // Debug: Log user data after registration
      console.log("User data after registration:", userRes.data);
      console.log("User role after registration:", userRes.data?.profile?.role);

      setUser(userRes.data);
      // Redirect based on role (default tenant)
      if (userRes.data?.profile?.role === "agent") {
        console.log("Redirecting to agent dashboard after registration");
        navigate("/dashboard");
      } else {
        console.log("Redirecting to tenant rentals after registration");
        navigate("/");
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

  // Refresh token function
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        logout();
        return false;
      }

      const response = await axios.post(
        "https://junub-real-estate.onrender.com/api/users/token/refresh/",
        { refresh: refreshToken }
      );

      const { access } = response.data;
      localStorage.setItem("token", access);
      setToken(access);
      return true;
    } catch (err) {
      console.error("Error refreshing token:", err);
      logout();
      return false;
    }
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
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

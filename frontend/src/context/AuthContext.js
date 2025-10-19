import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Set axios default header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Load user data
  const loadUser = async () => {
    try {
      const response = await axios.get("/api/auth/me");
      setUser(response.data.data);
    } catch (error) {
      console.error("Failed to load user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      const response = await axios.post("/api/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Registration failed" };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      const response = await axios.post("/api/auth/login", credentials);
      const { token, ...userData } = response.data.data;

      localStorage.setItem("token", token);
      setToken(token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      const response = await axios.get(`/api/auth/verify/${token}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Verification failed" };
    }
  };

  // Resend verification email
  const resendVerification = async (email) => {
    try {
      const response = await axios.post("/api/auth/resend-verification", {
        email,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to resend verification email",
        }
      );
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    verifyEmail,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

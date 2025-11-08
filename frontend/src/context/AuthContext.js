import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// ============================
// Context setup
// ============================
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// ============================
// Auth Provider
// ============================
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Automatically detect backend protocol (HTTP or HTTPS)
  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL ||
    `${window.location.protocol === 'https:' ? 'https' : 'http'}://localhost:5000`;

  // For debug visibility
  console.log('🔗 Using backend URL:', BACKEND_URL);

  // ============================
  // Check login state
  // ============================
  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Optionally fetch profile here if backend supports /auth/me
        setUser({ username: 'demoUser', email: 'user@example.com' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // ============================
  // Login
  // ============================
  const login = async (credentials) => {
    try {
      console.log('🔐 Attempting login:', credentials);

      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true, ...data };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, message: error.message };
    }
  };

  // ============================
  // Register
  // ============================
  const register = async (userData) => {
    try {
      console.log('🧾 Attempting registration:', userData);

      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: userData.full_name || userData.fullName,
          id_number: userData.id_number || userData.idNumber,
          account_number: userData.account_number || userData.accountNumber,
          username: userData.username,
          password: userData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true, ...data };
    } catch (error) {
      console.error('❌ Registration error:', error);
      return { success: false, message: error.message };
    }
  };

  // ============================
  // Logout
  // ============================
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    console.log('🚪 Logged out');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

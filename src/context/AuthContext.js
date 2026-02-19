import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services';

// Create the context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = authService.getAuthToken();
    const storedOrgId = localStorage.getItem('orgId');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      setToken(storedToken);
      setOrgId(storedOrgId);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authService.login(email, password);
      const { token: newToken, user: newUser } = response.data;

      // Determine org_id from user or default
      const newOrgId = newUser.org_id || '101';

      // Store in state
      setToken(newToken);
      setOrgId(newOrgId);
      setUser(newUser);

      // Store in localStorage
      authService.setAuthToken(newToken, newOrgId);
      localStorage.setItem('user', JSON.stringify(newUser));

      return { success: true, user: newUser };
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setOrgId(null);
    authService.clearAuth();
  }, []);

  // Fetch current user profile
  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authService.getCurrentUser();
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      // If 401, clear auth
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const value = {
    user,
    token,
    orgId,
    loading,
    error,
    login,
    logout,
    fetchCurrentUser,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

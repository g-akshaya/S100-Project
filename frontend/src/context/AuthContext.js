import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, refreshToken as apiRefreshToken } from '../api/client';
import { getTokens, setTokens, removeTokens } from '../utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const tokens = getTokens();
      if (tokens && tokens.access) {
        // Attempt to refresh token to validate it's still good
        try {
          const newAccess = await apiRefreshToken(tokens.refresh);
          setTokens({ ...tokens, access: newAccess });
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Token refresh failed:", error);
          removeTokens();
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const tokens = await loginUser(username, password);
      setTokens(tokens);
      setIsAuthenticated(true);
      return tokens;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    removeTokens();
    setIsAuthenticated(false);
  };

  const authData = {
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authData}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, clearAuthToken, getAuthToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load demo users and active user
  useEffect(() => {
    async function init() {
      try {
        const users = await api.getDemoUsers();
        setDemoUsers(users);

        const token = getAuthToken();
        if (token) {
          try {
            const me = await api.getMe();
            // Match with demo user info if present
            const matched = users.find((u) => u.user_id === me.user_id);
            setCurrentUser(matched || me);
          } catch (e) {
            clearAuthToken();
          }
        }
      } catch (err) {
        console.error('Failed to init auth context:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const resp = await api.login(email, password);
      setAuthToken(resp.access_token);
      const matched = demoUsers.find((u) => u.user_id === resp.user_id) || resp;
      setCurrentUser(matched);
      return resp;
    } finally {
      setLoading(false);
    }
  };

  const switchUser = async (userId) => {
    setLoading(true);
    try {
      const resp = await api.switchUser(userId);
      setAuthToken(resp.access_token);
      const matched = demoUsers.find((u) => u.user_id === resp.user_id) || resp;
      setCurrentUser(matched);
      return resp;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        demoUsers,
        loading,
        login,
        switchUser,
        logout,
        isAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);


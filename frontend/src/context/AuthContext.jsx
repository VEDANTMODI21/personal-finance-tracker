import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../services/auth.api';
import { setAccessToken, setUnauthorizedHandler, extractErrorMessage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyDarkMode = useCallback((enabled) => {
    document.documentElement.classList.toggle('dark', !!enabled);
  }, []);

  const bootstrap = useCallback(async () => {
    try {
      const refreshRes = await authApi.refresh();
      setAccessToken(refreshRes.data.data.accessToken);
      setUser(refreshRes.data.data.user);
      applyDarkMode(refreshRes.data.data.user.darkMode);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [applyDarkMode]);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(
    async (credentials) => {
      const res = await authApi.login(credentials);
      setAccessToken(res.data.data.accessToken);
      setUser(res.data.data.user);
      applyDarkMode(res.data.data.user.darkMode);
      return res.data.data.user;
    },
    [applyDarkMode],
  );

  const register = useCallback(
    async (payload) => {
      const res = await authApi.register(payload);
      setAccessToken(res.data.data.accessToken);
      setUser(res.data.data.user);
      applyDarkMode(res.data.data.user.darkMode);
      return res.data.data.user;
    },
    [applyDarkMode],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      if ('darkMode' in patch) applyDarkMode(patch.darkMode);
      return next;
    });
  }, [applyDarkMode]);

  const value = { user, loading, login, register, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export { extractErrorMessage };

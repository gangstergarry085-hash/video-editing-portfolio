import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setToken, clearToken, getToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function checkAuth() {
    // If no token stored, skip the API call
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await authAPI.me();
      setUser(data.user);
    } catch {
      setUser(null);
      clearToken();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  async function login(email, password) {
    const { data } = await authAPI.login(email, password);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function logout() {
    clearToken();
    setUser(null);
    try {
      await authAPI.logout();
    } catch {
      // Ignore — token already cleared client-side
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

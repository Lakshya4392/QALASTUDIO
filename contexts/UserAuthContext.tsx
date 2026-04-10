import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface UserProfile {
  id: string;
  email: string;
  phone: string;
  role: string;
  fullName: string | null;
}

interface UserAuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const data = await api.user.getMe();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.user.login(email, password);
      if (res.success) {
        if (res.token) localStorage.setItem('user_token', res.token);
        await fetchUser();
        return { success: true };
      }
      return { success: false, error: res.error || 'Invalid credentials' };
    } catch {
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (fullName: string, email: string, phone: string, password: string) => {
    try {
      const res = await api.user.register(fullName, email, phone, password);
      if (res.success) {
        if (res.token) localStorage.setItem('user_token', res.token);
        await fetchUser();
        return { success: true };
      }
      return { success: false, error: res.error || 'Registration failed' };
    } catch {
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = async () => {
    await api.user.logout();
    localStorage.removeItem('user_token');
    setUser(null);
  };

  return (
    <UserAuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      refreshUser: fetchUser,
    }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider');
  return ctx;
};

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, demoUsers } from '@/data/demo-data';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dalia_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (username: string, _password: string) => {
    const found = demoUsers.find(u => u.username === username || u.email === username);
    if (found) {
      setUser(found);
      localStorage.setItem('dalia_user', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dalia_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

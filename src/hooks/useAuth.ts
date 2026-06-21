// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        if (parsedUser.email?.trim().toLowerCase() === 'admin@glowcare.ai') {
          parsedUser.role = 'admin';
        }
        setUser(parsedUser);
      } catch (e) {
        console.error("Error formatting user signature mapping:", e);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    const adjustedUser = { ...userData };
    if (adjustedUser.email?.trim().toLowerCase() === 'admin@glowcare.ai') {
      adjustedUser.role = 'admin';
    }
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(adjustedUser));
    setUser(adjustedUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
  };

  return { user, login, logout, loading, getAuthToken };
};
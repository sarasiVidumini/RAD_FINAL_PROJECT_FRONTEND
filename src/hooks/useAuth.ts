
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
        console.error("Error parsing user:", e);
      }
    }
    setLoading(false);
  }, []);

  // Syncs local state with updated user object from API
  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...updatedData };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

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

  return { user, login, logout, updateUser, loading };
};
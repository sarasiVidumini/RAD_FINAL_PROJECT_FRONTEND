import { create } from 'zustand';

// Define the blueprint shape for a logged-in User profile node
interface User {
  _id: string;
  name: string;
  email: string;
  regNumber: string;
  role: 'student' | 'admin';
}

// Define the shape of our authentication store state and actions
interface AuthState {
  user: User | null;
  accessToken: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  // Initialize state values safely by parsing string items directly from localStorage
  user: (() => {
    try {
      const storedUser = localStorage.getItem('bf_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  })(),
  
  accessToken: localStorage.getItem('bf_token') || null,

  // Action executed upon successful verification API responses
  login: (user, token) => {
    localStorage.setItem('bf_user', JSON.stringify(user));
    localStorage.setItem('bf_token', token);
    set({ user, accessToken: token });
  },

  // Action executed to wipe tokens and close secure workspace connections
  logout: () => {
    localStorage.removeItem('bf_user');
    localStorage.removeItem('bf_token');
    set({ user: null, accessToken: null });
  },
}));
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  _id: string;
  fullname: string;
  email: string;
  profilePicture?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    set({ user: null, isAuthenticated: false });
  },
}));

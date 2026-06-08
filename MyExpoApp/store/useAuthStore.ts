import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://192.168.100.45:3000';

interface User {
  _id: string;
  fullname: string;
  email: string;
  profilePicture?: string;
  role?: string;
  department?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  socket: Socket | null;
  onlineUsers: string[];
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  connectSocket: () => Promise<void>;
  disconnectSocket: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  socket: null,
  onlineUsers: [],
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    if (user) {
      get().connectSocket();
    } else {
      get().disconnectSocket();
    }
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    get().disconnectSocket();
    set({ user: null, isAuthenticated: false });
  },
  connectSocket: async () => {
    const { user, socket } = get();
    if (!user || socket?.connected) return;

    const token = await SecureStore.getItemAsync('userToken');

    const newSocket = io(SOCKET_URL, {
      query: { userId: user._id },
      auth: { token },
    });

    newSocket.connect();
    set({ socket: newSocket });

    newSocket.on('getOnlineUsers', (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });

    newSocket.on('profileUpdated', (updatedUser: User) => {
      const currentUser = get().user;
      if (currentUser && updatedUser._id === currentUser._id) {
        set({ user: { ...currentUser, ...updatedUser } });
      }
    });

    newSocket.on('roleUpdated', ({ newRole }: { oldRole: string, newRole: string }) => {
      const currentUser = get().user;
      if (currentUser) {
        set({ user: { ...currentUser, role: newRole } });
      }
    });

    newSocket.on('departmentUpdated', ({ department }: { department: string }) => {
      const currentUser = get().user;
      if (currentUser) {
        set({ user: { ...currentUser, department } });
      }
    });
  },
  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
    }
    set({ socket: null, onlineUsers: [] });
  },
}));

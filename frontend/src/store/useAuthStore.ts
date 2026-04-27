import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const URL = "http://localhost:3000"
// const URL = ""

const BASE_URL = import.meta.env.MODE === "development" ? `${URL}` : "/";


interface AuthStore {
  authUser: any | null;
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  onlineUsers: string[];
  socket: any | null;
  checkAuth: () => Promise<void>;
  signup: (data: any) => Promise<void>;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  onlineUsers: [] as string[],
  socket: null,
  
  checkAuth: async () => {
    try {
        const res = await axiosInstance.get("/auth/check");
        set({authUser: res.data})
        get().connectSocket();
    } catch (error) {
        console.log("Error checking auth:", error);
        set({authUser: null})
    } finally {
        set({isCheckingAuth: false})
    }
  },

  signup: async (data) => {
    set({isSigningUp: true})
    try {
        const res = await axiosInstance.post("/auth/signup", data);
        set({authUser: res.data})
        get().connectSocket();
        toast.success("Đăng ký thành công! Bạn đã được đăng nhập.");
        set({isSigningUp: false})
    } catch (error: any) {
        set({isSigningUp: false})
        throw error;
    }
  },

  login: async (data) => {
    set({isLoggingIn: true})
    try {
        const res = await axiosInstance.post("/auth/login", data);
        set({authUser: res.data})
        get().connectSocket();
        toast.success("Đăng nhập thành công!");
        set({isLoggingIn: false})
    } catch (error: any) {
        set({isLoggingIn: false})
        throw error;
    }
  },

  logout: async () => {
    try {
        await axiosInstance.post("/auth/logout");
        set({authUser: null});
        get().disconnectSocket();
        toast.success("Đăng xuất thành công.");
    } catch (error) {
        console.log("Error during logout:", error);
        toast.error("Đăng xuất thất bại. Vui lòng thử lại.");
    }
  },

  updateProfile: async (data) => {
    try {
        const res = await axiosInstance.put("/auth/update-profile", data);
        set({authUser: res.data});
        toast.success("Profile updated successfully.");
    } catch (error: any) {
        const message = error?.response?.data?.message || "Profile update failed. Please try again.";
        toast.error(message);
    }
 },

 connectSocket: () => {
    const {authUser} = get()
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {withCredentials: true});
    socket.connect();

    set({socket});

    socket.on("getOnlineUsers", (userIds: any) => {
        set({ onlineUsers: userIds })
    })
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
    }
    set({socket: null, onlineUsers: []})
  }

}));
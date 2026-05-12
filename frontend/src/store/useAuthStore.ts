import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";
import { toast } from "react-hot-toast";
import { io, Socket } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

interface AuthStore {
  authUser: any | null;
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  socket: Socket | null;
  onlineUsers: string[];
  checkAuth: () => Promise<void>;
  signup: (data: any) => Promise<void>;
  login: (data: any) => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (data: any) => Promise<void>;
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
  socket: null,
  onlineUsers: [],
  
  checkAuth: async () => {
    try {
        const res = await axiosInstance.get("/auth/check");
        set({authUser: res.data});
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
        toast.success(res.data.message || "Đăng ký thành công! Vui lòng kiểm tra email để nhận mã OTP.");
    } catch (error: any) {
        set({isSigningUp: false})
        throw error;
    } finally {
        set({isSigningUp: false});
    }
  },

  login: async (data) => {
    set({isLoggingIn: true})
    try {
        const res = await axiosInstance.post("/auth/login", data);
        set({authUser: res.data});
        get().connectSocket();
        toast.success("Login successful!");
    } catch (error: any) {
        set({isLoggingIn: false})
        throw error;
    } finally {
        set({isLoggingIn: false});
    }
  },

  sendOtp: async (email) => {
    try {
      const res = await axiosInstance.post("/auth/send-otp", { email });
      toast.success(res.data.message || "Mã OTP đã được gửi.");
    } catch (error: any) {
      throw error;
    }
  },

  verifyOtp: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/verify-otp", data);
      toast.success(res.data.message || "Xác thực OTP thành công.");
    } catch (error: any) {
      throw error;
    }
  },

  logout: async () => {
    try {
        await axiosInstance.post("/auth/logout");
        set({authUser: null});
        get().disconnectSocket();
        toast.success("Logged out successfully.");
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
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
      withCredentials: true,
    });

    newSocket.connect();
    set({ socket: newSocket });

    newSocket.on("getOnlineUsers", (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
    }
    set({ socket: null, onlineUsers: [] });
  }
  
}));
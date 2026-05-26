import { authService } from "@/services/authService";
import { create } from "zustand";
import { toast } from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import { axiosInstance } from "@/lib/axios";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export interface AuthUser {
  _id: string;
  fullname: string;
  email: string;
  profilePicture: string;
  role: string;
  department?: string;
  phoneNumber?: string;
  age?: number;
  gender?: string;
  dateOfBirth?: string;
  permissions?: {
    viewChat?: boolean;
    viewContacts?: boolean;
    viewTasks?: boolean;
    editTasks?: boolean;
    approveTasks?: boolean;
    viewCloud?: boolean;
    viewTools?: boolean;
    viewAdmin?: boolean;
  };
}

interface AuthStore {
  authUser: AuthUser | null;
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
  roleChangeAlert: { oldRole: string, newRole: string } | null;
  accountLockAlert: { reason: string } | null;
  clearAlerts: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  socket: null,
  onlineUsers: [],
  roleChangeAlert: null,
  accountLockAlert: null,

  clearAlerts: () => set({ roleChangeAlert: null, accountLockAlert: null }),

  checkAuth: async () => {
    try {
      const data = await authService.checkAuth();
      set({ authUser: data });
      get().connectSocket();
    } catch (error) {
      console.log("Error checking auth:", error);
      set({ authUser: null })
    } finally {
      set({ isCheckingAuth: false })
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true })
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      toast.success(res.data.message || "Đăng ký thành công! Vui lòng kiểm tra email để nhận mã OTP.");
    } catch (error: any) {
      set({ isSigningUp: false })
      throw error;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true })
    try {
      const resData = await authService.login(data);
      set({ authUser: resData });
      get().connectSocket();
      toast.success("Login successful!");
      set({ isLoggingIn: false });
    } catch (error: any) {
      set({ isLoggingIn: false })
      throw error;
    } finally {
      set({ isLoggingIn: false });
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
      await authService.logout();
      set({ authUser: null });
      get().disconnectSocket();
      toast.success("Logged out successfully.");
    } catch (error) {
      console.log("Error during logout:", error);
      toast.error("Đăng xuất thất bại. Vui lòng thử lại.");
    }
  },

  updateProfile: async (data) => {
    try {
      const resData = await authService.updateProfile(data);
      set({ authUser: resData });
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

    newSocket.on("roleUpdated", (data) => {
      if (data && data.oldRole && data.newRole) {
        set({ roleChangeAlert: data });
      } else {
        toast.error("Vai trò của bạn đã bị thay đổi bởi Admin. Vui lòng đăng nhập lại.");
        get().logout();
      }
    });

    newSocket.on("accountLocked", (data) => {
      setTimeout(() => {
        set({ accountLockAlert: { reason: data?.reason || "Vi phạm quy định" } });
      }, 3000);
    });

    newSocket.on("profileUpdated", (updatedUser) => {
      const currentAuthUser = get().authUser;
      if (currentAuthUser && currentAuthUser._id === updatedUser._id) {
        set({
          authUser: {
            ...currentAuthUser,
            fullname: updatedUser.fullname,
            email: updatedUser.email,
            profilePicture: updatedUser.profilePicture,
            role: updatedUser.role,
            department: updatedUser.department,
            phoneNumber: updatedUser.phoneNumber,
            age: updatedUser.age,
            gender: updatedUser.gender,
            dateOfBirth: updatedUser.dateOfBirth,
          }
        });
      }
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
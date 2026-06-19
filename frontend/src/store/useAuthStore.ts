import { authService } from "@/services/authService";
import { create } from "zustand";
import { toast } from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import { axiosInstance } from "@/lib/axios";

const BASE_URL = import.meta.env.MODE === "development" ? "/" : "/";

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
  pinnedChats?: string[];
  mutedChats?: { chatId: string, mutedUntil: string }[];
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
  verifyLoginOtp: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  forceLogout: () => void;
  updateProfile: (data: any) => Promise<void>;
  pinChat: (chatId: string) => Promise<void>;
  muteChat: (chatId: string, mutedUntil?: string | null) => Promise<void>;
  changePassword: (data: any) => Promise<void>;
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
      
      // Check if 2FA OTP is required (202 Accepted response)
      if (resData.requiresOtp) {
        set({ isLoggingIn: false });
        const error: any = new Error(resData.message);
        error.response = { status: 202, data: resData };
        throw error;
      }
      
      set({ authUser: resData });
      get().connectSocket();
      toast.success("Đăng nhập thành công!");
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
      const resData = await authService.verifyOtp(data.email, data.otp);
      set({ authUser: resData });
      get().connectSocket();
      toast.success(resData.message || "Xác thực email thành công!");
    } catch (error: any) {
      throw error;
    }
  },

  verifyLoginOtp: async (data) => {
    try {
      const resData = await authService.verifyLoginOtp(data.email, data.otp);
      set({ authUser: resData });
      get().connectSocket();
      toast.success("Đăng nhập thành công!");
    } catch (error: any) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
      set({ authUser: null });
      get().disconnectSocket();
    } catch (error) {
      console.log("Error during logout:", error);
      // Still log them out locally even if server fails
      set({ authUser: null });
      get().disconnectSocket();
    }
  },

  forceLogout: () => {
    set({ authUser: null });
    get().disconnectSocket();
    window.location.href = "/login";
  },

  updateProfile: async (data) => {
    try {
      const resData = await authService.updateProfile(data);
      const currentAuthUser = get().authUser;
      if (currentAuthUser) {
        set({
          authUser: {
            ...currentAuthUser,
            fullname: resData.fullname,
            email: resData.email,
            profilePicture: resData.profilePicture,
            role: resData.role,
            department: resData.department,
            phoneNumber: resData.phoneNumber,
            age: resData.age,
            gender: resData.gender,
            dateOfBirth: resData.dateOfBirth,
          }
        });
      }
      toast.success("Cập nhật thành công.");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.";
      toast.error(message);
    }
  },

  pinChat: async (chatId: string) => {
    try {
      const resData = await authService.pinChat(chatId);
      const currentAuthUser = get().authUser;
      if (currentAuthUser) {
        set({ authUser: { ...currentAuthUser, pinnedChats: resData.pinnedChats } });
      }
    } catch (error) {
      console.log("Error pinning chat:", error);
      toast.error("Không thể ghim hội thoại.");
    }
  },

  muteChat: async (chatId: string, mutedUntil?: string | null) => {
    try {
      const resData = await authService.muteChat(chatId, mutedUntil);
      const currentAuthUser = get().authUser;
      if (currentAuthUser) {
        set({ authUser: { ...currentAuthUser, mutedChats: resData.mutedChats } });
      }
    } catch (error) {
      console.log("Error muting chat:", error);
      toast.error("Không thể cấu hình thông báo.");
    }
  },

  changePassword: async (data: any) => {
    try {
      const resData = await authService.changePassword(data);
      toast.success(resData.message || "Đổi mật khẩu thành công.");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Đổi mật khẩu thất bại.";
      toast.error(message);
      throw error;
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser) return;
    if (socket?.connected) return;
    if (socket) {
      socket.disconnect();
    }

    // Token sẽ được gửi tự động qua cookie với withCredentials: true
    const newSocket = io(BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    set({ socket: newSocket });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("connect_error", (error: any) => {
      console.error("Socket connect_error:", error.message);
    });

    newSocket.on("disconnect", (reason: any) => {
      console.log("Socket disconnected:", reason);
    });

    newSocket.on("getOnlineUsers", (userIds: string[]) => {
      console.log("Online users:", userIds);
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
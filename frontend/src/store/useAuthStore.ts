import { axiosInstance } from "@/lib/axios";
import {create} from "zustand";
import { toast } from "react-hot-toast";

interface AuthStore {
  authUser: any | null;
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  checkAuth: () => Promise<void>;
  signup: (data: any) => Promise<void>;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  
  checkAuth: async () => {
    try {
        const res = await axiosInstance.get("/auth/check");
        set({authUser: res.data})
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
        toast.success("Signup successful! You are now logged in.");
    } catch (error: any) {
        const message = error?.response?.data?.message || "Signup failed. Please try again.";
        toast.error(message);
    } finally {
        set({isSigningUp: false})
    }
  },

  login: async (data) => {
    set({isLoggingIn: true})
    try {
        const res = await axiosInstance.post("/auth/login", data);
        set({authUser: res.data})
        toast.success("Login successful!");
    } catch (error: any) {
        const message = error?.response?.data?.message || "Login failed. Please try again.";
        toast.error(message);
    } finally {
        set({isLoggingIn: false})
    }
  },

  logout: async () => {
    try {
        await axiosInstance.post("/auth/logout");
        set({authUser: null});
        toast.success("Logged out successfully.");
    } catch (error) {
        console.log("Error during logout:", error);
        toast.error("Logout failed. Please try again.");
    }
  }
  
}));
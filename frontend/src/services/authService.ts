import { axiosInstance } from "@/lib/axios";

export const authService = {
  checkAuth: async () => {
    const res = await axiosInstance.get("/auth/check");
    return res.data;
  },

  signup: async (data: any) => {
    const res = await axiosInstance.post("/auth/signup", data);
    return res.data;
  },

  login: async (data: any) => {
    const res = await axiosInstance.post("/auth/login", data);
    return res.data;
  },

  logout: async () => {
    await axiosInstance.post("/auth/logout");
  },

  sendOtp: async (email: string) => {
    const res = await axiosInstance.post("/auth/send-otp", { email });
    return res.data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const res = await axiosInstance.post("/auth/verify-otp", { email, otp });
    return res.data;
  },

  verifyLoginOtp: async (email: string, otp: string) => {
    const res = await axiosInstance.post("/auth/verify-login-otp", { email, otp });
    return res.data;
  },

  updateProfile: async (data: any) => {
    const res = await axiosInstance.put("/auth/update-profile", data);
    return res.data;
  }
};

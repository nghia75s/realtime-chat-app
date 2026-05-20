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

  updateProfile: async (data: any) => {
    const res = await axiosInstance.put("/auth/update-profile", data);
    return res.data;
  }
};

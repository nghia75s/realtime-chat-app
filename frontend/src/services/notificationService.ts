import { axiosInstance } from "../lib/axios";

export const notificationService = {
  fetchNotifications: async () => {
    const res = await axiosInstance.get("/notifications");
    return res.data;
  },

  markAsRead: async (id: string) => {
    const res = await axiosInstance.put(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await axiosInstance.put("/notifications/read-all");
    return res.data;
  }
};

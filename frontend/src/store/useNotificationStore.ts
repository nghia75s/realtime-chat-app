import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export interface NotificationItem {
  _id: string;
  sender: {
    _id: string;
    fullname: string;
    profilePicture: string;
  };
  type: string;
  taskId: {
    _id: string;
    title: string;
  };
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationStore {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  isSubscribed: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isSubscribed: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/notifications");
      set({ 
        notifications: res.data,
        unreadCount: res.data.filter((n: NotificationItem) => !n.isRead).length
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      set((state) => {
        const updated = state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        };
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await axiosInstance.put("/notifications/read-all");
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  },

  subscribeToNotifications: () => {
    const socket = useAuthStore.getState().socket;
    // Bug #6: Nếu socket chưa sẵn sàng, không đánh dấu đã subscribe
    // để TaskHeader có thể retry sau khi socket connect
    if (!socket) {
      console.warn("[Notification] Socket chưa sẵn sàng, bỏ qua subscribe.");
      return;
    }

    // Tránh đăng ký trùng lặp
    if (get().isSubscribed) return;

    socket.off("newNotification");
    socket.on("newNotification", (newNotif: NotificationItem) => {
      set((state) => {
        const updated = [newNotif, ...state.notifications];
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        };
      });
      toast.success(newNotif.message);
    });

    set({ isSubscribed: true });
  },

  unsubscribeFromNotifications: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newNotification");
    set({ isSubscribed: false });
  },
}));

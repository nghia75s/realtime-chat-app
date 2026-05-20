import { axiosInstance } from "@/lib/axios";

export const chatService = {
  getAllcontacts: async () => {
    const res = await axiosInstance.get("messages/contacts");
    return res.data;
  },

  getMyChatPartners: async () => {
    const res = await axiosInstance.get("messages/chats");
    return res.data;
  },

  getMyGroups: async () => {
    const res = await axiosInstance.get("groups/groups");
    return res.data;
  },

  getMessagesByUserId: async (userId: string) => {
    const res = await axiosInstance.get(`messages/${userId}`);
    return res.data;
  },

  getGroupMessageByUserId: async (groupId: string) => {
    const res = await axiosInstance.get(`groups/groups/${groupId}/messages`);
    return res.data;
  },

  sendMessage: async (userId: string, messageData: any) => {
    const res = await axiosInstance.post(`messages/send/${userId}`, messageData);
    return res.data;
  },

  sendGroupMessage: async (groupId: string, messageData: any) => {
    const res = await axiosInstance.post(`groups/groups/${groupId}/messages`, messageData);
    return res.data;
  },

  createGroup: async (groupData: { name: string; members: string[]; groupPicture?: string | null; description?: string }) => {
    const res = await axiosInstance.post("groups/groups", groupData);
    return res.data;
  },

  fetchUnreadSummary: async () => {
    const res = await axiosInstance.get("messages/unread-summary");
    return res.data;
  }
};

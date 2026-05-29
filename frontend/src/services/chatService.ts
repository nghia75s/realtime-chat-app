import { axiosInstance } from "@/lib/axios";
import type { DocumentPayload } from "@/store/useMessageBubbleStore";

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

  addGroupMember: async (groupId: string, userId: string) => {
    const res = await axiosInstance.post(`groups/groups/${groupId}/members`, { userId });
    return res.data;
  },

  removeGroupMember: async (groupId: string, userId: string) => {
    const res = await axiosInstance.delete(`groups/groups/${groupId}/members/${userId}`);
    return res.data;
  },

  fetchUnreadSummary: async () => {
    const res = await axiosInstance.get("messages/unread-summary");
    return res.data;
  },

  getManagers: async () => {
    const res = await axiosInstance.get("messages/managers");
    return res.data;
  },

  sendDocumentMessage: async (receiverId: string, documentPayload: DocumentPayload) => {
    const res = await axiosInstance.post(`messages/send-document/${receiverId}`, { documentPayload });
    return res.data;
  },

  replyDocumentMessage: async (messageId: string, status: "approved" | "rejected", note?: string) => {
    const res = await axiosInstance.patch(`messages/${messageId}/document-reply`, { status, note });
    return res.data;
  },

  recallMessage: async (messageId: string) => {
    const res = await axiosInstance.put(`messages/${messageId}/recall`);
    return res.data;
  },

  deleteMessage: async (messageId: string) => {
    const res = await axiosInstance.put(`messages/${messageId}/delete`);
    return res.data;
  },

  forwardMessage: async (messageId: string, receiverIds: string[], note?: string) => {
    const res = await axiosInstance.post(`messages/forward`, { messageId, receiverIds, note });
    return res.data;
  },

  pinMessage: async (messageId: string) => {
    const res = await axiosInstance.post(`messages/pin/${messageId}`);
    return res.data;
  },

  getPinnedMessages: async (chatId: string) => {
    const res = await axiosInstance.get(`messages/pinned/${chatId}`);
    return res.data;
  },

  updateGroupSettings: async (groupId: string, settings: any) => {
    const res = await axiosInstance.put(`groups/groups/${groupId}/settings`, { settings });
    return res.data;
  }
};

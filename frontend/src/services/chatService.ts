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
  },

  addGroupAdmin: async (groupId: string, userId: string) => {
    const res = await axiosInstance.post(`groups/groups/${groupId}/admins`, { userId });
    return res.data;
  },

  removeGroupAdmin: async (groupId: string, userId: string) => {
    const res = await axiosInstance.delete(`groups/groups/${groupId}/admins/${userId}`);
    return res.data;
  },

  transferGroupOwner: async (groupId: string, userId: string) => {
    const res = await axiosInstance.put(`groups/groups/${groupId}/transfer-owner`, { userId });
    return res.data;
  },

  getInviteLink: async (groupId: string) => {
    const res = await axiosInstance.get(`groups/groups/${groupId}/invite-link`);
    return res.data;
  },

  joinViaLink: async (inviteCode: string) => {
    const res = await axiosInstance.post(`groups/groups/join/${inviteCode}`);
    return res.data;
  },

  getPendingMembers: async (groupId: string) => {
    const res = await axiosInstance.get(`groups/groups/${groupId}/pending-members`);
    return res.data;
  },

  approveMember: async (groupId: string, userId: string) => {
    const res = await axiosInstance.post(`groups/groups/${groupId}/approve-member/${userId}`);
    return res.data;
  },

  rejectMember: async (groupId: string, userId: string) => {
    const res = await axiosInstance.post(`groups/groups/${groupId}/reject-member/${userId}`);
    return res.data;
  },

  getGroupInvitations: async () => {
    const res = await axiosInstance.get(`groups/group-invitations`);
    return res.data;
  },

  acceptGroupInvitation: async (groupId: string) => {
    const res = await axiosInstance.post(`groups/groups/${groupId}/invitations/accept`);
    return res.data;
  },

  declineGroupInvitation: async (groupId: string) => {
    const res = await axiosInstance.post(`groups/groups/${groupId}/invitations/decline`);
    return res.data;
  },

  // --- Poll & Note Features ---
  createNote: async (groupId: string, payload: any) => {
    const res = await axiosInstance.post(`messages/group/${groupId}/note`, payload);
    return res.data;
  },

  createPoll: async (groupId: string, payload: any) => {
    const res = await axiosInstance.post(`messages/group/${groupId}/poll`, payload);
    return res.data;
  },

  votePoll: async (messageId: string, optionIds: string[]) => {
    const res = await axiosInstance.post(`messages/poll/${messageId}/vote`, { optionIds });
    return res.data;
  },

  addPollOption: async (messageId: string, text: string) => {
    const res = await axiosInstance.post(`messages/poll/${messageId}/option`, { text });
    return res.data;
  }
};

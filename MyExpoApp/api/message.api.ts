import apiClient from './client';

export const getMessagesAPI = async (userId: string) => {
  const response = await apiClient.get(`/messages/${userId}`);
  return response.data;
};

export const sendMessageAPI = async (userId: string, data: { text?: string; image?: string; file?: any; replyTo?: string }) => {
  const response = await apiClient.post(`/messages/${userId}`, data);
  return response.data;
};

export const getChatPartnersAPI = async () => {
  const response = await apiClient.get('/messages/chats');
  return response.data;
};

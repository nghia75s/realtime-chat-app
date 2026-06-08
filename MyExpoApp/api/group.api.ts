import apiClient from './client';

// Get user's groups
export const getMyGroupsAPI = async () => {
  const response = await apiClient.get('/groups/groups');
  return response.data;
};

// Get messages for a specific group
export const getGroupMessagesAPI = async (groupId: string) => {
  const response = await apiClient.get(`/groups/groups/${groupId}/messages`);
  return response.data;
};

// Send a message to a group
export const sendGroupMessageAPI = async (groupId: string, data: any) => {
  const response = await apiClient.post(`/groups/groups/${groupId}/messages`, data);
  return response.data;
};

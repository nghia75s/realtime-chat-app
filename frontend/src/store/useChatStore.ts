import { axiosInstance } from "@/lib/axios";
import { create } from "zustand"
import { toast } from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

interface ChatStore {
    allContacts: any[];
    chats: any[];
    groups: any[];
    messages: any[];
    activeTab: string;
    selectedUser: any | null;
    isUsersLoading: boolean;
    isContactsLoading: boolean;
    isGroupsLoading: boolean;
    isMessagesLoading: boolean;
    setActiveTab: (tab: string) => void;
    setSelectedUser: (user: any | null) => void;
    getAllcontacts: () => Promise<void>;
    getMyChatPartners: () => Promise<void>;
    getMyGroups: () => Promise<void>;
    getMessagesByUserId: (userId: string) => Promise<void>;
    getGroupMessageByUserId: (groupId: string) => Promise<void>;
    sendMessage: (messageData: any) => Promise<void>;
    sendGroupMessage: (messageData: any) => Promise<void>;
    joinGroup: (groupId: string) => void;
    leaveGroup: (groupId: string) => void;
    subscribeToMessages: () => void;
    unsubscribeFromMessages: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    allContacts: [],
    chats: [],
    groups: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUsersLoading: false,
    isContactsLoading: false,
    isGroupsLoading: false,
    isMessagesLoading: false,
    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedUser: (user) => set({ selectedUser: user }),
    getAllcontacts: async () => {
        set({isContactsLoading: true});
        try {
            const res = await axiosInstance.get("messages/contacts");
            set({allContacts: res.data})
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to fetch contacts. Please try again.";
            toast.error(message);
        } finally {
            set({isContactsLoading: false})
        }
    },
    getMyChatPartners: async () => {
        set({isUsersLoading: true});
        try {
            const res = await axiosInstance.get("messages/chats");
            set({chats: res.data})
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to fetch chat partners. Please try again.";
            toast.error(message);
        } finally {
            set({isUsersLoading: false})
        }
    },
    getMyGroups: async () => {
        set({isGroupsLoading: true});
        try {
            const res = await axiosInstance.get("groups/groups");
            const groupsWithFlag = res.data.map((group: any) => ({
                ...group,
                isGroup: true
            }));
            set({groups: groupsWithFlag})
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to fetch groups. Please try again.";
            toast.error(message);
        } finally {
            set({isGroupsLoading: false})
        }
    },
    getMessagesByUserId: async (userId: string) => {
        set({isMessagesLoading: true});
        try {
            const res = await axiosInstance.get(`messages/${userId}`);
            set({messages: res.data})
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to fetch messages. Please try again.";
            toast.error(message);
        } finally {
            set({isMessagesLoading: false})
        }
    },
    getGroupMessageByUserId: async (groupId: string) => {
        set({isMessagesLoading: true});
        try {
            const res = await axiosInstance.get(`groups/groups/${groupId}/messages`);
            set({messages: res.data})
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to fetch group messages. Please try again.";
            toast.error(message);
        } finally {
            set({isMessagesLoading: false})
        }
    },
    sendMessage: async(messageData) => {
        const { selectedUser, messages } = get()
        try {
            const res = await axiosInstance.post(`messages/send/${selectedUser._id}`, messageData);
            set({messages: messages.concat(res.data)})
        } catch (error) {
            toast.error("Failed to send message. Please try again.");
            throw error;
        }
    },
    sendGroupMessage: async(messageData) => {
        const { selectedUser, messages } = get()
        try {
            const res = await axiosInstance.post(`groups/groups/${selectedUser._id}/messages`, messageData);
            set({messages: messages.concat(res.data)})
        } catch (error) {
            toast.error("Failed to send group message. Please try again.");
            throw error;
        }
    },
    joinGroup: (groupId) => {
        const socket = useAuthStore.getState().socket;
        if (!groupId || !socket) return;
        socket.emit("joinGroup", groupId);
    },
    leaveGroup: (groupId) => {
        const socket = useAuthStore.getState().socket;
        if (!groupId || !socket) return;
        socket.emit("leaveGroup", groupId);
    },
    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket?.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;

            set({
                messages: [...get().messages, newMessage],
            });
        });

        socket?.on("newGroupMessage", (newGroupMessage) => {
            if (!selectedUser?.isGroup) return;
            if (newGroupMessage.groupId !== selectedUser._id) return;
            set({
                messages: [...get().messages, newGroupMessage],
            });
        });
    },
    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
        socket?.off("newGroupMessage");
    }
}))
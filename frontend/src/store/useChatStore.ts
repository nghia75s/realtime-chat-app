import { axiosInstance } from "@/lib/axios";
import { create } from "zustand"
import { toast } from "react-hot-toast";

interface ChatStore {
    allContacts: any[];
    chats: any[];
    messages: any[];
    activeTab: string;
    selectedUser: any | null;
    isUsersLoading: boolean;
    isMessagesLoading: boolean;
    setActiveTab: (tab: string) => void;
    setSelectedUser: (user: any | null) => void;
    getAllcontacts: () => Promise<void>;
    getMyChatPartners: () => Promise<void>;
    getMessagesByUserId: (userId: number) => Promise<void>;
    sendMessage: (messageData: any) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    allContacts: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedUser: (user) => set({ selectedUser: user }),
    getAllcontacts: async () => {
        set({isUsersLoading: true});
        try {
            const res = await axiosInstance.get("messages/contacts");
            set({allContacts: res.data})
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to fetch contacts. Please try again.";
            toast.error(message);
        } finally {
            set({isUsersLoading: false})
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
    getMessagesByUserId: async (userId: number) => {
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
    sendMessage: async(messageData) => {
        const { selectedUser, messages } = get()
        try {
            const res = await axiosInstance.post(`messages/send/${selectedUser._id}`, messageData);
            set({messages: messages.concat(res.data)})
        } catch (error) {
            toast.error("Failed to send message. Please try again.");
        }
    }
}))
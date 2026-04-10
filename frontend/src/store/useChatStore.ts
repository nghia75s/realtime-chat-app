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
}

export const useChatStore = create<ChatStore>((set) => ({
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
}))
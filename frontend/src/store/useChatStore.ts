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
    unreadChats: string[];
    unreadGroups: string[];
    setActiveTab: (tab: string) => void;
    addUnreadChat: (userId: string) => void;
    addUnreadGroup: (groupId: string) => void;
    removeUnreadChat: (userId: string) => void;
    removeUnreadGroup: (groupId: string) => void;
    setSelectedUser: (user: any | null) => void;
    getAllcontacts: () => Promise<void>;
    getMyChatPartners: () => Promise<void>;
    getMyGroups: () => Promise<void>;
    getMessagesByUserId: (userId: string) => Promise<void>;
    getGroupMessageByUserId: (groupId: string) => Promise<void>;
    sendMessage: (messageData: any) => Promise<void>;
    sendGroupMessage: (messageData: any) => Promise<void>;
    createGroup: (groupData: { name: string; members: string[]; groupPicture?: string | null; description?: string }) => Promise<any>;
    joinGroup: (groupId: string) => void;
    leaveGroup: (groupId: string) => void;
    subscribeToMessages: () => void;
    unsubscribeFromMessages: () => void;
}

// Helper: Đẩy item lên đầu mảng dựa theo _id, fallback unshift nếu chưa có
function pushToTop(list: any[], id: string, fallback: any): any[] {
    const updated = [...list];
    const idx = updated.findIndex(item => item._id === id);
    if (idx !== -1) {
        const [item] = updated.splice(idx, 1);
        updated.unshift(item);
    } else {
        updated.unshift(fallback);
    }
    return updated;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    allContacts: [],
    chats: [],
    groups: [],
    messages: [],
    activeTab: "personal",
    selectedUser: null,
    isUsersLoading: false,
    isContactsLoading: false,
    isGroupsLoading: false,
    isMessagesLoading: false,
    unreadChats: JSON.parse(localStorage.getItem("unreadChats") || "[]"),
    unreadGroups: JSON.parse(localStorage.getItem("unreadGroups") || "[]"),
    setActiveTab: (tab) => set({ activeTab: tab }),
    addUnreadChat: (userId) => set((state) => {
        if (!state.unreadChats.includes(userId)) {
            const newUnread = [...state.unreadChats, userId];
            localStorage.setItem("unreadChats", JSON.stringify(newUnread));
            return { unreadChats: newUnread };
        }
        return state;
    }),
    addUnreadGroup: (groupId) => set((state) => {
        if (!state.unreadGroups.includes(groupId)) {
            const newUnread = [...state.unreadGroups, groupId];
            localStorage.setItem("unreadGroups", JSON.stringify(newUnread));
            return { unreadGroups: newUnread };
        }
        return state;
    }),
    removeUnreadChat: (userId) => set((state) => {
        const newUnread = state.unreadChats.filter(id => id !== userId);
        localStorage.setItem("unreadChats", JSON.stringify(newUnread));
        return { unreadChats: newUnread };
    }),
    removeUnreadGroup: (groupId) => set((state) => {
        const newUnread = state.unreadGroups.filter(id => id !== groupId);
        localStorage.setItem("unreadGroups", JSON.stringify(newUnread));
        return { unreadGroups: newUnread };
    }),
    setSelectedUser: (user) => {
        set({ selectedUser: user });
        if (user) {
            if (user.isGroup) {
                get().removeUnreadGroup(user._id);
            } else {
                get().removeUnreadChat(user._id);
            }
        }
    },
    getAllcontacts: async () => {
        set({ isContactsLoading: true });
        try {
            const res = await axiosInstance.get("messages/contacts");
            set({ allContacts: res.data })
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to fetch contacts. Please try again.";
            toast.error(message);
        } finally {
            set({ isContactsLoading: false })
        }
    },
    getMyChatPartners: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("messages/chats");
            set({ chats: res.data })
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to fetch chat partners. Please try again.";
            toast.error(message);
        } finally {
            set({ isUsersLoading: false })
        }
    },
    getMyGroups: async () => {
        set({ isGroupsLoading: true });
        try {
            const res = await axiosInstance.get("groups/groups");
            const groupsWithFlag = res.data.map((group: any) => ({
                ...group,
                isGroup: true
            }));
            set({ groups: groupsWithFlag })
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to fetch groups. Please try again.";
            toast.error(message);
        } finally {
            set({ isGroupsLoading: false })
        }
    },
    getMessagesByUserId: async (userId: string) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`messages/${userId}`);
            set({ messages: res.data })
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to fetch messages. Please try again.";
            toast.error(message);
        } finally {
            set({ isMessagesLoading: false })
        }
    },
    getGroupMessageByUserId: async (groupId: string) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`groups/groups/${groupId}/messages`);
            set({ messages: res.data })
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to fetch group messages. Please try again.";
            toast.error(message);
        } finally {
            set({ isMessagesLoading: false })
        }
    },
    sendMessage: async (messageData) => {
        const { selectedUser, messages, chats } = get()
        try {
            const res = await axiosInstance.post(`messages/send/${selectedUser._id}`, messageData);
            set({ messages: messages.concat(res.data) })
            set({ chats: pushToTop(chats, selectedUser._id, selectedUser) });
        } catch (error) {
            toast.error("Failed to send message. Please try again.");
            throw error;
        }
    },
    sendGroupMessage: async (messageData) => {
        const { selectedUser, messages, groups } = get()
        try {
            const res = await axiosInstance.post(`groups/groups/${selectedUser._id}/messages`, messageData);
            set({ messages: messages.concat(res.data) })
            set({ groups: pushToTop(groups, selectedUser._id, selectedUser) });
        } catch (error) {
            toast.error("Failed to send group message. Please try again.");
            throw error;
        }
    },
    createGroup: async (groupData) => {
        set({ isGroupsLoading: true });
        try {
            const res = await axiosInstance.post("groups/groups", groupData);
            set({ groups: [{ ...res.data, isGroup: true }, ...get().groups] });
            return res.data;
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to create group. Please try again.";
            toast.error(message);
            throw error;
        } finally {
            set({ isGroupsLoading: false });
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
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        // Tách socket khỏi listener cũ trước khi thêm mới để tránh hàng lướt trùng lặp
        socket.off("newMessage");
        socket.off("newGroupMessage");
        socket.off("newGroupCreated");

        socket.on("newMessage", (newMessage) => {
            const currentSelectedUser = get().selectedUser;
            const senderIdToFind = typeof newMessage.senderId === "string" ? newMessage.senderId : newMessage.senderId?._id;

            // Nếu đang mở chat với người này, cập nhật tin nhắn
            if (currentSelectedUser && !currentSelectedUser.isGroup && senderIdToFind === currentSelectedUser._id) {
                set({ messages: [...get().messages, newMessage] });
            }

            // Đẩy cuộc trò chuyện lên đầu danh sách
            const currentChats = get().chats;
            let updatedChats = [...currentChats];
            const existingIndex = updatedChats.findIndex(c => c._id === senderIdToFind);

            if (existingIndex !== -1) {
                const [chat] = updatedChats.splice(existingIndex, 1);
                updatedChats.unshift(chat);
                set({ chats: updatedChats });
            } else {
                const contactInfo = get().allContacts.find(c => c._id === senderIdToFind);
                if (contactInfo) {
                    updatedChats.unshift(contactInfo);
                    set({ chats: updatedChats });
                } else {
                    get().getMyChatPartners();
                }
            }

            // Đánh dấu chưa đọc nếu không phải đang xem chat với người này
            const isViewingThisChat = currentSelectedUser && !currentSelectedUser.isGroup && senderIdToFind === currentSelectedUser._id;
            if (!isViewingThisChat && senderIdToFind) {
                get().addUnreadChat(senderIdToFind);
            }
        });

        socket.on("newGroupMessage", (newGroupMessage) => {
            const currentSelectedUser = get().selectedUser;
            const rawGroupId = newGroupMessage.groupId;
            const groupIdToFind = typeof rawGroupId === "string" ? rawGroupId : rawGroupId?._id?.toString();

            // Cập nhật tin nhắn nếu đang mở nhóm này
            const isViewingThisGroup = currentSelectedUser?.isGroup && groupIdToFind === currentSelectedUser._id;
            if (isViewingThisGroup) {
                set({ messages: [...get().messages, newGroupMessage] });
            }

            // Đẩy nhóm lên đầu danh sách
            const currentGroups = get().groups;
            let updatedGroups = [...currentGroups];
            const existingIndex = updatedGroups.findIndex(g => g._id === groupIdToFind);

            if (existingIndex !== -1) {
                const [group] = updatedGroups.splice(existingIndex, 1);
                updatedGroups.unshift(group);
                set({ groups: updatedGroups });
            } else {
                // Nhóm chưa có trong danh sách, fetch lại
                get().getMyGroups();
            }

            // Đánh dấu chưa đọc nếu không phải đang xem nhóm này
            if (!isViewingThisGroup && groupIdToFind) {
                get().addUnreadGroup(groupIdToFind);
            }
        });

        socket.on("newGroupCreated", (newGroup) => {
            const currentGroups = get().groups;
            const groupIdStr = newGroup._id?.toString();
            if (groupIdStr && !currentGroups.some(g => g._id === groupIdStr || g._id?.toString() === groupIdStr)) {
                const newGroupWithFlag = { ...newGroup, isGroup: true };
                set({ groups: [newGroupWithFlag, ...currentGroups] });
            }
        });
    },
    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
        socket?.off("newGroupMessage");
        socket?.off("newGroupCreated");
    }
}))
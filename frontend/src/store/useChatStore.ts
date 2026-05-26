import { chatService } from "@/services/chatService";
import { create } from "zustand"
import { toast } from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import type { DocumentPayload } from "@/store/useMessageBubbleStore";

export interface ManagerUser {
  _id: string;
  fullname: string;
  profilePicture: string;
  role: string;
  department?: string;
  email: string;
}

interface ChatStore {
    allContacts: any[];
    chats: any[];
    groups: any[];
    messages: any[];
    managers: ManagerUser[];
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
    fetchUnreadSummary: () => Promise<void>;
    fetchManagers: () => Promise<void>;
    sendDocumentMessage: (receiverId: string, documentPayload: DocumentPayload) => Promise<any>;
    replyDocumentMessage: (messageId: string, status: "approved" | "rejected", note?: string) => Promise<any>;
    recallMessage: (messageId: string) => Promise<any>;
    deleteMessage: (messageId: string) => Promise<any>;
    forwardMessage: (messageId: string, receiverIds: string[], note?: string) => Promise<any>;
}

// Helper: Đẩy item lên đầu mảng dựa theo _id, fallback unshift nếu chưa có
function pushToTop(list: any[], id: string, fallback: any, newMessage?: any): any[] {
    const updated = [...list];
    const idx = updated.findIndex(item => item._id === id);
    if (idx !== -1) {
        const [item] = updated.splice(idx, 1);
        if (newMessage) {
            item.lastMessage = newMessage;
            item.lastMessageDate = newMessage.createdAt;
        }
        updated.unshift(item);
    } else {
        if (newMessage) {
            fallback.lastMessage = newMessage;
            fallback.lastMessageDate = newMessage.createdAt;
        }
        updated.unshift(fallback);
    }
    return updated;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    allContacts: [],
    chats: [],
    groups: [],
    messages: [],
    managers: [],
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
            const data = await chatService.getAllcontacts();
            set({ allContacts: Array.isArray(data) ? data : [] })
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
            const data = await chatService.getMyChatPartners();
            set({ chats: data })
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
            const data = await chatService.getMyGroups();
            const groupsWithFlag = data.map((group: any) => ({
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
            const data = await chatService.getMessagesByUserId(userId);
            set({ messages: data })
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
            const data = await chatService.getGroupMessageByUserId(groupId);
            set({ messages: data })
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
            const data = await chatService.sendMessage(selectedUser._id, messageData);
            set({ messages: messages.concat(data) })
            set({ chats: pushToTop(chats, selectedUser._id, selectedUser, data) });
        } catch (error) {
            toast.error("Failed to send message. Please try again.");
            throw error;
        }
    },
    sendGroupMessage: async (messageData) => {
        const { selectedUser, messages, groups } = get()
        try {
            const data = await chatService.sendGroupMessage(selectedUser._id, messageData);
            set({ messages: messages.concat(data) })
            set({ groups: pushToTop(groups, selectedUser._id, selectedUser, data) });
        } catch (error) {
            toast.error("Failed to send group message. Please try again.");
            throw error;
        }
    },
    createGroup: async (groupData) => {
        set({ isGroupsLoading: true });
        try {
            const data = await chatService.createGroup(groupData);
            set({ groups: [{ ...data, isGroup: true }, ...get().groups] });
            return data;
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
            const authUser = useAuthStore.getState().authUser;
            
            const msgSenderId = typeof newMessage.senderId === "string" ? newMessage.senderId : newMessage.senderId?._id;
            const msgReceiverId = typeof newMessage.receiverId === "string" ? newMessage.receiverId : newMessage.receiverId?._id;
            
            const partnerId = msgSenderId === authUser?._id ? msgReceiverId : msgSenderId;

            // Nếu đang mở chat với người này, cập nhật tin nhắn
            if (currentSelectedUser && !currentSelectedUser.isGroup && partnerId === currentSelectedUser._id) {
                set({ messages: [...get().messages, newMessage] });
            }

            // Đẩy cuộc trò chuyện lên đầu danh sách
            const currentChats = get().chats;
            let updatedChats = [...currentChats];
            const existingIndex = updatedChats.findIndex(c => c._id === partnerId);

            if (existingIndex !== -1) {
                const [chat] = updatedChats.splice(existingIndex, 1);
                chat.lastMessage = newMessage;
                chat.lastMessageDate = newMessage.createdAt;
                updatedChats.unshift(chat);
                set({ chats: updatedChats });
            } else {
                const contactInfo = get().allContacts.find(c => c._id === partnerId);
                if (contactInfo) {
                    const clonedContact = { ...contactInfo };
                    clonedContact.lastMessage = newMessage;
                    clonedContact.lastMessageDate = newMessage.createdAt;
                    updatedChats.unshift(clonedContact);
                    set({ chats: updatedChats });
                } else {
                    get().getMyChatPartners();
                }
            }

            // Đánh dấu chưa đọc nếu không phải đang xem chat với người này VÀ tin nhắn không phải do mình gửi
            const isViewingThisChat = currentSelectedUser && !currentSelectedUser.isGroup && partnerId === currentSelectedUser._id;
            if (!isViewingThisChat && partnerId && msgSenderId !== authUser?._id) {
                get().addUnreadChat(partnerId);
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
                group.lastMessage = newGroupMessage;
                group.lastMessageDate = newGroupMessage.createdAt;
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

        // Real-time: Quản lý phê duyệt / từ chối lá đơn
        socket.off("documentReplied");
        socket.on("documentReplied", ({ messageId, documentReplyData }: { messageId: string; documentReplyData: any }) => {
            set((state) => ({
                messages: state.messages.map((m) =>
                    m._id === messageId ? { ...m, documentReplyData } : m
                ),
            }));
        });

        socket.off("messageRecalled");
        socket.on("messageRecalled", ({ messageId, isRecalled }: { messageId: string; isRecalled: boolean }) => {
            set((state) => ({
                messages: state.messages.map((m) =>
                    m._id === messageId ? { ...m, isRecalled } : m
                ),
            }));
        });

        // Toast thông báo kết quả phê duyệt cho người gửi đơn
        socket.off("docApprovalNotif");
        socket.on("docApprovalNotif", ({ status, message }: { status: string; message: string }) => {
            if (status === "approved") {
                toast.success(message);
            } else {
                toast.error(message);
            }
        });
    },
    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
        socket?.off("newGroupMessage");
        socket?.off("newGroupCreated");
        socket?.off("documentReplied");
        socket?.off("docApprovalNotif");
        socket?.off("messageRecalled");
    },
    fetchUnreadSummary: async () => {
        try {
            const data = await chatService.fetchUnreadSummary();
            const { unreadChats, unreadGroups } = data;
            localStorage.setItem("unreadChats", JSON.stringify(unreadChats));
            localStorage.setItem("unreadGroups", JSON.stringify(unreadGroups));
            set({ unreadChats, unreadGroups });
        } catch (error) {
            console.error("Failed to fetch unread summary:", error);
        }
    },

    fetchManagers: async () => {
        try {
            const data = await chatService.getManagers();
            set({ managers: data });
        } catch (error) {
            console.error("Failed to fetch managers:", error);
        }
    },

    sendDocumentMessage: async (receiverId, documentPayload) => {
        try {
            const data = await chatService.sendDocumentMessage(receiverId, documentPayload);
            const { selectedUser, messages, chats } = get();
            // Nếu đang mở chat với người này thì thêm tin vào danh sách
            if (selectedUser?._id === receiverId) {
                set({ messages: [...messages, data] });
            }
            set({ chats: pushToTop(chats, receiverId, selectedUser, data) });
            return data;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể gửi lá đơn");
            throw error;
        }
    },

    replyDocumentMessage: async (messageId, status, note) => {
        try {
            const data = await chatService.replyDocumentMessage(messageId, status, note);
            // Cập nhật message trong danh sách hiện tại
            set((state) => ({
                messages: state.messages.map((m) =>
                    m._id === messageId ? { ...m, documentReplyData: data.documentReplyData } : m
                ),
            }));
            return data;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể gửi phản hồi");
            throw error;
        }
    },

    recallMessage: async (messageId) => {
        try {
            const data = await chatService.recallMessage(messageId);
            set((state) => ({
                messages: state.messages.map((m) =>
                    m._id === messageId ? { ...m, isRecalled: true } : m
                )
            }));
            return data;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi thu hồi tin nhắn");
            throw error;
        }
    },

    deleteMessage: async (messageId) => {
        try {
            const data = await chatService.deleteMessage(messageId);
            set((state) => ({
                messages: state.messages.filter((m) => m._id !== messageId)
            }));
            return data;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi xóa tin nhắn");
            throw error;
        }
    },

    forwardMessage: async (messageId, receiverIds, note) => {
        try {
            const data = await chatService.forwardMessage(messageId, receiverIds, note);
            // data is an array of newly created messages (forwarded messages and optional notes)
            const { selectedUser, messages, chats, groups } = get();
            
            let updatedChats = [...chats];
            let updatedGroups = [...groups];

            data.forEach((newMsg: any) => {
                const receiverId = newMsg.receiverId;
                const groupId = newMsg.groupId;
                
                if (receiverId) {
                    const targetUser = get().allContacts.find(c => c._id === receiverId) || { _id: receiverId };
                    updatedChats = pushToTop(updatedChats, receiverId, targetUser, newMsg);
                } else if (groupId) {
                    const targetGroup = groups.find(g => g._id === groupId) || { _id: groupId };
                    updatedGroups = pushToTop(updatedGroups, groupId, targetGroup, newMsg);
                }
            });

            let updatedMessages = [...messages];
            if (selectedUser) {
                const newMsgsForCurrentChat = data.filter((m: any) => 
                    (m.receiverId === selectedUser._id || m.groupId === selectedUser._id)
                );
                if (newMsgsForCurrentChat.length > 0) {
                    updatedMessages = [...updatedMessages, ...newMsgsForCurrentChat];
                }
            }

            set({ 
                chats: updatedChats, 
                groups: updatedGroups, 
                messages: updatedMessages 
            });

            toast.success("Đã chuyển tiếp tin nhắn");
            return data;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi chuyển tiếp tin nhắn");
            throw error;
        }
    },
}));

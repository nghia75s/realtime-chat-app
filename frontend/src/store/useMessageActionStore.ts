import { create } from "zustand";

interface MessageActionState {
  isSelectionMode: boolean;
  selectedMessageIds: string[];
  selectedMessagesData: any[];
  isForwardModalOpen: boolean;
  isDetailsModalOpen: boolean;
  detailsMessage: any | null;
  forwardMessages: any[] | null;

  toggleSelectionMode: (value: boolean) => void;
  toggleMessageSelection: (msgId: string, msg: any) => void;
  clearSelection: () => void;
  
  openForwardModal: (messages: any[]) => void;
  closeForwardModal: () => void;

  openDetailsModal: (message: any) => void;
  closeDetailsModal: () => void;
}

export const useMessageActionStore = create<MessageActionState>((set) => ({
  isSelectionMode: false,
  selectedMessageIds: [],
  selectedMessagesData: [],
  isForwardModalOpen: false,
  isDetailsModalOpen: false,
  detailsMessage: null,
  forwardMessages: null,

  toggleSelectionMode: (value) => set({ isSelectionMode: value, selectedMessageIds: [], selectedMessagesData: [] }),
  
  toggleMessageSelection: (msgId, msg) => set((state: any) => {
    const isSelected = state.selectedMessageIds.includes(msgId);
    if (isSelected) {
      return { 
        selectedMessageIds: state.selectedMessageIds.filter((id: string) => id !== msgId),
        selectedMessagesData: state.selectedMessagesData.filter((m: any) => m._id !== msgId)
      };
    } else {
      return { 
        selectedMessageIds: [...state.selectedMessageIds, msgId],
        selectedMessagesData: [...state.selectedMessagesData, msg]
      };
    }
  }),

  clearSelection: () => set({ isSelectionMode: false, selectedMessageIds: [], selectedMessagesData: [] }),

  openForwardModal: (messages) => set({ isForwardModalOpen: true, forwardMessages: messages }),
  closeForwardModal: () => set({ isForwardModalOpen: false, forwardMessages: null }),

  openDetailsModal: (message) => set({ isDetailsModalOpen: true, detailsMessage: message }),
  closeDetailsModal: () => set({ isDetailsModalOpen: false, detailsMessage: null }),
}));

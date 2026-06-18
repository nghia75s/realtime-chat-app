import { create } from "zustand";

export type DocCategory = "files" | "images" | "links" | "forms";

export interface DocumentItem {
  id: string;
  name: string;
  category: DocCategory;
  date: string;
  size?: string;
  url?: string;
  htmlContent?: string;
  status?: "pending" | "approved" | "rejected" | "overdue";
  taskStatus?: "pending" | "done" | "rejected";
  isTask?: boolean;
}

interface CloudStore {
  activeCategory: DocCategory | null;
  searchQuery: string;
  setActiveCategory: (category: DocCategory | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useCloudStore = create<CloudStore>((set) => ({
  activeCategory: null,
  searchQuery: "",
  setActiveCategory: (category) => set({ activeCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));

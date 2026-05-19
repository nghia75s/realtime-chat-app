import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export type TaskStatus = "pending" | "done";
export type AssigneeStatus = "pending" | "submitted" | "done" | "rejected";
export type CommitType = "create" | "commit" | "approve" | "reject" | "edit";

export interface CommitItem {
  _id: string;
  type: CommitType;
  userId: {
    _id: string;
    fullname: string;
    profilePicture: string;
  };
  description: string;
  fileName?: string;
  targetCommitId?: string;
  createdAt: string;
}

export interface TaskAssignee {
  _id: string;
  user: {
    _id: string;
    fullname: string;
    profilePicture: string;
    email: string;
  };
  status: AssigneeStatus;
  personalNote: string;
  canViewOthers: boolean;
}

export interface TaskItem {
  _id: string;
  title: string;
  description: string;
  creator: {
    _id: string;
    fullname: string;
    profilePicture: string;
    email: string;
  };
  assignees: TaskAssignee[];
  deadline: string;
  status: TaskStatus;
  commits: CommitItem[];
  createdAt: string;
}

interface TaskStore {
  tasks: TaskItem[];
  isLoading: boolean;
  isCreating: boolean;
  fetchTasks: () => Promise<void>;
  createTask: (data: {
    title: string;
    description: string;
    assignees: string[];
    groups?: string[];
    assigneeNotes?: Record<string, string>;
    deadline: string;
  }) => Promise<void>;
  editTask: (taskId: string, data: {
    description?: string;
    deadline?: string;
    assigneeNotes?: Record<string, string>;
  }) => Promise<void>;
  addCommit: (taskId: string, data: {
    type: CommitType;
    description: string;
    fileName?: string;
    targetCommitId?: string;
  }) => Promise<void>;
  updateAccess: (taskId: string, assigneeId: string, canViewOthers: boolean) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  isCreating: false,

  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/tasks");
      set({ tasks: res.data });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Không thể tải danh sách công việc");
    } finally {
      set({ isLoading: false });
    }
  },

  createTask: async (data) => {
    set({ isCreating: true });
    try {
      const res = await axiosInstance.post("/tasks", data);
      set((state) => ({ tasks: [res.data, ...state.tasks] }));
      toast.success("Đã tạo công việc thành công!");
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast.error(error.response?.data?.message || "Lỗi tạo công việc");
    } finally {
      set({ isCreating: false });
    }
  },

  editTask: async (taskId, data) => {
    try {
      const res = await axiosInstance.put(`/tasks/${taskId}`, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === taskId ? res.data : t)),
      }));
      toast.success("Đã cập nhật công việc!");
    } catch (error: any) {
      console.error("Error editing task:", error);
      toast.error(error.response?.data?.message || "Lỗi cập nhật công việc");
    }
  },

  addCommit: async (taskId, data) => {
    try {
      const res = await axiosInstance.post(`/tasks/${taskId}/commit`, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === taskId ? res.data : t)),
      }));
      toast.success("Đã cập nhật trạng thái công việc!");
    } catch (error: any) {
      console.error("Error adding commit:", error);
      toast.error(error.response?.data?.message || "Lỗi cập nhật công việc");
    }
  },

  updateAccess: async (taskId, assigneeId, canViewOthers) => {
    try {
      const res = await axiosInstance.patch(`/tasks/${taskId}/access`, {
        assigneeId,
        canViewOthers,
      });
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === taskId ? res.data : t)),
      }));
      toast.success(canViewOthers ? "Đã cho phép xem bài nhau" : "Đã tắt chia sẻ bài");
    } catch (error: any) {
      console.error("Error updating access:", error);
      toast.error(error.response?.data?.message || "Lỗi cập nhật quyền truy cập");
    }
  },
}));

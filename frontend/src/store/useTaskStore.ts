import { create } from "zustand";
import { taskService } from "@/services/taskService";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

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
  subscribeToTaskUpdates: () => void;
  unsubscribeFromTaskUpdates: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  isCreating: false,

  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const data = await taskService.fetchTasks();
      set({ tasks: data });
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
      const dataRes = await taskService.createTask(data);
      set((state) => ({ tasks: [dataRes, ...state.tasks] }));
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
      const dataRes = await taskService.editTask(taskId, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === taskId ? dataRes : t)),
      }));
      toast.success("Đã cập nhật công việc!");
    } catch (error: any) {
      console.error("Error editing task:", error);
      toast.error(error.response?.data?.message || "Lỗi cập nhật công việc");
    }
  },

  addCommit: async (taskId, data) => {
    try {
      const dataRes = await taskService.addCommit(taskId, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === taskId ? dataRes : t)),
      }));
      toast.success("Đã cập nhật trạng thái công việc!");
    } catch (error: any) {
      console.error("Error adding commit:", error);
      toast.error(error.response?.data?.message || "Lỗi cập nhật công việc");
    }
  },

  updateAccess: async (taskId, assigneeId, canViewOthers) => {
    try {
      const dataRes = await taskService.updateAccess(taskId, assigneeId, canViewOthers);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === taskId ? dataRes : t)),
      }));
      toast.success(canViewOthers ? "Đã cho phép xem bài nhau" : "Đã tắt chia sẻ bài");
    } catch (error: any) {
      console.error("Error updating access:", error);
      toast.error(error.response?.data?.message || "Lỗi cập nhật quyền truy cập");
    }
  },

  subscribeToTaskUpdates: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("taskUpdated");
    socket.on("taskUpdated", (updatedTask: TaskItem) => {
      set((state) => {
        const exists = state.tasks.some((t) => t._id === updatedTask._id);
        const newTasks = exists
          ? state.tasks.map((t) => (t._id === updatedTask._id ? updatedTask : t))
          : [updatedTask, ...state.tasks];
        return { tasks: newTasks };
      });
    });
  },

  unsubscribeFromTaskUpdates: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("taskUpdated");
  },
}));

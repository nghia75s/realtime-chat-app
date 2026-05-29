import { axiosInstance } from "../lib/axios";
import type { CommitType } from "@/store/useTaskStore";

export const taskService = {
  fetchTasks: async () => {
    const res = await axiosInstance.get("/tasks");
    return res.data;
  },

  createTask: async (data: {
    title: string;
    description: string;
    assignees: string[];
    groups?: string[];
    assigneeNotes?: Record<string, string>;
    deadline: string;
  }) => {
    const res = await axiosInstance.post("/tasks", data);
    return res.data;
  },

  editTask: async (taskId: string, data: {
    description?: string;
    deadline?: string;
    assigneeNotes?: Record<string, string>;
  }) => {
    const res = await axiosInstance.put(`/tasks/${taskId}`, data);
    return res.data;
  },

  addCommit: async (taskId: string, data: {
    type: CommitType;
    description: string;
    fileName?: string;
    targetCommitId?: string;
  }) => {
    const res = await axiosInstance.post(`/tasks/${taskId}/commit`, data);
    return res.data;
  },

  updateAccess: async (taskId: string, assigneeId: string, canViewOthers: boolean) => {
    const res = await axiosInstance.patch(`/tasks/${taskId}/access`, {
      assigneeId,
      canViewOthers,
    });
    return res.data;
  }
};

import { axiosInstance } from "@/lib/axios";
import type { AdminUser } from "@/store/useAdminStore";

export const adminService = {
  fetchUsers: async (page = 1, limit = 10) => {
    const res = await axiosInstance.get(`/admin/users?page=${page}&limit=${limit}`);
    return res.data;
  },

  fetchRoles: async () => {
    const res = await axiosInstance.get("/admin/roles");
    return res.data;
  },

  updateUserRole: async (id: string, role: string) => {
    const res = await axiosInstance.patch(`/admin/users/${id}/role`, { role });
    return res.data;
  },

  updateUserDepartment: async (id: string, department: string) => {
    const res = await axiosInstance.patch(`/admin/users/${id}/department`, { department });
    return res.data;
  },

  updateUserStatus: async (id: string, isActive: boolean, reason?: string) => {
    const res = await axiosInstance.patch(`/admin/users/${id}/status`, { isActive, reason });
    return res.data;
  },

  updateRolePermissions: async (id: string, permissions: any) => {
    const res = await axiosInstance.patch(`/admin/roles/${id}/permissions`, { permissions });
    return res.data;
  },

  updateUserProfileAdmin: async (id: string, data: Partial<AdminUser> & { profilePicture?: string }) => {
    const res = await axiosInstance.put(`/admin/users/${id}`, data);
    return res.data;
  }
};

import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { toast } from "react-hot-toast";

export interface AdminUser {
  _id: string;
  fullname: string;
  email: string;
  role: "admin" | "director" | "moderator" | "user";
  isActive: boolean;
  department?: string;
  profilePicture: string;
  createdAt: string;
}

export interface AdminStats {
  total: number;
  active: number;
  locked: number;
  admins: number;
  managers: number;
  employees: number;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export const ROLE_LABELS: Record<AdminUser["role"], string> = {
  admin: "Admin",
  director: "Giám Đốc",
  moderator: "Quản Lý",
  user: "Nhân Viên",
};

export const ROLE_COLORS: Record<AdminUser["role"], string> = {
  admin: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  director: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  moderator: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  user: "bg-[#2b2d31] text-[#a1a1a1] border border-[#3a3b3e]",
};

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: {
    viewChat: boolean;
    viewContacts: boolean;
    viewTasks: boolean;
    editTasks: boolean;
    approveTasks: boolean;
    viewCloud: boolean;
    viewTools: boolean;
    viewAdmin: boolean;
  };
}

export const DEPARTMENTS = [
  "Phòng Giám đốc",
  "Phòng Kinh doanh",
  "Phòng Marketing",
  "Phòng Hành chính Nhân sự",
  "Phòng Kế toán Tài chính",
  "Phòng Kỹ thuật",
];

interface AdminStore {
  users: AdminUser[];
  roles: Role[];
  stats: AdminStats | null;
  pagination: PaginationState;
  isLoading: boolean;
  
  fetchUsers: (page?: number, limit?: number) => Promise<void>;
  fetchRoles: () => Promise<void>;
  updateUserRole: (id: string, role: AdminUser["role"]) => Promise<void>;
  updateUserDepartment: (id: string, department: string) => Promise<void>;
  updateUserStatus: (id: string, isActive: boolean, reason?: string) => Promise<AdminUser | undefined>;
  updateRolePermissions: (id: string, permissions: Partial<Role['permissions']>) => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  users: [],
  roles: [],
  stats: null,
  pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
  isLoading: false,

  fetchUsers: async (page = 1, limit = 7) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/admin/users?page=${page}&limit=${limit}`);
      set({ 
        users: res.data.users, 
        stats: res.data.stats, 
        pagination: res.data.pagination 
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể tải danh sách người dùng");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRoles: async () => {
    try {
      const res = await axiosInstance.get('/admin/roles');
      set({ roles: res.data });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể tải danh sách vai trò");
    }
  },

  updateUserRole: async (id, role) => {
    try {
      const res = await axiosInstance.patch(`/admin/users/${id}/role`, { role });
      set(state => ({
        users: state.users.map(u => u._id === id ? { ...u, role } : u)
      }));
      toast.success(res.data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật vai trò");
      // Re-fetch to sync if failed
      get().fetchUsers(get().pagination.currentPage);
    }
  },

  updateUserDepartment: async (id, department) => {
    try {
      const res = await axiosInstance.patch(`/admin/users/${id}/department`, { department });
      set(state => ({
        users: state.users.map(u => u._id === id ? { ...u, department } : u)
      }));
      toast.success(res.data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật phòng ban");
      get().fetchUsers(get().pagination.currentPage);
    }
  },

  updateUserStatus: async (id, isActive, reason) => {
    try {
      const res = await axiosInstance.patch(`/admin/users/${id}/status`, { isActive, reason });
      set(state => ({
        users: state.users.map(u => u._id === id ? res.data.user : u)
      }));
      toast.success(res.data.message);
      return res.data.user;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật trạng thái");
    }
  },

  updateRolePermissions: async (id, permissions) => {
    try {
      const res = await axiosInstance.patch(`/admin/roles/${id}/permissions`, { permissions });
      set(state => ({
        roles: state.roles.map(r => r.id === id ? { ...r, permissions: res.data.role.permissions } : r)
      }));
      toast.success(res.data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật quyền");
    }
  }
}));

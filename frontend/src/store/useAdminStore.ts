import { create } from "zustand";
import { adminService } from "@/services/adminService";
import { toast } from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export interface AdminUser {
  _id: string;
  fullname: string;
  email: string;
  role: "admin" | "director" | "moderator" | "user";
  isActive: boolean;
  lockReason?: string;
  department?: string;
  phoneNumber?: string;
  age?: number;
  gender?: string;
  dateOfBirth?: string;
  createdAt: string;
  profilePicture?: string;
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

export const ROLE_LABELS: Record<string, string> = {
  admin: "Admin hệ thống",
  director: "Giám đốc",
  moderator: "Quản lý phòng ban",
  user: "Nhân viên",
};

export const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-500/20 text-red-400 border border-red-500/30",
  director: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  moderator: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
  user: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
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

export interface Department {
  _id: string;
  name: string;
  description: string;
  managerId?: string | null;
  createdAt: string;
}

interface AdminStore {
  users: AdminUser[];
  roles: Role[];
  departments: Department[];
  stats: AdminStats | null;
  pagination: PaginationState;
  isLoading: boolean;

  fetchUsers: (page?: number, limit?: number) => Promise<void>;
  fetchDepartments: () => Promise<void>;
  createDepartment: (name: string, description: string) => Promise<void>;
  updateDepartmentData: (id: string, name: string, description: string, managerId?: string | null) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  fetchRoles: () => Promise<void>;
  updateUserRole: (id: string, role: AdminUser["role"]) => Promise<void>;
  updateUserDepartment: (id: string, department: string) => Promise<void>;
  updateUserStatus: (id: string, isActive: boolean, reason?: string) => Promise<AdminUser | undefined>;
  updateRolePermissions: (id: string, permissions: Partial<Role['permissions']>) => Promise<void>;
  updateUserProfileAdmin: (id: string, data: Partial<AdminUser> & { profilePicture?: string }) => Promise<AdminUser | undefined>;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  users: [],
  roles: [],
  departments: [],
  stats: null,
  pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
  isLoading: false,

  fetchUsers: async (page = 1, limit = 7) => {
    set({ isLoading: true });
    try {
      const data = await adminService.fetchUsers(page, limit);
      set({
        users: data.users,
        stats: data.stats,
        pagination: data.pagination
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể tải danh sách người dùng");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDepartments: async () => {
    try {
      const data = await adminService.fetchDepartments();
      set({ departments: data });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể tải danh sách phòng ban");
    }
  },

  createDepartment: async (name, description) => {
    try {
      const data = await adminService.createDepartment(name, description);
      set(state => ({ departments: [...state.departments, data.department] }));
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi tạo phòng ban");
      throw err;
    }
  },

  updateDepartmentData: async (id, name, description, managerId) => {
    try {
      const data = await adminService.updateDepartment(id, name, description, managerId);
      set(state => ({
        departments: state.departments.map(d => d._id === id ? data.department : d)
      }));
      // Refresh users if department name changed to update their department strings
      get().fetchUsers(get().pagination.currentPage);
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật phòng ban");
      throw err;
    }
  },

  deleteDepartment: async (id) => {
    try {
      const data = await adminService.deleteDepartment(id);
      set(state => ({
        departments: state.departments.filter(d => d._id !== id)
      }));
      // Refresh users to clear their department
      get().fetchUsers(get().pagination.currentPage);
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi xóa phòng ban");
      throw err;
    }
  },

  fetchRoles: async () => {
    try {
      const data = await adminService.fetchRoles();
      set({ roles: data });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể tải danh sách vai trò");
    }
  },

  updateUserRole: async (id, role) => {
    try {
      const data = await adminService.updateUserRole(id, role);
      set(state => ({
        users: state.users.map(u => u._id === id ? { ...u, role } : u)
      }));

      const currentAuthUser = useAuthStore.getState().authUser;
      if (currentAuthUser && currentAuthUser._id === id) {
        useAuthStore.setState({ authUser: { ...currentAuthUser, role } });
      }

      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật vai trò");
      // Re-fetch to sync if failed
      get().fetchUsers(get().pagination.currentPage);
    }
  },

  updateUserDepartment: async (id, department) => {
    try {
      const data = await adminService.updateUserDepartment(id, department);
      set(state => ({
        users: state.users.map(u => u._id === id ? { ...u, department } : u)
      }));

      const currentAuthUser = useAuthStore.getState().authUser;
      if (currentAuthUser && currentAuthUser._id === id) {
        useAuthStore.setState({ authUser: { ...currentAuthUser, department } });
      }

      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật phòng ban");
      get().fetchUsers(get().pagination.currentPage);
    }
  },

  updateUserStatus: async (id, isActive, reason) => {
    try {
      const data = await adminService.updateUserStatus(id, isActive, reason);
      set(state => ({
        users: state.users.map(u => u._id === id ? data.user : u)
      }));
      toast.success(data.message);
      return data.user;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật trạng thái");
    }
  },

  updateRolePermissions: async (id, permissions) => {
    try {
      const data = await adminService.updateRolePermissions(id, permissions);
      set(state => ({
        roles: state.roles.map(r => r.id === id ? { ...r, permissions: data.role.permissions } : r)
      }));
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật quyền");
    }
  },

  updateUserProfileAdmin: async (id, data) => {
    set({ isLoading: true });
    try {
      const resData = await adminService.updateUserProfileAdmin(id, data);
      const updatedUser = resData.user;
      set(state => ({
        users: state.users.map(u => u._id === id ? updatedUser : u)
      }));

      // Cập nhật authUser trong useAuthStore nếu admin tự sửa chính mình
      const currentAuthUser = useAuthStore.getState().authUser;
      if (currentAuthUser && currentAuthUser._id === id) {
        useAuthStore.setState({
          authUser: {
            ...currentAuthUser,
            fullname: updatedUser.fullname,
            email: updatedUser.email,
            profilePicture: updatedUser.profilePicture,
            role: updatedUser.role,
            department: updatedUser.department,
            phoneNumber: updatedUser.phoneNumber,
            age: updatedUser.age,
            gender: updatedUser.gender,
            dateOfBirth: updatedUser.dateOfBirth,
          }
        });
      }

      toast.success(resData.message || "Cập nhật thành công!");
      return updatedUser;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật thông tin");
    } finally {
      set({ isLoading: false });
    }
  }
}));

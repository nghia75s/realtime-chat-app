export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  departmentId: string;
  avatar: string;
  isActive: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: {
    viewUsers: boolean;
    editUsers: boolean;
    viewTasks: boolean;
    editTasks: boolean;
    approveTasks: boolean;
    viewChat: boolean;
  };
}

export interface Department {
  id: string;
  name: string;
  description: string;
  managerId: string;
}

export const mockRoles: Role[] = [
  {
    id: "r1",
    name: "Admin",
    description: "Quản trị viên hệ thống",
    permissions: {
      viewUsers: true,
      editUsers: true,
      viewTasks: true,
      editTasks: true,
      approveTasks: true,
      viewChat: true,
    },
  },
  {
    id: "r2",
    name: "Quản Lý",
    description: "Quản lý phòng ban",
    permissions: {
      viewUsers: true,
      editUsers: false,
      viewTasks: true,
      editTasks: true,
      approveTasks: true,
      viewChat: true,
    },
  },
  {
    id: "r3",
    name: "Nhân Viên",
    description: "Nhân viên thông thường",
    permissions: {
      viewUsers: false,
      editUsers: false,
      viewTasks: true,
      editTasks: true,
      approveTasks: false,
      viewChat: true,
    },
  },
];

export const mockDepartments: Department[] = [
  { id: "d1", name: "Phòng Kỹ Thuật", description: "Phát triển và bảo trì phần mềm", managerId: "u1" },
  { id: "d2", name: "Phòng Marketing", description: "Quảng bá sản phẩm", managerId: "u3" },
  { id: "d3", name: "Phòng Nhân Sự", description: "Tuyển dụng và đào tạo", managerId: "u4" },
];

export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Tiến Đạt",
    email: "admin@gmail.com",
    roleId: "r1",
    departmentId: "d1",
    avatar: "https://i.pravatar.cc/150?u=1",
    isActive: true,
  },
  {
    id: "u2",
    name: "Nguyễn Văn A",
    email: "nva@gmail.com",
    roleId: "r3",
    departmentId: "d1",
    avatar: "https://i.pravatar.cc/150?u=2",
    isActive: true,
  },
  {
    id: "u3",
    name: "Trần Thị B",
    email: "ttb@gmail.com",
    roleId: "r2",
    departmentId: "d2",
    avatar: "https://i.pravatar.cc/150?u=3",
    isActive: true,
  },
  {
    id: "u4",
    name: "Lê Văn C",
    email: "lvc@gmail.com",
    roleId: "r2",
    departmentId: "d3",
    avatar: "https://i.pravatar.cc/150?u=4",
    isActive: false,
  },
  {
    id: "u5",
    name: "Phạm Thị D",
    email: "ptd@gmail.com",
    roleId: "r3",
    departmentId: "d2",
    avatar: "https://i.pravatar.cc/150?u=5",
    isActive: true,
  },
];

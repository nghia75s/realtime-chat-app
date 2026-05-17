import User from "../models/User.js";
import Role from "../models/Role.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

// GET /api/admin/roles — Lấy danh sách phân quyền
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: 1 });
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error in getAllRoles:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /api/admin/roles/:id/permissions — Cập nhật phân quyền
export const updateRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!permissions || typeof permissions !== "object") {
      return res.status(400).json({ message: "Permissions không hợp lệ" });
    }

    const role = await Role.findOne({ id });
    if (!role) {
      return res.status(404).json({ message: "Không tìm thấy vai trò" });
    }

    // Merge the new permissions with the existing ones
    role.permissions = { ...role.permissions, ...permissions };
    await role.save();

    res.status(200).json({ message: "Cập nhật quyền thành công", role });
  } catch (error) {
    console.error("Error in updateRolePermissions:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const skip = (page - 1) * limit;

    const totalCount = await User.countDocuments();
    const lockedCount = await User.countDocuments({ isActive: false });
    const activeCount = totalCount - lockedCount;
    const adminsCount = await User.countDocuments({ role: "admin" });
    const managersCount = await User.countDocuments({ role: "moderator" });
    const employeesCount = await User.countDocuments({ role: "user" });

    const users = await User.find()
      .select("-password -unreadSince")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const stats = {
      total: totalCount,
      active: activeCount,
      locked: lockedCount,
      admins: adminsCount,
      managers: managersCount,
      employees: employeesCount,
    };

    res.status(200).json({ 
      users, 
      stats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount
      }
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /api/admin/users/:id/role — Cập nhật vai trò
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["admin", "director", "moderator", "user"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Vai trò không hợp lệ" });
    }

    // Chặn admin tự sửa role của chính mình
    if (req.user._id.toString() === id) {
      return res.status(403).json({ message: "Không thể tự thay đổi vai trò của chính mình" });
    }

    const user = await User.findById(id).select("-password -unreadSince");
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Thông báo cho user qua socket để họ tự động đăng xuất
    const socketId = getReceiverSocketId(id);
    if (socketId) {
      io.to(socketId).emit("roleUpdated", { oldRole, newRole: role });
    }

    res.status(200).json({ message: "Cập nhật vai trò thành công", user });
  } catch (error) {
    console.error("Error in updateUserRole:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /api/admin/users/:id/status — Khoá / mở khoá tài khoản
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, reason } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive phải là boolean" });
    }

    // Chặn admin tự khoá chính mình
    if (req.user._id.toString() === id) {
      return res.status(403).json({ message: "Không thể tự khoá tài khoản của chính mình" });
    }

    const user = await User.findById(id).select("-password -unreadSince");
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    user.isActive = isActive;
    if (!isActive && reason) {
      user.lockReason = reason;
    } else if (isActive) {
      user.lockReason = "";
    }
    await user.save();

    if (!isActive) {
      const socketId = getReceiverSocketId(id);
      if (socketId) {
        io.to(socketId).emit("accountLocked", { reason: reason || "Vi phạm quy định" });
      }
    }

    const msg = isActive ? "Tài khoản đã được mở khoá" : "Tài khoản đã bị khoá";
    res.status(200).json({ message: msg, user });
  } catch (error) {
    console.error("Error in updateUserStatus:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /api/admin/users/:id/department — Cập nhật phòng ban
export const updateUserDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { department } = req.body;

    const user = await User.findById(id).select("-password -unreadSince");
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    user.department = department;
    await user.save();

    res.status(200).json({ message: "Cập nhật phòng ban thành công", user });
  } catch (error) {
    console.error("Error in updateUserDepartment:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

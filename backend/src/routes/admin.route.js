import express from "express";
import User from "../models/User.js";
import { getAllUsers, updateUserRole, updateUserStatus, updateUserDepartment, getAllRoles, updateRolePermissions, updateUserProfileAdmin } from "../controllers/admin.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Middleware: chỉ admin mới được vào
// Nếu user có email admin@gmail.com nhưng role chưa đúng → tự upgrade 1 lần
const requireAdmin = async (req, res, next) => {
  if (req.user?.role === "admin") return next();

  return res.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
};

router.use(protectRoute);
router.use(requireAdmin);

router.get("/users", getAllUsers);
router.put("/users/:id", updateUserProfileAdmin);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/department", updateUserDepartment);

router.get("/roles", getAllRoles);
router.patch("/roles/:id/permissions", updateRolePermissions);

export default router;

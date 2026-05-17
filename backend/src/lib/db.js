import mongoose from "mongoose";
import { ENV } from "./env.js";
import Role from "../models/Role.js";

const seedRoles = async () => {
  const rolesCount = await Role.countDocuments();
  if (rolesCount === 0) {
    console.log("Seeding default roles...");
    const defaultRoles = [
      {
        id: "admin",
        name: "Admin",
        description: "Quản trị viên hệ thống",
        permissions: { viewChat: true, viewContacts: true, viewTasks: true, editTasks: true, approveTasks: true, viewCloud: true, viewTools: true, viewAdmin: true },
      },
      {
        id: "director",
        name: "Giám Đốc",
        description: "Lãnh đạo cấp cao",
        permissions: { viewChat: true, viewContacts: true, viewTasks: true, editTasks: true, approveTasks: true, viewCloud: true, viewTools: true, viewAdmin: false },
      },
      {
        id: "moderator",
        name: "Quản Lý",
        description: "Quản lý phòng ban",
        permissions: { viewChat: true, viewContacts: true, viewTasks: true, editTasks: true, approveTasks: true, viewCloud: true, viewTools: true, viewAdmin: false },
      },
      {
        id: "user",
        name: "Nhân Viên",
        description: "Nhân viên thông thường",
        permissions: { viewChat: true, viewContacts: false, viewTasks: true, editTasks: false, approveTasks: false, viewCloud: true, viewTools: true, viewAdmin: false },
      },
    ];
    await Role.insertMany(defaultRoles);
    console.log("Default roles seeded successfully.");
  }
};

export const connectDB = async () => {
  try {
    const { MONGO_URI } = ENV;
    if (!MONGO_URI) throw new Error("MONGO_URI is not set");

    const conn = await mongoose.connect(ENV.MONGO_URI);
    console.log("MONGODB CONNECTED:", conn.connection.host);
    await seedRoles();
  } catch (error) {
    console.error("Error connection to MONGODB:", error);
    process.exit(1); // 1 status code means fail, 0 means success
  }
};

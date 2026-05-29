import mongoose from "mongoose";
import { ENV } from "./env.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const seedAdmin = async () => {
  try {
    const adminEmail = ENV.ADMIN_EMAIL;
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      console.log(`Seeding default admin account: ${adminEmail}`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ENV.ADMIN_PASSWORD, salt);

      const newAdmin = new User({
        fullname: ENV.ADMIN_FULLNAME,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        emailVerified: true,
      });

      await newAdmin.save();
      console.log("Admin account seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding admin:", error.message);
  }
};

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
    console.log(`MONGODB CONNECTED: ${conn.connection.host} (DB: ${conn.connection.name})`);
    await seedRoles();
    await seedAdmin();
  } catch (error) {
    console.error("Error connection to MONGODB:", error);
    process.exit(1); // 1 status code means fail, 0 means success
  }
};

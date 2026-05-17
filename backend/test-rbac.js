import mongoose from "mongoose";
import { ENV } from "./src/lib/env.js";
import Role from "./src/models/Role.js";
import User from "./src/models/User.js";

const testRBAC = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check Roles
    const rolesCount = await Role.countDocuments();
    console.log(`Found ${rolesCount} roles in database.`);
    
    if (rolesCount > 0) {
      const adminRole = await Role.findOne({ id: "admin" });
      console.log("Admin permissions:", adminRole.permissions);
    }

    // Verify a user
    const firstUser = await User.findOne();
    if (firstUser) {
      const roleDoc = await Role.findOne({ id: firstUser.role }).lean();
      const userPermissions = roleDoc ? roleDoc.permissions : {};
      console.log(`User ${firstUser.email} (Role: ${firstUser.role}) permissions:`, userPermissions);
    }

    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
};

testRBAC();

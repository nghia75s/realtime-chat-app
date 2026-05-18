import mongoose from "mongoose";
import { ENV } from "./src/lib/env.js";
import Task from "./src/models/Task.js";

const testTask = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if tasks exist
    const tasks = await Task.find().populate("creator").populate("assignees.user");
    console.log(`Found ${tasks.length} tasks in the database.`);

    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
};

testTask();

import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true, // admin, director, moderator, user
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    permissions: {
      viewChat: { type: Boolean, default: true },
      viewContacts: { type: Boolean, default: true },
      viewTasks: { type: Boolean, default: true },
      editTasks: { type: Boolean, default: false },
      approveTasks: { type: Boolean, default: false },
      viewCloud: { type: Boolean, default: true },
      viewTools: { type: Boolean, default: true },
      viewAdmin: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", roleSchema);
export default Role;

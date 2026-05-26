import mongoose from "mongoose";

const commitSchema = new mongoose.Schema({
  type: {
    type: String, // "create", "commit", "approve", "reject", "edit"
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
  },
  targetCommitId: {
    type: mongoose.Schema.Types.ObjectId, // For linking to the exact commit being approved/rejected
  }
}, { timestamps: true });

const taskAssigneeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String, // "pending", "submitted", "done", "rejected"
    enum: ["pending", "submitted", "done", "rejected"],
    default: "pending",
  },
  // Ghi chú riêng cho từng người được giao
  personalNote: {
    type: String,
    default: "",
  },
  // Cho phép xem bài nộp của người khác trong cùng task
  canViewOthers: {
    type: Boolean,
    default: false,
  },
});

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignees: [taskAssigneeSchema],
    deadline: {
      type: Date,
      required: true,
    },
    isOverdueReported: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String, // overall task status
      enum: ["pending", "done"],
      default: "pending",
    },
    commits: [commitSchema],
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;

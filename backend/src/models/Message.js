import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    image: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
    // --- Document Message Fields ---
    messageType: {
      type: String,
      enum: ["text", "document", "task_assignment"],
      default: "text",
    },
    documentPayload: {
      templateId: String,
      templateName: String,
      fields: { type: mongoose.Schema.Types.Mixed },
      htmlContent: String,
    },
    documentReplyData: {
      status: { type: String, enum: ["approved", "rejected"] },
      note: String,
      repliedAt: Date,
      repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    // --- Task Message Fields ---
    taskPayload: {
      taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
      title: String,
      description: String,
      deadline: Date,
      note: String,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;

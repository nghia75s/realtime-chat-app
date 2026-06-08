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
    file: {
      type: new mongoose.Schema({
        name: String,
        type: String,
        url: String,
        size: Number,
      }, { _id: false }),
    },
    read: {
      type: Boolean,
      default: false,
    },
    isRecalled: {
      type: Boolean,
      default: false,
    },
    isForwarded: {
      type: Boolean,
      default: false,
    },
    deletedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    // --- Document Message Fields ---
    messageType: {
      type: String,
      enum: ["text", "file", "document", "task_assignment", "system", "call_log"],
      default: "text",
    },
    callPayload: {
      callType: { type: String, enum: ["voice", "video"] },
      duration: { type: Number, default: 0 },
      status: { type: String, enum: ["completed", "rejected", "missed", "cancelled"], default: "completed" },
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
    isPinned: {
      type: Boolean,
      default: false,
    },
    pinnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;

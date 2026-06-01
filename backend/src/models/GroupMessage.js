import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema(
  {
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
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
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    isPinned: {
        type: Boolean,
        default: false,
    },
    pinnedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
      ref: "GroupMessage",
    },
    // --- Document Message Fields ---
    messageType: {
        type: String,
        enum: ["text", "file", "document", "task_assignment", "system", "poll", "note"],
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
    // --- Poll & Note Message Fields ---
    notePayload: {
        content: String
    },
    pollPayload: {
        question: String,
        options: [{
            _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
            text: String,
            voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
        }],
        deadline: Date,
        allowMultiple: { type: Boolean, default: false },
        allowAddOptions: { type: Boolean, default: false },
        hideResultsBeforeVoting: { type: Boolean, default: false },
        hideVoters: { type: Boolean, default: false }
    },
  },
  { timestamps: true }
);

const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);

export default GroupMessage;
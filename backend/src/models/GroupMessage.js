import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

const GroupMessage = mongoose.model("GroupMessage", groupSchema);

export default GroupMessage;
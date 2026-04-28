import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        groupPicture: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);

export default Group;
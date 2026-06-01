import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        admins: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        pendingMembers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        invitedMembers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        inviteLinkCode: {
            type: String,
            unique: true,
            sparse: true,
        },
        joinDates: {
            type: Map,
            of: Date,
            default: {},
        },
        groupPicture: {
            type: String,
            default: "",
        },
        settings: {
            memberPermissions: {
                changeNameAndAvatar: { type: Boolean, default: true },
                pinMessages: { type: Boolean, default: true },
                createNotes: { type: Boolean, default: true },
                createPolls: { type: Boolean, default: true },
                sendMessages: { type: Boolean, default: true }
            },
            joinApprovalMode: { type: Boolean, default: false },
            highlightAdminMessages: { type: Boolean, default: true },
            readRecentMessages: { type: Boolean, default: true },
            allowJoinLink: { type: Boolean, default: false }
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

groupSchema.virtual("memberCount").get(function () {
    return this.members?.length || 0;
});

const Group = mongoose.model("Group", groupSchema);

export default Group;
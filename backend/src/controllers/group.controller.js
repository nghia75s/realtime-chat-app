import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import GroupMessage from "../models/GroupMessage.js";
import Group from "../models/Group.js";
import User from "../models/User.js";

export const createGroup = async (req, res) => {
    try {
        const { name, description, members, groupPicture } = req.body;
        const creatorId = req.user._id;

        if (!name || !members || members.length === 0) {
            return res.status(400).json({ message: "Group name and members are required." });
        }

        const allMembers = [...new Set([...members, creatorId.toString()])];

        const group = new Group({
            name,
            description: description || "",
            members: allMembers,
            createdBy: creatorId,
            groupPicture: groupPicture || ""
        });

        await group.save();

        const populatedGroup = await Group.findById(group._id)
            .populate("members", "-password")
            .populate("createdBy", "-password");

        // Emit newGroupCreated event to all members EXCEPT the creator
        populatedGroup.members.forEach(member => {
            const memberIdStr = member._id.toString();
            if (memberIdStr !== creatorId.toString()) {
                const receiverSocketId = getReceiverSocketId(memberIdStr);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newGroupCreated", populatedGroup);
                }
            }
        });

        res.status(201).json(populatedGroup);
    } catch (error) {
        console.log("Error in createGroup controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMyGroups = async (req, res) => {
    try {
        const userId = req.user._id;
        const groups = await Group.find({ members: userId })
            .populate("members", "-password")
            .populate("createdBy", "-password")
            .sort({ updatedAt: -1 });
        res.status(200).json(groups);
    } catch (error) {
        console.log("Error in getMyGroups controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendGroupMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: groupId } = req.params;
        const senderId = req.user._id;
        if (!text && !image) {
            return res.status(400).json({ message: "Text or image is required." });
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found." });
        }
        if (!group.members.some(memberId => memberId.toString() === senderId.toString())) {
            return res.status(403).json({ message: "You are not a member of this group." });
        }
        let imageUrl;
        if (image) {
            // upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const groupMessage = new GroupMessage({ senderId, groupId, text, image: imageUrl });
        await groupMessage.save();

        // Populate sender info for the response
        const populatedMessage = await GroupMessage.findById(groupMessage._id).populate("senderId", "fullname profilePicture");

        // Emit the new group message to all group members except the sender
        group.members.forEach(memberId => {
            const memberIdStr = memberId.toString();
            if (memberIdStr !== senderId.toString()) {
                const receiverSocketId = getReceiverSocketId(memberIdStr);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newGroupMessage", populatedMessage);
                }
            }
        });

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.log("Error in sendGroupMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getGroupMessages = async (req, res) => {
    try {        
        const { id: groupId } = req.params;
        const userId = req.user._id;
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found." });
        }
        if (!group.members.some(memberId => memberId.toString() === userId.toString())) {
            return res.status(403).json({ message: "You are not a member of this group." });
        }
        const messages = await GroupMessage.find({ groupId }).populate("senderId", "fullname profilePicture").sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getGroupMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getGroupDetail = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const userId = req.user._id;

        // First check if user is a member without populating
        const groupCheck = await Group.findById(groupId);
        if (!groupCheck) {
            return res.status(404).json({ message: "Group not found." });
        }

        if (!groupCheck.members.some(memberId => memberId.toString() === userId.toString())) {
            return res.status(403).json({ message: "You are not a member of this group." });
        }

        // Now populate for the response
        const group = await Group.findById(groupId).populate("members", "-password").populate("createdBy", "-password");

        res.status(200).json(group);
    } catch (error) {
        console.log("Error in getGroupDetail controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateGroup = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const { name, description, groupPicture } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found." });
        }

        if (group.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only group creator can update group info." });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (groupPicture !== undefined) updateData.groupPicture = groupPicture;

        const updatedGroup = await Group.findByIdAndUpdate(groupId, updateData, { new: true })
            .populate("members", "-password")
            .populate("createdBy", "-password");

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.log("Error in updateGroup controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteGroup = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found." });
        }

        if (group.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only group creator can delete the group." });
        }

        // Delete all group messages
        await GroupMessage.deleteMany({ groupId });

        // Delete the group
        await Group.findByIdAndDelete(groupId);

        res.status(200).json({ message: "Group deleted successfully." });
    } catch (error) {
        console.log("Error in deleteGroup controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const addMember = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const { userId } = req.body;
        const currentUserId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found." });
        }

        if (group.createdBy.toString() !== currentUserId.toString()) {
            return res.status(403).json({ message: "Only group creator can add members." });
        }

        const userToAdd = await User.findById(userId);
        if (!userToAdd) {
            return res.status(404).json({ message: "User not found." });
        }

        if (group.members.some(memberId => memberId.toString() === userId.toString())) {
            return res.status(400).json({ message: "User is already a member of this group." });
        }

        group.members.push(userId);
        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate("members", "-password")
            .populate("createdBy", "-password");

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.log("Error in addMember controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const removeMember = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found." });
        }

        // Allow group creator or the user themselves to remove members
        if (group.createdBy.toString() !== currentUserId.toString() && currentUserId.toString() !== userId) {
            return res.status(403).json({ message: "You don't have permission to remove this member." });
        }

        if (!group.members.some(memberId => memberId.toString() === userId.toString())) {
            return res.status(400).json({ message: "User is not a member of this group." });
        }

        // Prevent removing the last member (group creator)
        if (group.members.length === 1) {
            return res.status(400).json({ message: "Cannot remove the last member from the group." });
        }

        group.members = group.members.filter(memberId => memberId.toString() !== userId);
        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate("members", "-password")
            .populate("createdBy", "-password");

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.log("Error in removeMember controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


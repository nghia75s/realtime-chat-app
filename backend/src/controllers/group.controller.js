import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import GroupMessage from "../models/GroupMessage.js";
import Group from "../models/Group.js";
import User from "../models/User.js";

export const createGroup = async (req, res) => {
    try {
        const { name, members, groupPicture } = req.body;
        const creatorId = req.user._id;
        if (!name || !members || members.length === 0) {
            return res.status(400).json({ message: "Group name and members are required." });
        }
        const allMembers = [...new Set([...members, creatorId.toString()])];
        const group = new Group({ name, members: allMembers, groupPicture });
        await group.save();
        res.status(201).json(group);
    } catch (error) {
        console.log("Error in createGroup controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getUserGroups = async (req, res) => {
    try {
        const userId = req.user._id;
        const groups = await Group.find({ members: userId }).populate("members", "-password");
        res.status(200).json(groups);
    } catch (error) {
        console.log("Error in getUserGroups controller: ", error.message);
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
        if (!group.members.includes(senderId)) {
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

        // Emit the new group message to all group members except the sender
        const receiverIds = group.members.filter((memberId) => memberId.toString() !== senderId.toString());
        receiverIds.forEach((receiverId) => {
            const socketId = getReceiverSocketId(receiverId);
            if (socketId) {
                io.to(socketId).emit("newGroupMessage", { groupMessage, groupId });
            }
        });
        res.status(201).json(groupMessage);
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
        if (!group.members.includes(userId)) {
            return res.status(403).json({ message: "You are not a member of this group." });
        }
        const messages = await GroupMessage.find({ groupId }).populate("senderId", "username profilePicture");
        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getGroupMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


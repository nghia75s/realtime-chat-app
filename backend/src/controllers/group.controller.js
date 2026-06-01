import cloudinary from "../lib/cloudinary.js";
import { emitToUser } from "../lib/socket.js";
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
                emitToUser(memberIdStr, "newGroupCreated", populatedGroup);
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

        // Lấy lastMessage cho từng nhóm
        const groupsWithLastMessage = await Promise.all(groups.map(async (group) => {
            const lastMsg = await GroupMessage.findOne({ groupId: group._id }).sort({ createdAt: -1 }).populate("senderId", "fullname");
            return {
                ...group.toObject(),
                lastMessage: lastMsg || null,
                lastMessageDate: lastMsg ? lastMsg.createdAt : group.createdAt
            };
        }));

        // Sắp xếp lại theo lastMessageDate giảm dần
        groupsWithLastMessage.sort((a, b) => {
            const dateA = new Date(a.lastMessageDate);
            const dateB = new Date(b.lastMessageDate);
            return dateB - dateA;
        });

        res.status(200).json(groupsWithLastMessage);
    } catch (error) {
        console.log("Error in getMyGroups controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendGroupMessage = async (req, res) => {
    try {
        const { text, image, file, replyTo } = req.body;
        const { id: groupId } = req.params;
        const senderId = req.user._id;
        if (!text && !image && !file) {
            return res.status(400).json({ message: "Text, image, or file is required." });
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found." });
        }
        if (!group.members.some(memberId => memberId.toString() === senderId.toString())) {
            return res.status(403).json({ message: "You are not a member of this group." });
        }

        const isCreator = group.createdBy.toString() === senderId.toString();
        const isAdmin = group.admins && group.admins.some(adminId => adminId.toString() === senderId.toString());
        const canSendMessages = group.settings?.memberPermissions?.sendMessages !== false;

        if (!isCreator && !isAdmin && !canSendMessages) {
            return res.status(403).json({ message: "You don't have permission to send messages in this group." });
        }
        let imageUrl;
        if (image) {
            // upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        let filePayload;
        if (file?.data) {
            const fileName = file.name || "attachment";
            const fileBaseName = fileName.replace(/\.[^/.]+$/, "");
            const fileExtension = fileName.split(".").pop()?.toLowerCase();
            const uploadResponse = await cloudinary.uploader.upload(file.data, {
                resource_type: "raw",
                public_id: fileBaseName,
                format: fileExtension,
                use_filename: false,
                unique_filename: false,
            });
            filePayload = {
                name: file.name,
                type: file.type,
                size: file.size,
                url: uploadResponse.secure_url,
            };
        }
        const groupMessage = new GroupMessage({ senderId, groupId, text, image: imageUrl, file: filePayload, replyTo, messageType: filePayload ? "file" : "text" });
        await groupMessage.save();

        // Populate sender info for the response
        let populatedMessage = await GroupMessage.findById(groupMessage._id).populate("senderId", "fullname profilePicture");
        
        if (replyTo) {
            populatedMessage = await populatedMessage.populate({
                path: "replyTo",
                select: "text image senderId",
                populate: { path: "senderId", select: "fullname" }
            });
        }

        // Emit the new group message to all group members except the sender
        group.members.forEach(memberId => {
            const memberIdStr = memberId.toString();
            if (memberIdStr !== senderId.toString()) {
                emitToUser(memberIdStr, "newGroupMessage", populatedMessage);
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
        let query = { groupId, deletedBy: { $ne: userId } };
        
        if (group.settings?.readRecentMessages === false) {
            const joinDate = group.joinDates?.get(userId.toString());
            if (joinDate) {
                query.createdAt = { $gte: joinDate };
            }
        }

        const messages = await GroupMessage.find(query)
            .populate("senderId", "fullname profilePicture")
          .populate({
            path: "replyTo",
            select: "text image senderId",
            populate: { path: "senderId", select: "fullname" }
          })
          .sort({ createdAt: 1 });

        // Đánh dấu đã đọc: thêm userId vào readBy của các tin chưa đọc (không phải do mình gửi)
        await GroupMessage.updateMany(
            { groupId, senderId: { $ne: userId }, readBy: { $nin: [userId] } },
            { $addToSet: { readBy: userId } }
        );

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

        const isCreator = group.createdBy.toString() === userId.toString();
        const isAdmin = group.admins && group.admins.some(adminId => adminId.toString() === userId.toString());
        const canChangeNameAndAvatar = group.settings?.memberPermissions?.changeNameAndAvatar !== false;

        if (!isCreator && !isAdmin && !canChangeNameAndAvatar) {
            return res.status(403).json({ message: "You don't have permission to update group info." });
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

        if (group.createdBy.toString() !== currentUserId.toString() && (!group.admins || !group.admins.some(adminId => adminId.toString() === currentUserId.toString()))) {
            return res.status(403).json({ message: "Only group creator and admins can add members." });
        }

        const userToAdd = await User.findById(userId);
        if (!userToAdd) {
            return res.status(404).json({ message: "User not found." });
        }

        if (group.members.some(memberId => memberId.toString() === userId.toString())) {
            return res.status(400).json({ message: "User is already a member of this group." });
        }

        if (group.invitedMembers?.some(memberId => memberId.toString() === userId.toString())) {
            return res.status(400).json({ message: "User is already invited to this group." });
        }

        if (!group.invitedMembers) group.invitedMembers = [];
        group.invitedMembers.push(userId);
        
        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate("members", "-password")
            .populate("createdBy", "-password");

        // --- Emit Invitation Event ---
        emitToUser(userId.toString(), "newGroupInvitation", updatedGroup);

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

        // Permissions check
        const isCreator = group.createdBy.toString() === currentUserId.toString();
        const isAdmin = group.admins && group.admins.some(adminId => adminId.toString() === currentUserId.toString());
        const isSelf = currentUserId.toString() === userId;
        const isTargetCreator = group.createdBy.toString() === userId;
        const isTargetAdmin = group.admins && group.admins.some(adminId => adminId.toString() === userId);

        if (!isCreator && !isAdmin && !isSelf) {
            return res.status(403).json({ message: "You don't have permission to remove this member." });
        }

        if (isAdmin && !isCreator && !isSelf) {
            if (isTargetCreator || isTargetAdmin) {
                return res.status(403).json({ message: "Admins cannot remove the creator or other admins." });
            }
        }

        // Bug #3: Prevent creator from removing themselves — would lose group ownership
        if (userId === group.createdBy.toString()) {
            return res.status(400).json({ message: "Người tạo nhóm không thể rời khỏi nhóm. Hãy chuyển quyền sở hữu trước." });
        }

        if (!group.members.some(memberId => memberId.toString() === userId.toString())) {
            return res.status(400).json({ message: "User is not a member of this group." });
        }

        // Prevent removing the last member (group creator)
        if (group.members.length === 1) {
            return res.status(400).json({ message: "Cannot remove the last member from the group." });
        }

        // Grab the user details to use in the system message
        const userRemoved = await User.findById(userId);

        group.members = group.members.filter(memberId => memberId.toString() !== userId);
        if (group.admins) {
            group.admins = group.admins.filter(adminId => adminId.toString() !== userId);
        }
        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate("members", "-password")
            .populate("createdBy", "-password");

        // --- Create & Emit System Message ---
        const isLeaving = currentUserId.toString() === userId;
        const text = isLeaving 
            ? `${req.user.fullname} đã rời khỏi nhóm.` 
            : `${req.user.fullname} đã xóa ${userRemoved.fullname} khỏi nhóm.`;

        const systemMessage = new GroupMessage({
            senderId: currentUserId,
            groupId: groupId,
            text,
            messageType: "system"
        });
        await systemMessage.save();
        const populatedMessage = await GroupMessage.findById(systemMessage._id).populate("senderId", "fullname profilePicture");
        
        // Phát tới những người còn lại trong nhóm
        updatedGroup.members.forEach(member => {
            emitToUser(member._id.toString(), "newGroupMessage", populatedMessage);
            emitToUser(member._id.toString(), "groupUpdated", updatedGroup);
        });
        // Báo cho người bị kick (hoặc tự rời) để họ cập nhật (nếu cần)
        emitToUser(userId, "newGroupMessage", populatedMessage);
        emitToUser(userId, "groupUpdated", updatedGroup);

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.log("Error in removeMember controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateGroupSettings = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const { settings, name, groupPicture } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found." });
        }

        if (group.createdBy.toString() !== userId.toString() && (!group.admins || !group.admins.some(adminId => adminId.toString() === userId.toString()))) {
            return res.status(403).json({ message: "Only group creator and admins can update group settings." });
        }

        const updateData = {};
        if (settings) updateData.settings = settings;
        if (name) updateData.name = name;

        if (groupPicture) {
            // Upload to cloudinary
            try {
                // Ensure cloudinary is imported at the top if not already, but wait, cloudinary is imported in auth.controller. Let me assume it's imported here or I should import it. Wait, if it's not imported in group.controller.js, it will throw an error. I must check if cloudinary is imported in group.controller.js! Let me just put the code and if it fails I'll import it. Wait, I should probably check imports first.
                // Assuming it might not be imported, I will require it dynamically or use the standard import.
                const cloudinary = (await import("../lib/cloudinary.js")).default;
                const uploadResponse = await cloudinary.uploader.upload(groupPicture);
                updateData.groupPicture = uploadResponse.secure_url;
            } catch (uploadError) {
                console.log("Error uploading group picture:", uploadError);
                return res.status(500).json({ message: "Lỗi tải ảnh lên" });
            }
        }

        const updatedGroup = await Group.findByIdAndUpdate(
            groupId, 
            { $set: updateData }, 
            { new: true }
        ).populate("members", "-password").populate("createdBy", "-password");

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.log("Error in updateGroupSettings controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const addAdmin = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const { userId: adminUserId } = req.body;
        const currentUserId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found." });

        if (group.createdBy.toString() !== currentUserId.toString()) {
            return res.status(403).json({ message: "Only group creator can assign admins." });
        }
        
        if (!group.admins) group.admins = [];
        
        if (group.admins.some(id => id.toString() === adminUserId.toString())) {
            return res.status(400).json({ message: "User is already an admin." });
        }

        group.admins.push(adminUserId);
        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate("members", "-password")
            .populate("createdBy", "-password");

        const userAdded = await User.findById(adminUserId);
        const systemMessage = new GroupMessage({
            senderId: currentUserId,
            groupId: groupId,
            text: `${req.user.fullname} đã chỉ định ${userAdded.fullname} làm phó nhóm.`,
            messageType: "system"
        });
        await systemMessage.save();
        const populatedMessage = await GroupMessage.findById(systemMessage._id).populate("senderId", "fullname profilePicture");
        
        updatedGroup.members.forEach(member => {
            emitToUser(member._id.toString(), "newGroupMessage", populatedMessage);
        });

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.log("Error in addAdmin controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const removeAdmin = async (req, res) => {
    try {
        const { id: groupId, userId: adminUserId } = req.params;
        const currentUserId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found." });

        if (group.createdBy.toString() !== currentUserId.toString()) {
            return res.status(403).json({ message: "Only group creator can remove admins." });
        }
        
        if (!group.admins) group.admins = [];

        group.admins = group.admins.filter(id => id.toString() !== adminUserId.toString());
        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate("members", "-password")
            .populate("createdBy", "-password");

        const userRemoved = await User.findById(adminUserId);
        const systemMessage = new GroupMessage({
            senderId: currentUserId,
            groupId: groupId,
            text: `${req.user.fullname} đã thu hồi quyền phó nhóm của ${userRemoved.fullname}.`,
            messageType: "system"
        });
        await systemMessage.save();
        const populatedMessage = await GroupMessage.findById(systemMessage._id).populate("senderId", "fullname profilePicture");
        
        updatedGroup.members.forEach(member => {
            emitToUser(member._id.toString(), "newGroupMessage", populatedMessage);
        });

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.log("Error in removeAdmin controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const transferOwner = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const { userId: newOwnerId } = req.body;
        const currentUserId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found." });

        if (group.createdBy.toString() !== currentUserId.toString()) {
            return res.status(403).json({ message: "Only group creator can transfer ownership." });
        }

        if (!group.members.some(m => m.toString() === newOwnerId.toString())) {
            return res.status(400).json({ message: "New owner must be a member of the group." });
        }

        group.createdBy = newOwnerId;
        // If new owner was an admin, remove them from admins array
        if (group.admins) {
            group.admins = group.admins.filter(id => id.toString() !== newOwnerId.toString());
        }
        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate("members", "-password")
            .populate("createdBy", "-password");

        const newOwner = await User.findById(newOwnerId);
        const systemMessage = new GroupMessage({
            senderId: currentUserId,
            groupId: groupId,
            text: `${req.user.fullname} đã chuyển quyền trưởng nhóm cho ${newOwner.fullname}.`,
            messageType: "system"
        });
        await systemMessage.save();
        const populatedMessage = await GroupMessage.findById(systemMessage._id).populate("senderId", "fullname profilePicture");
        
        updatedGroup.members.forEach(member => {
            emitToUser(member._id.toString(), "newGroupMessage", populatedMessage);
        });

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.log("Error in transferOwner controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// --- MEMBER APPROVAL & JOIN LINK APIS ---

import crypto from "crypto";

export const getInviteLink = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found." });

        const isCreator = group.createdBy.toString() === userId.toString();
        const isAdmin = group.admins && group.admins.some(adminId => adminId.toString() === userId.toString());
        
        if (!isCreator && !isAdmin) {
            return res.status(403).json({ message: "Only creator and admins can generate/view invite links." });
        }

        if (!group.inviteLinkCode) {
            group.inviteLinkCode = crypto.randomBytes(8).toString("hex");
            await group.save();
        }

        res.status(200).json({ inviteLinkCode: group.inviteLinkCode });
    } catch (error) {
        console.log("Error in getInviteLink: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const joinViaLink = async (req, res) => {
    try {
        const { inviteCode } = req.params;
        const userId = req.user._id;

        const group = await Group.findOne({ inviteLinkCode: inviteCode });
        if (!group) return res.status(404).json({ message: "Invalid invite link." });

        if (group.settings?.allowJoinLink === false) {
            return res.status(403).json({ message: "This group does not allow joining via link." });
        }

        if (group.members.some(memberId => memberId.toString() === userId.toString())) {
            return res.status(400).json({ message: "You are already a member of this group." });
        }

        if (group.settings?.joinApprovalMode === true) {
            if (group.pendingMembers?.some(memberId => memberId.toString() === userId.toString())) {
                return res.status(400).json({ message: "Your join request is already pending." });
            }
            if (!group.pendingMembers) group.pendingMembers = [];
            group.pendingMembers.push(userId);
            await group.save();
            return res.status(200).json({ status: "pending", message: "Join request sent. Please wait for admin approval." });
        } else {
            group.members.push(userId);
            if (!group.joinDates) group.joinDates = new Map();
            group.joinDates.set(userId, new Date());
            await group.save();
            
            const updatedGroup = await Group.findById(group._id)
                .populate("members", "-password")
                .populate("createdBy", "-password");
            
            const systemMsg = new GroupMessage({
                senderId: userId,
                groupId: group._id,
                messageType: "system",
                text: `Người dùng ${req.user.fullname} đã tham gia nhóm qua link.`,
            });
            await systemMsg.save();
            
            group.members.forEach(memberId => {
                emitToUser(memberId.toString(), "newGroupMessage", systemMsg);
            });

            return res.status(200).json({ status: "joined", group: updatedGroup });
        }
    } catch (error) {
        console.log("Error in joinViaLink: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getPendingMembers = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId).populate("pendingMembers", "-password");
        if (!group) return res.status(404).json({ message: "Group not found." });

        const isCreator = group.createdBy.toString() === userId.toString();
        const isAdmin = group.admins && group.admins.some(adminId => adminId.toString() === userId.toString());
        
        if (!isCreator && !isAdmin) {
            return res.status(403).json({ message: "Only creator and admins can view pending members." });
        }

        res.status(200).json(group.pendingMembers || []);
    } catch (error) {
        console.log("Error in getPendingMembers: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const approveMember = async (req, res) => {
    try {
        const { id: groupId, userId: targetUserId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found." });

        const isCreator = group.createdBy.toString() === userId.toString();
        const isAdmin = group.admins && group.admins.some(adminId => adminId.toString() === userId.toString());
        
        if (!isCreator && !isAdmin) {
            return res.status(403).json({ message: "Only creator and admins can approve members." });
        }

        if (!group.pendingMembers?.some(memberId => memberId.toString() === targetUserId)) {
            return res.status(400).json({ message: "User is not in pending list." });
        }

        group.pendingMembers = group.pendingMembers.filter(id => id.toString() !== targetUserId);
        
        if (!group.members.some(memberId => memberId.toString() === targetUserId)) {
            group.members.push(targetUserId);
            if (!group.joinDates) group.joinDates = new Map();
            group.joinDates.set(targetUserId, new Date());
        }
        
        await group.save();

        const approvedUser = await User.findById(targetUserId);

        const systemMsg = new GroupMessage({
            senderId: targetUserId,
            groupId: group._id,
            messageType: "system",
            text: `Người dùng ${approvedUser?.fullname || "Một thành viên"} đã được phê duyệt vào nhóm.`,
        });
        await systemMsg.save();
        
        group.members.forEach(memberId => {
            emitToUser(memberId.toString(), "newGroupMessage", systemMsg);
        });

        const updatedGroup = await Group.findById(group._id).populate("members", "-password").populate("createdBy", "-password");
        updatedGroup.members.forEach(member => {
            emitToUser(member._id.toString(), "groupUpdated", updatedGroup);
        });

        res.status(200).json({ message: "Member approved." });
    } catch (error) {
        console.log("Error in approveMember: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const rejectMember = async (req, res) => {
    try {
        const { id: groupId, userId: targetUserId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found." });

        const isCreator = group.createdBy.toString() === userId.toString();
        const isAdmin = group.admins && group.admins.some(adminId => adminId.toString() === userId.toString());
        
        if (!isCreator && !isAdmin) {
            return res.status(403).json({ message: "Only creator and admins can reject members." });
        }

        if (!group.pendingMembers?.some(memberId => memberId.toString() === targetUserId)) {
            return res.status(400).json({ message: "User is not in pending list." });
        }

        group.pendingMembers = group.pendingMembers.filter(id => id.toString() !== targetUserId);
        await group.save();

        res.status(200).json({ message: "Member rejected." });
    } catch (error) {
        console.log("Error in rejectMember: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getGroupInvitations = async (req, res) => {
    try {
        const userId = req.user._id;
        const groups = await Group.find({ invitedMembers: userId })
            .populate("createdBy", "fullname profilePicture");
        res.status(200).json(groups);
    } catch (error) {
        console.log("Error in getGroupInvitations: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const acceptGroupInvitation = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found." });

        if (!group.invitedMembers?.some(memberId => memberId.toString() === userId.toString())) {
            return res.status(400).json({ message: "You don't have an invitation to this group." });
        }

        group.invitedMembers = group.invitedMembers.filter(id => id.toString() !== userId.toString());
        
        if (!group.members.some(memberId => memberId.toString() === userId.toString())) {
            group.members.push(userId);
            if (!group.joinDates) group.joinDates = new Map();
            group.joinDates.set(userId, new Date());
        }
        
        await group.save();

        const updatedGroup = await Group.findById(group._id)
            .populate("members", "-password")
            .populate("createdBy", "-password");

        const systemMsg = new GroupMessage({
            senderId: userId,
            groupId: group._id,
            messageType: "system",
            text: `${req.user.fullname} đã tham gia nhóm.`,
        });
        await systemMsg.save();
        
        const populatedMessage = await GroupMessage.findById(systemMsg._id).populate("senderId", "fullname profilePicture");

        updatedGroup.members.forEach(member => {
            emitToUser(member._id.toString(), "newGroupMessage", populatedMessage);
            emitToUser(member._id.toString(), "groupUpdated", updatedGroup);
        });

        // Also emit to the user who accepted the invitation so they fetch their new groups
        emitToUser(userId.toString(), "newGroupCreated", updatedGroup);

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.log("Error in acceptGroupInvitation: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const declineGroupInvitation = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found." });

        if (!group.invitedMembers?.some(memberId => memberId.toString() === userId.toString())) {
            return res.status(400).json({ message: "You don't have an invitation to this group." });
        }

        group.invitedMembers = group.invitedMembers.filter(id => id.toString() !== userId.toString());
        await group.save();

        res.status(200).json({ message: "Invitation declined." });
    } catch (error) {
        console.log("Error in declineGroupInvitation: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

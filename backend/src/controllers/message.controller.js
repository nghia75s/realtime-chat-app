import cloudinary from "../lib/cloudinary.js";
import { emitToUser } from "../lib/socket.js";
import Message from "../models/Message.js";
import GroupMessage from "../models/GroupMessage.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $and: [
        {
          $or: [
            { senderId: myId, receiverId: userToChatId },
            { senderId: userToChatId, receiverId: myId },
          ],
        },
        { deletedBy: { $ne: myId } }
      ]
    }).populate({
      path: "replyTo",
      select: "text image senderId",
      populate: { path: "senderId", select: "fullname" }
    });

    // Đánh dấu đã đọc: các tin nhắn người kia gửi cho mình mà chưa đọc
    await Message.updateMany(
      { senderId: userToChatId, receiverId: myId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, file, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image && !file) {
      return res.status(400).json({ message: "Text, image, or file is required." });
    }
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
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

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      file: filePayload,
      replyTo,
      messageType: filePayload ? "file" : "text",
    });

    await newMessage.save();

    if (replyTo) {
      await newMessage.populate({
        path: "replyTo",
        select: "text image senderId",
        populate: { path: "senderId", select: "fullname" }
      });
    }

    emitToUser(receiverId, "newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", loggedInUserId] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ]);

    const chatPartnerIds = messages.map((msg) => msg._id);

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    const sortedChatPartners = chatPartnerIds.map(id => {
      const user = chatPartners.find(user => user._id.toString() === id.toString());
      if (user) {
        const msgInfo = messages.find(m => m._id.toString() === id.toString());
        return {
          ...user.toObject(),
          lastMessage: msgInfo ? msgInfo.lastMessage : null,
          lastMessageDate: msgInfo ? msgInfo.lastMessage.createdAt : null,
        };
      }
      return null;
    }).filter(Boolean);

    res.status(200).json(sortedChatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Trả về danh sách conversation có tin chưa đọc — gọi khi user mới vào app
export const getUnreadSummary = async (req, res) => {
  try {
    const myId = req.user._id;
    const user = await User.findById(myId).select("unreadSince");

    // Lần đầu tiên dùng tính năng này: set mốc thời gian, trả về rỗng
    // (message cũ trước đây coi như đã đọc hết)
    if (!user.unreadSince) {
      await User.findByIdAndUpdate(myId, { unreadSince: new Date() });
      return res.status(200).json({ unreadChats: [], unreadGroups: [] });
    }

    const since = user.unreadSince;

    // Chat 1-1: senderId có tin chưa đọc gửi cho mình SAU mốc unreadSince
    const unreadMessages = await Message.distinct("senderId", {
      receiverId: myId,
      read: false,
      createdAt: { $gt: since },
    });

    // Group chat: groupId có tin chưa đọc SAU mốc unreadSince
    const unreadGroupMessages = await GroupMessage.distinct("groupId", {
      senderId: { $ne: myId },
      readBy: { $nin: [myId] },
      createdAt: { $gt: since },
    });

    res.status(200).json({
      unreadChats: unreadMessages.map(id => id.toString()),
      unreadGroups: unreadGroupMessages.map(id => id.toString()),
    });
  } catch (error) {
    console.error("Error in getUnreadSummary: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/messages/managers — Lấy danh sách quản lý (moderator, director)
export const getManagers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const managers = await User.find({
      role: { $in: ["moderator", "director"] },
      _id: { $ne: loggedInUserId },
      isActive: true,
    }).select("-password -unreadSince");

    res.status(200).json(managers);
  } catch (error) {
    console.error("Error in getManagers:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/messages/send-document/:id — Gửi tin nhắn dạng lá đơn
export const sendDocumentMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const { documentPayload } = req.body;

    if (!documentPayload || !documentPayload.htmlContent) {
      return res.status(400).json({ message: "documentPayload.htmlContent là bắt buộc" });
    }

    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Không thể gửi đơn cho chính mình" });
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Người nhận không tồn tại" });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      messageType: "document",
      documentPayload,
    });

    await newMessage.save();
    await newMessage.populate("senderId", "fullname profilePicture");

    // Tạo thông báo lưu trữ cho người nhận (quản lý)
    const newNotif = new Notification({
      recipient: receiverId,
      sender: senderId,
      type: "document_send",
      message: `${req.user.fullname} đã gửi một đơn mới: "${documentPayload.templateName || "Lá đơn"}"`,
    });
    await newNotif.save();
    await newNotif.populate([
      { path: "sender", select: "fullname profilePicture" }
    ]);

    emitToUser(receiverId, "newMessage", newMessage);
    emitToUser(receiverId, "newNotification", newNotif);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendDocumentMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /api/messages/:id/document-reply — Quản lý phê duyệt / từ chối lá đơn
export const replyDocumentMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { status, note } = req.body;
    const userId = req.user._id;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "status phải là 'approved' hoặc 'rejected'" });
    }

    // Nếu từ chối thì bắt buộc phải có lý do
    if (status === "rejected" && (!note || !note.trim())) {
      return res.status(400).json({ message: "Vui lòng cung cấp lý do từ chối" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Tin nhắn không tồn tại" });
    }

    if (message.messageType !== "document") {
      return res.status(400).json({ message: "Tin nhắn này không phải là lá đơn" });
    }

    // Chỉ người nhận (quản lý) mới được phê duyệt
    if (message.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền phê duyệt lá đơn này" });
    }

    // Cập nhật kết quả phê duyệt
    message.documentReplyData = {
      status,
      note: note?.trim() || "",
      repliedAt: new Date(),
      repliedBy: userId,
    };

    await message.save();
    await message.populate("senderId", "fullname profilePicture");
    await message.populate("documentReplyData.repliedBy", "fullname profilePicture");

    const statusLabel = status === "approved" ? "phê duyệt" : "không phê duyệt";
    const noteText = note?.trim() ? ` với ghi chú / lý do: ${note.trim()}` : "";
    const notifMsg = `Quản lý ${req.user.fullname} đã ${statusLabel} lá đơn "${message.documentPayload?.templateName || "của bạn"}"${noteText}`;

    // Tạo tin nhắn text mới gửi cho user
    const textMessage = new Message({
      senderId: userId,
      receiverId: message.senderId,
      text: notifMsg,
    });
    await textMessage.save();
    await textMessage.populate("senderId", "fullname profilePicture");

    // Tạo thông báo lưu trữ cho người gửi đơn
    const newNotif = new Notification({
      recipient: message.senderId,
      sender: userId,
      type: status === "approved" ? "document_approve" : "document_reject",
      message: notifMsg,
    });
    await newNotif.save();
    await newNotif.populate([
      { path: "sender", select: "fullname profilePicture" }
    ]);

    // Gửi socket event cập nhật real-time cho cả 2 phía
    const payload = { messageId: message._id, documentReplyData: message.documentReplyData };
    emitToUser(message.senderId.toString(), "documentReplied", payload);
    emitToUser(userId.toString(), "documentReplied", payload);

    // Gửi tin nhắn text mới tới 2 người
    emitToUser(message.senderId.toString(), "newMessage", textMessage);
    emitToUser(userId.toString(), "newMessage", textMessage);

    // Gửi thông báo tới người gửi đơn
    emitToUser(message.senderId.toString(), "newNotification", newNotif);

    // Gửi thông báo toast cho người gửi đơn
    emitToUser(message.senderId.toString(), "docApprovalNotif", {
      status,
      message: notifMsg,
      templateName: message.documentPayload?.templateName || "Lá đơn",
    });

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in replyDocumentMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- New Message Features ---

// PUT /api/messages/:id/recall
export const recallMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Only sender can recall
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only recall your own messages" });
    }

    message.isRecalled = true;
    await message.save();

    // Emit to both sender and receiver
    const payload = { messageId: message._id, isRecalled: true };
    emitToUser(message.senderId.toString(), "messageRecalled", payload);
    emitToUser(message.receiverId.toString(), "messageRecalled", payload);

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in recallMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/messages/:id/delete
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (!message.deletedBy.includes(userId)) {
      message.deletedBy.push(userId);
      await message.save();
    }

    res.status(200).json({ message: "Message deleted for you", messageId: id });
  } catch (error) {
    console.error("Error in deleteMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/messages/forward
export const forwardMessage = async (req, res) => {
  try {
    const { messageId, receiverIds, note } = req.body; // receiverIds is array of user/group IDs
    const senderId = req.user._id;

    if (!messageId || !receiverIds || !Array.isArray(receiverIds)) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const originalMsg = await Message.findById(messageId) || await GroupMessage.findById(messageId);
    if (!originalMsg) return res.status(404).json({ message: "Original message not found" });

    const newMessages = [];
    for (const receiverId of receiverIds) {
      if (senderId.equals(receiverId)) continue;
      
      const receiverExists = await User.exists({ _id: receiverId });
      if (receiverExists) {
        // 1. Chuyển tiếp tin nhắn gốc
        const newMsg = new Message({
          senderId,
          receiverId,
          text: originalMsg.text,
          image: originalMsg.image,
          file: originalMsg.file,
          messageType: originalMsg.messageType || (originalMsg.file ? "file" : "text"),
          isForwarded: true,
        });
        await newMsg.save();
        const populatedMsg = await Message.findById(newMsg._id).populate("senderId", "fullname profilePicture");
        emitToUser(receiverId, "newMessage", populatedMsg);
        newMessages.push(populatedMsg);

        // 2. Gửi thêm tin nhắn đính kèm nếu có
        if (note && note.trim()) {
          const noteMsg = new Message({
            senderId,
            receiverId,
            text: note.trim(),
          });
          await noteMsg.save();
          const populatedNote = await Message.findById(noteMsg._id).populate("senderId", "fullname profilePicture");
          emitToUser(receiverId, "newMessage", populatedNote);
          newMessages.push(populatedNote);
        }
      } else {
        // Assume it might be a group ID
        const group = await mongoose.model('Group').findById(receiverId);
        if (group) {
          // 1. Chuyển tiếp tin nhắn gốc vào nhóm
          const newMsg = new GroupMessage({
            senderId,
            groupId: receiverId,
            text: originalMsg.text,
            image: originalMsg.image,
            file: originalMsg.file,
            messageType: originalMsg.messageType || (originalMsg.file ? "file" : "text"),
            isForwarded: true,
          });
          await newMsg.save();
          const populatedMsg = await GroupMessage.findById(newMsg._id).populate("senderId", "fullname profilePicture");
          
          group.members.forEach((memberId) => {
            const memberIdStr = memberId.toString();
            if (memberIdStr !== senderId.toString()) {
              emitToUser(memberIdStr, "newGroupMessage", populatedMsg);
            }
          });
          newMessages.push(populatedMsg);

          // 2. Gửi thêm tin nhắn đính kèm vào nhóm nếu có
          if (note && note.trim()) {
            const noteMsg = new GroupMessage({
              senderId,
              groupId: receiverId,
              text: note.trim(),
            });
            await noteMsg.save();
            const populatedNote = await GroupMessage.findById(noteMsg._id).populate("senderId", "fullname profilePicture");
            
            group.members.forEach((memberId) => {
              const memberIdStr = memberId.toString();
              if (memberIdStr !== senderId.toString()) {
                emitToUser(memberIdStr, "newGroupMessage", populatedNote);
              }
            });
            newMessages.push(populatedNote);
          }
        }
      }
    }

    res.status(200).json(newMessages);
  } catch (error) {
    console.error("Error in forwardMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/messages/pin/:messageId
export const pinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    // Check both Message and GroupMessage
    let message = await Message.findById(messageId);
    let isGroup = false;
    
    if (!message) {
      message = await GroupMessage.findById(messageId);
      isGroup = true;
      if (message) {
        const group = await mongoose.model("Group").findById(message.groupId);
        if (group) {
          const isCreator = group.createdBy.toString() === userId.toString();
          const isAdmin = group.admins && group.admins.some(adminId => adminId.toString() === userId.toString());
          const canPin = group.settings?.memberPermissions?.pinMessages !== false;
          if (!isCreator && !isAdmin && !canPin) {
            return res.status(403).json({ message: "You don't have permission to pin messages in this group." });
          }
        }
      }
    }

    if (!message) return res.status(404).json({ message: "Message not found" });

    message.isPinned = !message.isPinned;
    if (message.isPinned) {
      message.pinnedBy = userId;
    } else {
      message.pinnedBy = null;
    }
    
    await message.save();
    
    const populatedMessage = await message.populate("senderId", "fullname profilePicture");

    // Send a system message
    const actionText = message.isPinned ? "đã ghim" : "đã bỏ ghim";
    let systemMsg;
    
    if (isGroup) {
      systemMsg = new GroupMessage({
        senderId: userId,
        groupId: message.groupId,
        messageType: "system",
        text: `Người dùng ${req.user.fullname} ${actionText} một tin nhắn.`,
      });
      await systemMsg.save();
      const populatedSystemMsg = await systemMsg.populate("senderId", "fullname profilePicture");
      
      // Emit to group members
      const group = await mongoose.model("Group").findById(message.groupId);
      if (group) {
        group.members.forEach((memberId) => {
          const memberIdStr = memberId.toString();
          emitToUser(memberIdStr, "messagePinned", { messageId: message._id, isPinned: message.isPinned, message: populatedMessage });
          emitToUser(memberIdStr, "newGroupMessage", populatedSystemMsg);
        });
      }
    } else {
      systemMsg = new Message({
        senderId: userId,
        receiverId: message.senderId.equals(userId) ? message.receiverId : message.senderId,
        messageType: "system",
        text: `Người dùng ${req.user.fullname} ${actionText} một tin nhắn.`,
      });
      await systemMsg.save();
      const populatedSystemMsg = await systemMsg.populate("senderId", "fullname profilePicture");
      
      // Emit to both direct users
      const otherUserId = message.senderId.equals(userId) ? message.receiverId : message.senderId;
      emitToUser(userId.toString(), "messagePinned", { messageId: message._id, isPinned: message.isPinned, message: populatedMessage });
      emitToUser(otherUserId.toString(), "messagePinned", { messageId: message._id, isPinned: message.isPinned, message: populatedMessage });
      emitToUser(userId.toString(), "newMessage", populatedSystemMsg);
      emitToUser(otherUserId.toString(), "newMessage", populatedSystemMsg);
    }

    res.status(200).json(populatedMessage);
  } catch (error) {
    console.error("Error in pinMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/messages/pinned/:chatId
export const getPinnedMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // We don't know if chatId is a user ID or group ID.
    // Try to find group messages first
    const groupMessages = await GroupMessage.find({ groupId: chatId, isPinned: true })
      .populate("senderId", "fullname profilePicture")
      .populate("pinnedBy", "fullname")
      .sort({ updatedAt: -1 });

    if (groupMessages.length > 0) {
      return res.status(200).json(groupMessages);
    }

    // Try direct messages
    const directMessages = await Message.find({
      $or: [
        { senderId: userId, receiverId: chatId, isPinned: true },
        { senderId: chatId, receiverId: userId, isPinned: true }
      ]
    })
      .populate("senderId", "fullname profilePicture")
      .populate("pinnedBy", "fullname")
      .sort({ updatedAt: -1 });

    res.status(200).json(directMessages);
  } catch (error) {
    console.error("Error in getPinnedMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

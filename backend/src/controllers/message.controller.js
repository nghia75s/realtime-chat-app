import cloudinary from "../lib/cloudinary.js";
import { emitToUser } from "../lib/socket.js";
import Message from "../models/Message.js";
import GroupMessage from "../models/GroupMessage.js";
import User from "../models/User.js";

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
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
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
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
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

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

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

    emitToUser(receiverId, "newMessage", newMessage);

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

    // Gửi socket event cập nhật real-time cho cả 2 phía
    const payload = { messageId: message._id, documentReplyData: message.documentReplyData };
    emitToUser(message.senderId.toString(), "documentReplied", payload);
    emitToUser(userId.toString(), "documentReplied", payload);

    // Gửi tin nhắn text mới tới 2 người
    emitToUser(message.senderId.toString(), "newMessage", textMessage);
    emitToUser(userId.toString(), "newMessage", textMessage);

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


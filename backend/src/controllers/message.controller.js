import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
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

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

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
          lastMessageDate: { $first: "$createdAt" },
        },
      },
      {
        $sort: { lastMessageDate: -1 },
      },
    ]);

    const chatPartnerIds = messages.map((msg) => msg._id);

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    const sortedChatPartners = chatPartnerIds.map(id => 
      chatPartners.find(user => user._id.toString() === id.toString())
    ).filter(Boolean);

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

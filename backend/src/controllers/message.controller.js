import Message from "../models/Message.js"
import User from "../models/User.js"

export const getAllContacts = async (req, res)  => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');
        
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getChatPartners = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const messages = await Message.find({
            $or: [
                { senderID: loggedInUserId },
                { receiverID: loggedInUserId }
            ]
        });
        const chatPartnerIDs = [...new Set(messages.map(msg => msg.senderID.toString() === loggedInUserId.toString() ? msg.receiverID.toString() : msg.senderID.toString()))];
        const chatPartners = await User.find({ _id: { $in: chatPartnerIDs } }).select('-password');
        res.status(200).json(chatPartners);
    } catch (error) {
        console.error('Error fetching chat partners:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMessageByUserId = async (req, res) => {
    try {
        const myID = req.user._id;
        const {id:userToChatID} = req.params;
        const messages = await Message.find({
            $or: [
                { senderID: myID, receiverID: userToChatID },
                { senderID: userToChatID, receiverID: myID }
            ]
        });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const {id:receiverID} = req.params;
        const senderID = req.user._id;

        let imageUrl;
        if (image) {
            const uploadRespone = await cloudinary.uploader.upload(image);
            imageUrl = uploadRespone.secure_url;
        }

        const newMessage = new Message({
            senderID,
            receiverID,
            text,
            image: imageUrl
        });

        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};
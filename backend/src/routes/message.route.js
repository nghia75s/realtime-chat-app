import express from "express";
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  sendMessage,
  getUnreadSummary,
  getManagers,
  sendDocumentMessage,
  replyDocumentMessage,
  recallMessage,
  deleteMessage,
  forwardMessage,
  pinMessage,
  getPinnedMessages,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/unread-summary", getUnreadSummary);
router.get("/managers", getManagers);
router.post("/forward", forwardMessage);
router.get("/pinned/:chatId", getPinnedMessages);
router.post("/pin/:messageId", pinMessage);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);
router.post("/send-document/:id", sendDocumentMessage);
router.patch("/:id/document-reply", replyDocumentMessage);
router.put("/:id/recall", recallMessage);
router.put("/:id/delete", deleteMessage);

export default router;

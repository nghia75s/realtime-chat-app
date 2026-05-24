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
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/unread-summary", getUnreadSummary);
router.get("/managers", getManagers);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);
router.post("/send-document/:id", sendDocumentMessage);
router.patch("/:id/document-reply", replyDocumentMessage);

export default router;

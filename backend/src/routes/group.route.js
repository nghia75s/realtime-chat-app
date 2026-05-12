import express from 'express';
import {
    createGroup,
    getMyGroups,
    getGroupDetail,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    sendGroupMessage,
    getGroupMessages
} from '../controllers/group.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);

router.post("/groups", createGroup);
router.get("/groups", getMyGroups);
router.get("/groups/:id", getGroupDetail);
router.put("/groups/:id", updateGroup);
router.delete("/groups/:id", deleteGroup);

router.post("/groups/:id/members", addMember);
router.delete("/groups/:id/members/:userId", removeMember);

router.post("/groups/:id/messages", sendGroupMessage);
router.get("/groups/:id/messages", getGroupMessages);

export default router;
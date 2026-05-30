import express from 'express';
import {
    createGroup,
    getMyGroups,
    getGroupDetail,
    updateGroup,
    deleteGroup,
    updateGroupSettings,
    addMember,
    removeMember,
    sendGroupMessage,
    getGroupMessages,
    addAdmin,
    removeAdmin,
    transferOwner,
    getInviteLink,
    joinViaLink,
    getPendingMembers,
    approveMember,
    rejectMember,
    getGroupInvitations,
    acceptGroupInvitation,
    declineGroupInvitation
} from '../controllers/group.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);

router.post("/groups", createGroup);
router.get("/groups", getMyGroups);
router.get("/groups/:id", getGroupDetail);
router.put("/groups/:id", updateGroup);
router.put("/groups/:id/settings", updateGroupSettings);
router.delete("/groups/:id", deleteGroup);

router.post("/groups/:id/members", addMember);
router.delete("/groups/:id/members/:userId", removeMember);

router.post("/groups/:id/admins", addAdmin);
router.delete("/groups/:id/admins/:userId", removeAdmin);
router.put("/groups/:id/transfer-owner", transferOwner);

router.get("/groups/:id/invite-link", getInviteLink);
router.post("/groups/join/:inviteCode", joinViaLink);

router.get("/groups/:id/pending-members", getPendingMembers);
router.post("/groups/:id/approve-member/:userId", approveMember);
router.post("/groups/:id/reject-member/:userId", rejectMember);

router.post("/groups/:id/messages", sendGroupMessage);
router.get("/groups/:id/messages", getGroupMessages);

router.get("/group-invitations", getGroupInvitations);
router.post("/groups/:id/invitations/accept", acceptGroupInvitation);
router.post("/groups/:id/invitations/decline", declineGroupInvitation);

export default router;
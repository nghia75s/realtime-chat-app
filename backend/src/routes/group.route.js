import express from 'express';
import {} from '../controllers/group.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);



export default router;
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getTasks, createTask, addCommit, editTask, updateAccess } from "../controllers/task.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", editTask);
router.post("/:id/commit", addCommit);
router.patch("/:id/access", updateAccess);

export default router;

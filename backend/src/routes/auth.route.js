import express from "express";
import { signup, login, logout, updateProfile, sendotp, verifyotp, verifyLoginOtp, pinChat, muteChat, verifyForgotOtp, resetPassword, sendResetLink, redirectReset, changePassword } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/send-otp", sendotp);
router.post("/verify-otp", verifyotp);
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/verify-forgot-otp", verifyForgotOtp);
router.post("/reset-password", resetPassword);
router.post("/send-reset-link", sendResetLink);
router.get("/reset/:token", redirectReset);

router.put("/update-profile", protectRoute, updateProfile);
router.put("/change-password", protectRoute, changePassword);
router.post("/pin-chat", protectRoute, pinChat);
router.post("/mute-chat", protectRoute, muteChat);

router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user));

export default router;

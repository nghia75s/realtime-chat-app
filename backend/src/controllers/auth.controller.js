import { sendOtpEmail, sendResetEmail } from "../emails/emailHandlers.js";
import { generateToken, generateOtpCode, generateOtpExpiry } from "../lib/utils.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import crypto from "crypto";
import { ENV } from "../lib/env.js";

export const signup = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "Tất cả các trường đều là bắt buộc" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    // check if emailis valid: regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Định dạng email không hợp lệ" });
    }

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email đã tồn tại" });

    // 123456 => $dnjasdkasj_?dmsakmk
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const fallback = fullname?.slice(0, 2).toUpperCase() || "";

    const otp = generateOtpCode();
    const otpExpiry = generateOtpExpiry();

    const newUser = new User({
      fullname: fullname,
      email,
      password: hashedPassword,
      fallback,
      otp,
      otpExpiry,
      emailVerified: false,
    });

    if (newUser) {
      const savedUser = await newUser.save();

      try {
        await sendOtpEmail(email, otp);
        res.status(201).json({
          message: "Tạo tài khoản thành công. Vui lòng kiểm tra email để nhận mã OTP.",
          _id: savedUser._id,
          fullname: savedUser.fullname,
          email: savedUser.email,
        });
      } catch (emailError) {
        console.error("Failed to send OTP email:", emailError);
        // Still create user but inform about email issue
        res.status(201).json({
          message: "Tạo tài khoản thành công, nhưng không thể gửi email OTP. Vui lòng thử gửi lại mã OTP.",
          _id: savedUser._id,
          fullname: savedUser.fullname,
          email: savedUser.email,
        });
      }
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Thông tin đăng nhập không hợp lệ" });
    
    if (!user.isActive) return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên." });

    // never tell the client which one is incorrect: password or email

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Thông tin đăng nhập không hợp lệ" });

    if (!user.emailVerified) {
      return res.status(403).json({ message: "Email chưa được xác thực. Vui lòng kiểm tra email để nhận mã OTP." });
    }

    // Generate login OTP
    const loginOtp = generateOtpCode();
    const loginOtpExpiry = generateOtpExpiry();

    user.loginOtp = loginOtp;
    user.loginOtpExpiry = loginOtpExpiry;
    await user.save();

    // Send OTP email
    try {
      await sendOtpEmail(email, loginOtp, "2FA Login");
    } catch (emailError) {
      console.error("Failed to send login OTP email:", emailError);
      return res.status(500).json({ message: "Không thể gửi mã xác thực. Vui lòng thử lại sau." });
    }

    // Return 202 to indicate OTP verification required
    res.status(202).json({
      message: "Mã xác thực 2FA đã được gửi tới email của bạn. Vui lòng nhập mã để hoàn thành đăng nhập.",
      email: user.email,
      requiresOtp: true,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Đăng xuất thành công" });
};

export const sendotp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email là bắt buộc" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Định dạng email không hợp lệ" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email chưa được đăng ký" });
    }

    const otp = generateOtpCode();
    const otpExpiry = generateOtpExpiry();

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    try {
      await sendOtpEmail(email, otp);
      res.status(200).json({ message: "Mã OTP đã được gửi. Vui lòng kiểm tra email." });
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      res.status(500).json({ message: "Không thể gửi mã OTP vào lúc này. Vui lòng thử lại sau." });
    }
  } catch (error) {
    console.error("Error in sendotp controller:", error);
    res.status(500).json({ message: "Không thể gửi mã OTP vào lúc này" });
  }
};

export const sendResetLink = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email là bắt buộc" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Định dạng email không hợp lệ" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email chưa được đăng ký" });
    }

    // generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetExpiry;
    await user.save();

    // Build a short server-side reset URL that redirects to the frontend.
    const serverBase = ENV.SERVER_URL || `${req.protocol}://${req.get("host")}`;
    const resetLink = `${serverBase.replace(/\/$/,"")}/api/auth/reset/${resetToken}`;

    try {
      await sendResetEmail(email, resetLink);
      res.status(200).json({ message: "Liên kết đặt lại mật khẩu đã được gửi tới email của bạn." });
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);
      res.status(500).json({ message: "Không thể gửi email đặt lại mật khẩu vào lúc này. Vui lòng thử lại sau." });
    }
  } catch (error) {
    console.error("Error in sendResetLink controller:", error);
    res.status(500).json({ message: "Không thể xử lý yêu cầu đặt lại mật khẩu" });
  }
};

export const verifyotp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email và mã OTP là bắt buộc" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Thông tin không hợp lệ" });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "Vui lòng yêu cầu gửi mã OTP trước" });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Mã OTP không chính xác" });
    }

    user.emailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    
    // Generate new session token
    const sessionToken = crypto.randomBytes(20).toString("hex");
    user.sessionToken = sessionToken;
    
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, sessionToken, res);

    const roleDoc = await Role.findOne({ id: user.role });
    const permissions = roleDoc ? roleDoc.permissions : {};

    res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      profilePicture: user.profilePicture,
      role: user.role,
      department: user.department,
      phoneNumber: user.phoneNumber,
      age: user.age,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      permissions: permissions,
      message: "Xác thực email thành công",
      token,
    });
  } catch (error) {
    console.error("Error in verifyotp controller:", error);
    res.status(500).json({ message: "Không thể xác thực mã OTP" });
  }
};

// Verify OTP for forgot-password flow and issue a short-lived reset token
export const verifyForgotOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email và mã OTP là bắt buộc" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Thông tin không hợp lệ" });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "Vui lòng yêu cầu gửi mã OTP trước" });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Mã OTP không chính xác" });
    }

    // Clear existing OTP
    user.otp = undefined;
    user.otpExpiry = undefined;

    // Create reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetExpiry;

    await user.save();

    res.status(200).json({ message: "OTP hợp lệ", resetToken });
  } catch (error) {
    console.error("Error in verifyForgotOtp controller:", error);
    res.status(500).json({ message: "Không thể xác thực mã OTP" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, resetToken, newPassword } = req.body;

  if (!email || !resetToken || !newPassword) {
    return res.status(400).json({ message: "Email, token và mật khẩu mới là bắt buộc" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Thông tin không hợp lệ" });

    if (!user.resetPasswordToken || !user.resetPasswordExpiry) {
      return res.status(400).json({ message: "Liên kết không hợp lệ hoặc đã được sử dụng" });
    }

    if (user.resetPasswordToken !== resetToken) {
      return res.status(400).json({ message: "Token không hợp lệ" });
    }

    if (new Date() > user.resetPasswordExpiry) {
      return res.status(400).json({ message: "Token đã hết hạn" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    user.password = hashed;

    // clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Error in resetPassword controller:", error);
    res.status(500).json({ message: "Không thể đổi mật khẩu" });
  }
};

// Redirect endpoint: validate token, then redirect to frontend reset page
export const redirectReset = async (req, res) => {
  const { token } = req.params;

  if (!token) return res.status(400).send("Token is required");

  try {
    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) return res.status(400).send("Invalid or expired token");

    if (new Date() > user.resetPasswordExpiry) {
      return res.status(400).send("Token đã hết hạn");
    }

    const clientUrl = ENV.CLIENT_URL || "http://localhost:5173";
    const redirectTo = `${clientUrl.replace(/\/$/,"")}/reset-password?email=${encodeURIComponent(user.email)}&token=${encodeURIComponent(token)}`;

    return res.redirect(302, redirectTo);
  } catch (error) {
    console.error("Error in redirectReset:", error);
    return res.status(500).send("Server error");
  }
};

export const verifyLoginOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email và mã OTP là bắt buộc" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Thông tin không hợp lệ" });
    }

    if (!user.loginOtp || !user.loginOtpExpiry) {
      return res.status(400).json({ message: "Vui lòng yêu cầu gửi mã OTP trước" });
    }

    if (new Date() > user.loginOtpExpiry) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn. Vui lòng đăng nhập lại." });
    }

    if (user.loginOtp !== otp) {
      return res.status(400).json({ message: "Mã OTP không chính xác" });
    }

    // Clear login OTP
    user.loginOtp = undefined;
    user.loginOtpExpiry = undefined;
    
    // Generate new session token
    const sessionToken = crypto.randomBytes(20).toString("hex");
    user.sessionToken = sessionToken;

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, sessionToken, res);

    const roleDoc = await Role.findOne({ id: user.role });
    const permissions = roleDoc ? roleDoc.permissions : {};

    res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      profilePicture: user.profilePicture,
      role: user.role,
      department: user.department,
      phoneNumber: user.phoneNumber,
      age: user.age,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      permissions: permissions,
      token,
    });
  } catch (error) {
    console.error("Error in verifyLoginOtp controller:", error);
    res.status(500).json({ message: "Không thể xác thực mã OTP" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePicture } = req.body;
    if (!profilePicture) return res.status(400).json({ message: "Hình ảnh hồ sơ là bắt buộc" });

    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(profilePicture);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const pinChat = async (req, res) => {
  try {
    const { chatId } = req.body;
    const userId = req.user._id;

    if (!chatId) return res.status(400).json({ message: "Chat ID là bắt buộc" });

    const user = await User.findById(userId);
    
    // Toggle logic: If already pinned, unpin. If not pinned, pin.
    const isPinned = user.pinnedChats.includes(chatId);
    
    if (isPinned) {
      user.pinnedChats = user.pinnedChats.filter(id => id.toString() !== chatId.toString());
    } else {
      user.pinnedChats.push(chatId);
    }

    await user.save();
    res.status(200).json({ pinnedChats: user.pinnedChats });
  } catch (error) {
    console.log("Error in pinChat controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const muteChat = async (req, res) => {
  try {
    const { chatId, mutedUntil } = req.body;
    const userId = req.user._id;

    if (!chatId) return res.status(400).json({ message: "Chat ID là bắt buộc" });

    const user = await User.findById(userId);
    
    // Remove existing mute if any
    user.mutedChats = user.mutedChats.filter(m => m.chatId.toString() !== chatId.toString());
    
    // If mutedUntil is provided and in the future (or null for infinite), add it
    if (mutedUntil !== undefined) {
      user.mutedChats.push({ chatId, mutedUntil });
    }

    await user.save();
    res.status(200).json({ mutedChats: user.mutedChats });
  } catch (error) {
    console.log("Error in muteChat controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

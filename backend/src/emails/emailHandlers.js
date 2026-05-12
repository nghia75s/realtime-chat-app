import nodemailer from "nodemailer";
import { ENV } from "../lib/env.js";

const createOtpEmailTemplate = (otpCode) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
      <h2 style="color: #1a73e8;">Mã xác thực OTP của bạn</h2>
      <p>Chào bạn,</p>
      <p>Đây là mã xác thực 6 chữ số của bạn:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 0.2em;">${otpCode}</p>
      <p>Mã sẽ hết hạn sau 5 phút. Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
      <hr />
      <p style="font-size: 14px; color: #666;">Nếu bạn gặp sự cố, vui lòng liên hệ bộ phận hỗ trợ của chúng tôi.</p>
    </div>
  `;
};

const createTransporter = () => {
  if (!ENV.GMAIL_USER || !ENV.GMAIL_PASS) {
    throw new Error("GMAIL_USER và GMAIL_PASS cần được cấu hình trong .env");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: ENV.GMAIL_USER,
      pass: ENV.GMAIL_PASS,
    },
  });
};

export const sendOtpEmail = async (email, otpCode) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `${ENV.EMAIL_FROM_NAME} <${ENV.EMAIL_FROM}>`,
    to: email,
    subject: "Mã OTP xác thực tài khoản",
    text: `Mã xác thực của bạn là ${otpCode}. Mã có hiệu lực trong 5 phút.`,
    html: createOtpEmailTemplate(otpCode),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Không thể gửi email xác thực OTP");
  }
};

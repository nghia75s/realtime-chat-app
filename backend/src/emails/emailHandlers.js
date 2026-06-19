import nodemailer from "nodemailer";
import { ENV } from "../lib/env.js";

const createOtpEmailTemplate = (otpCode, type = "email verification") => {
  const titleMap = {
    "2FA Login": "Mã xác thực 2FA đăng nhập",
    "email verification": "Mã xác thực OTP của bạn",
  };
  const title = titleMap[type] || titleMap["email verification"];

  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
      <h2 style="color: #1a73e8;">${title}</h2>
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

export const sendOtpEmail = async (email, otpCode, type = "email verification") => {
  const transporter = createTransporter();
  
  const subjectMap = {
    "2FA Login": "Mã xác thực 2FA đăng nhập",
    "email verification": "Mã OTP xác thực tài khoản",
  };
  const subject = subjectMap[type] || subjectMap["email verification"];

  const mailOptions = {
    from: `${ENV.EMAIL_FROM_NAME} <${ENV.EMAIL_FROM}>`,
    to: email,
    subject: subject,
    text: `Mã xác thực của bạn là ${otpCode}. Mã có hiệu lực trong 5 phút.`,
    html: createOtpEmailTemplate(otpCode, type),
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

export const sendResetEmail = async (email, resetLink) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `${ENV.EMAIL_FROM_NAME} <${ENV.EMAIL_FROM}>`,
    to: email,
    subject: "Yêu cầu đặt lại mật khẩu",
    text: `Bạn hoặc ai đó đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Truy cập liên kết: ${resetLink}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
        <h2 style="color: #1a73e8;">Yêu cầu đặt lại mật khẩu</h2>
        <p>Chào bạn,</p>
        <p>Bạn nhận được email này vì có yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Nhấn vào nút bên dưới để đặt lại mật khẩu. Liên kết sẽ hết hạn sau 15 phút.</p>
        <p style="text-align:center; margin: 20px 0;"><a href="${resetLink}" target="_self" style="background:#1a73e8;color:white;padding:10px 18px;border-radius:6px;text-decoration:none;">Đặt lại mật khẩu</a></p>
        <p>Nếu bạn không yêu cầu điều này, bạn có thể bỏ qua email này.</p>
        <hr />
        <p style="font-size: 14px; color: #666;">Nếu bạn gặp sự cố, vui lòng liên hệ bộ phận hỗ trợ của chúng tôi.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Reset email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending reset email:", error);
    throw new Error("Không thể gửi email đặt lại mật khẩu");
  }
};

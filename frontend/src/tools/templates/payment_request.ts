import type { DocumentTemplate } from "./data";

export const paymentRequestTemplate: DocumentTemplate = {
  id: "payment_request",
  name: "Giấy đề nghị thanh toán",
  fields: [
    { id: "name", label: "Người đề nghị", type: "text" },
    { id: "department", label: "Bộ phận", type: "text" },
    { id: "amount", label: "Số tiền (VNĐ)", type: "number" },
    { id: "amount_text", label: "Số tiền bằng chữ", type: "text" },
    { id: "reason", label: "Nội dung thanh toán", type: "textarea" },
    { id: "date", label: "Ngày lập đề nghị", type: "date" },
  ],
  templateContent: `
    <div style="font-family:'Times New Roman',Times,serif;font-size:16px;line-height:1.6;color:black;max-width:100%;">
      <div style="text-align:center;margin-bottom:30px;">
        <h3 style="font-size:16px;font-weight:bold;margin:0;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
        <p style="font-size:16px;font-weight:bold;margin:4px 0;text-decoration:underline;">Độc lập - Tự do - Hạnh phúc</p>
        <p style="font-size:14px;font-style:italic;margin:2px 0;">───────────────</p>
      </div>

      <div style="text-align:center;margin-bottom:30px;">
        <h2 style="font-size:24px;font-weight:bold;margin:0;letter-spacing:1px;">GIẤY ĐỀ NGHỊ THANH TOÁN</h2>
        <p style="font-style:italic;margin-top:6px;font-size:14px;">Ngày: {{date}}</p>
      </div>

      <div style="margin-bottom:20px;">
        <p><strong>Kính gửi:</strong> Giám đốc Công ty và Kế toán trưởng</p>
      </div>

      <div style="margin-bottom:15px;">
        <p style="margin:0 0 10px 0;">Người đề nghị thanh toán: <strong>{{name}}</strong></p>
        <p style="margin:0 0 10px 0;">Bộ phận công tác: <strong>{{department}}</strong></p>
      </div>

      <div style="margin-bottom:15px;">
        <p style="margin:0 0 10px 0;">Nội dung thanh toán: {{reason}}</p>
        <p style="margin:0 0 10px 0;">Số tiền đề nghị: <strong>{{amount}} VNĐ</strong></p>
        <p style="margin:0 0 10px 0;"><em>(Viết bằng chữ: {{amount_text}})</em></p>
      </div>

      <div style="display:flex;justify-content:space-between;margin-top:60px;text-align:center;">
        <div>
          <p style="font-weight:bold;margin:0;">TỔNG GIÁM ĐỐC</p>
          <p style="font-style:italic;font-size:14px;margin:4px 0;">(Ký, họ tên)</p>
          <div style="height:70px;"></div>
        </div>
        <div>
          <p style="font-weight:bold;margin:0;">KẾ TOÁN TRƯỞNG</p>
          <p style="font-style:italic;font-size:14px;margin:4px 0;">(Ký, họ tên)</p>
          <div style="height:70px;"></div>
        </div>
        <div>
          <p style="font-weight:bold;margin:0;">NGƯỜI ĐỀ NGHỊ</p>
          <p style="font-style:italic;font-size:14px;margin:4px 0;">(Ký, họ tên)</p>
          <div style="height:70px;"></div>
          <p style="font-weight:bold;margin:0;">{{name}}</p>
        </div>
      </div>
    </div>
  `,
};

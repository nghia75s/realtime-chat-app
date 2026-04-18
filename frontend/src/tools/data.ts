export interface TemplateField {
  id: string;
  label: string;
  type: "text" | "date" | "number" | "textarea";
}

export interface DocumentTemplate {
  id: string;
  name: string;
  fields: TemplateField[];
  templateContent: string; // HTML string templates
}

export const mockTemplates: DocumentTemplate[] = [
  {
    id: "leave_request",
    name: "Đơn xin nghỉ phép",
    fields: [
      { id: "name", label: "Họ và tên", type: "text" },
      { id: "department", label: "Phòng ban / Bộ phận", type: "text" },
      { id: "reason", label: "Lý do xin nghỉ", type: "textarea" },
      { id: "startDate", label: "Từ ngày", type: "date" },
      { id: "endDate", label: "Đến ngày", type: "date" }
    ],
    templateContent: `
      <div style="font-family: 'Times New Roman', Times, serif; font-size: 16px; line-height: 1.5; color: black; max-width: 100%;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
          <p style="font-size: 16px; font-weight: bold; margin: 0; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="font-size: 24px; font-weight: bold; margin: 0;">ĐƠN XIN NGHỈ PHÉP</h2>
        </div>

        <div style="margin-bottom: 20px;">
          <p><strong>Kính gửi:</strong> Ban Giám đốc Công ty</p>
        </div>

        <div style="margin-bottom: 15px;">
          <p style="margin: 0 0 10px 0;">Tôi tên là: <strong>{{name}}</strong></p>
          <p style="margin: 0 0 10px 0;">Hiện đang công tác tại phòng ban: <strong>{{department}}</strong></p>
        </div>

        <div style="margin-bottom: 15px;">
          <p>Nay tôi làm đơn này xin phép Ban Giám đốc cho tôi được nghỉ phép.</p>
          <p style="margin: 5px 0;"><strong>Lý do xin nghỉ:</strong> {{reason}}</p>
          <p style="margin: 5px 0;"><strong>Thời gian nghỉ:</strong> Từ ngày {{startDate}} đến ngày {{endDate}}.</p>
        </div>

        <div style="margin-bottom: 40px;">
          <p>Kính mong Ban Giám đốc xem xét và chấp thuận.</p>
          <p>Xin trân trọng cảm ơn!</p>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
          <div style="text-align: center; width: 50%;">
            <p style="font-weight: bold; margin: 0;">Ý KIẾN BAN GIÁM ĐỐC</p>
            <p style="font-style: italic; font-size: 14px;">(Ký và ghi rõ họ tên)</p>
          </div>
          <div style="text-align: center; width: 50%;">
            <p style="font-style: italic; margin: 0 0 5px 0;">......., ngày .... tháng .... năm ......</p>
            <p style="font-weight: bold; margin: 0;">NGƯỜI LÀM ĐƠN</p>
            <p style="font-style: italic; font-size: 14px;">(Ký và ghi rõ họ tên)</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "payment_request",
    name: "Giấy đề nghị thanh toán",
    fields: [
      { id: "name", label: "Người đề nghị", type: "text" },
      { id: "department", label: "Bộ phận", type: "text" },
      { id: "amount", label: "Số tiền (VNĐ)", type: "number" },
      { id: "amount_text", label: "Số tiền bằng chữ", type: "text" },
      { id: "reason", label: "Nội dung thanh toán", type: "textarea" },
      { id: "date", label: "Ngày lập đề nghị", type: "date" }
    ],
    templateContent: `
      <div style="font-family: 'Times New Roman', Times, serif; font-size: 16px; line-height: 1.5; color: black; max-width: 100%;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
          <p style="font-size: 16px; font-weight: bold; margin: 0; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="font-size: 24px; font-weight: bold; margin: 0;">GIẤY ĐỀ NGHỊ THANH TOÁN</h2>
          <p style="font-style: italic; margin-top: 5px;">Ngày: {{date}}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <p><strong>Kính gửi:</strong> Giám đốc Công ty và Kế toán trưởng</p>
        </div>

        <div style="margin-bottom: 15px;">
          <p style="margin: 0 0 10px 0;">Người đề nghị thanh toán: <strong>{{name}}</strong></p>
          <p style="margin: 0 0 10px 0;">Bộ phận công tác: <strong>{{department}}</strong></p>
        </div>

        <div style="margin-bottom: 15px;">
          <p style="margin: 0 0 10px 0;">Nội dung thanh toán: {{reason}}</p>
          <p style="margin: 0 0 10px 0;">Số tiền đề nghị: <strong>{{amount}} VNĐ</strong></p>
          <p style="margin: 0 0 10px 0;"><em>(Viết bằng chữ: {{amount_text}})</em></p>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 50px;">
          <div style="text-align: center;">
            <p style="font-weight: bold; margin: 0;">TỔNG GIÁM ĐỐC</p>
            <p style="font-style: italic; font-size: 14px;">(Ký, họ tên)</p>
          </div>
          <div style="text-align: center;">
            <p style="font-weight: bold; margin: 0;">KẾ TOÁN TRƯỞNG</p>
            <p style="font-style: italic; font-size: 14px;">(Ký, họ tên)</p>
          </div>
          <div style="text-align: center;">
            <p style="font-weight: bold; margin: 0;">NGƯỜI ĐỀ NGHỊ</p>
            <p style="font-style: italic; font-size: 14px;">(Ký, họ tên)</p>
          </div>
        </div>
      </div>
    `
  }
];

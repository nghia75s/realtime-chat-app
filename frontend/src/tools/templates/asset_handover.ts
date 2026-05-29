import type { DocumentTemplate } from "./data";

export const assetHandoverTemplate: DocumentTemplate = {
  id: "asset_handover",
  name: "Phiếu bàn giao tài sản",
  fields: [
    { id: "date", label: "Ngày bàn giao", type: "date" },
    { id: "fromName", label: "Người bàn giao", type: "text" },
    { id: "fromDepartment", label: "Phòng ban bàn giao", type: "text" },
    { id: "toName", label: "Người nhận", type: "text" },
    { id: "toDepartment", label: "Phòng ban nhận", type: "text" },
    { id: "assetName", label: "Tên tài sản / thiết bị", type: "text" },
    { id: "assetCode", label: "Mã tài sản", type: "text" },
    { id: "quantity", label: "Số lượng", type: "number" },
    { id: "condition", label: "Tình trạng tài sản", type: "text" },
    { id: "notes", label: "Ghi chú", type: "textarea" },
  ],
  templateContent: `
    <div style="font-family:'Times New Roman',Times,serif;font-size:16px;line-height:1.6;color:black;max-width:100%;">
      <div style="text-align:center;margin-bottom:20px;">
        <h3 style="font-size:16px;font-weight:bold;margin:0;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
        <p style="font-size:16px;font-weight:bold;margin:4px 0;text-decoration:underline;">Độc lập - Tự do - Hạnh phúc</p>
        <p style="font-size:14px;font-style:italic;margin:2px 0;">───────────────</p>
      </div>

      <div style="text-align:center;margin-bottom:30px;">
        <h2 style="font-size:22px;font-weight:bold;margin:0;letter-spacing:1px;">PHIẾU BÀN GIAO TÀI SẢN</h2>
        <p style="font-style:italic;font-size:14px;margin-top:6px;">Ngày: {{date}}</p>
      </div>

      <div style="margin-bottom:20px;display:flex;gap:40px;">
        <div style="flex:1;border:1px solid #ddd;border-radius:4px;padding:14px;">
          <p style="font-weight:bold;font-size:15px;margin:0 0 10px;border-bottom:1px solid #eee;padding-bottom:6px;">BÊN BÀN GIAO (Bên A)</p>
          <p style="margin:0 0 8px 0;">Họ và tên: <strong>{{fromName}}</strong></p>
          <p style="margin:0;">Phòng ban: <strong>{{fromDepartment}}</strong></p>
        </div>
        <div style="flex:1;border:1px solid #ddd;border-radius:4px;padding:14px;">
          <p style="font-weight:bold;font-size:15px;margin:0 0 10px;border-bottom:1px solid #eee;padding-bottom:6px;">BÊN NHẬN (Bên B)</p>
          <p style="margin:0 0 8px 0;">Họ và tên: <strong>{{toName}}</strong></p>
          <p style="margin:0;">Phòng ban: <strong>{{toDepartment}}</strong></p>
        </div>
      </div>

      <div style="margin-bottom:16px;">
        <p style="font-weight:bold;margin:0 0 10px;">DANH SÁCH TÀI SẢN BÀN GIAO:</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#f0f0f0;">
              <th style="border:1px solid #ccc;padding:8px;text-align:center;width:5%;">STT</th>
              <th style="border:1px solid #ccc;padding:8px;text-align:left;">Tên tài sản / Thiết bị</th>
              <th style="border:1px solid #ccc;padding:8px;text-align:center;">Mã tài sản</th>
              <th style="border:1px solid #ccc;padding:8px;text-align:center;">Số lượng</th>
              <th style="border:1px solid #ccc;padding:8px;text-align:center;">Tình trạng</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border:1px solid #ccc;padding:8px;text-align:center;">1</td>
              <td style="border:1px solid #ccc;padding:8px;">{{assetName}}</td>
              <td style="border:1px solid #ccc;padding:8px;text-align:center;">{{assetCode}}</td>
              <td style="border:1px solid #ccc;padding:8px;text-align:center;">{{quantity}}</td>
              <td style="border:1px solid #ccc;padding:8px;text-align:center;">{{condition}}</td>
            </tr>
            <tr>
              <td style="border:1px solid #ccc;padding:8px;text-align:center;color:#aaa;">2</td>
              <td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>
              <td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>
              <td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>
              <td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>
            </tr>
            <tr>
              <td style="border:1px solid #ccc;padding:8px;text-align:center;color:#aaa;">3</td>
              <td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>
              <td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>
              <td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>
              <td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin-bottom:20px;border:1px solid #ddd;border-radius:4px;padding:12px;">
        <p style="font-weight:bold;margin:0 0 6px;">Ghi chú:</p>
        <p style="margin:0;font-style:italic;">{{notes}}</p>
      </div>

      <div style="margin-bottom:16px;">
        <p>Hai bên đã kiểm tra, xác nhận tài sản đầy đủ và đồng ý ký biên bản bàn giao.</p>
      </div>

      <div style="display:flex;justify-content:space-between;margin-top:40px;text-align:center;">
        <div>
          <p style="font-weight:bold;margin:0;">BÊN BÀN GIAO (BÊN A)</p>
          <p style="font-style:italic;font-size:13px;margin:4px 0;">(Ký và ghi rõ họ tên)</p>
          <div style="height:70px;"></div>
          <p style="font-weight:bold;margin:0;">{{fromName}}</p>
        </div>
        <div>
          <p style="font-weight:bold;margin:0;">BÊN NHẬN (BÊN B)</p>
          <p style="font-style:italic;font-size:13px;margin:4px 0;">(Ký và ghi rõ họ tên)</p>
          <div style="height:70px;"></div>
          <p style="font-weight:bold;margin:0;">{{toName}}</p>
        </div>
        <div>
          <p style="font-weight:bold;margin:0;">XÁC NHẬN BAN GIÁM ĐỐC</p>
          <p style="font-style:italic;font-size:13px;margin:4px 0;">(Ký và đóng dấu)</p>
          <div style="height:70px;"></div>
        </div>
      </div>
    </div>
  `,
};

import type { DocumentTemplate } from "./data";

export const travelPermitTemplate: DocumentTemplate = {
  id: "travel_permit",
  name: "Giấy đi đường / Giấy điều xe",
  fields: [
    { id: "name", label: "Họ và tên người đi", type: "text" },
    { id: "department", label: "Phòng ban", type: "text" },
    { id: "destination", label: "Nơi đến", type: "text" },
    { id: "purpose", label: "Mục đích chuyến đi", type: "textarea" },
    { id: "vehicle", label: "Phương tiện sử dụng", type: "text" },
    { id: "driverName", label: "Tên lái xe (nếu có)", type: "text" },
    { id: "startDate", label: "Ngày khởi hành", type: "date" },
    { id: "endDate", label: "Ngày dự kiến về", type: "date" },
    { id: "approver", label: "Người phê duyệt", type: "text" },
  ],
  templateContent: `
    <div style="font-family:'Times New Roman',Times,serif;font-size:16px;line-height:1.6;color:black;max-width:100%;">
      <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
        <div style="text-align:center;width:45%;">
          <p style="font-weight:bold;font-size:14px;margin:0;">TÊN CÔNG TY</p>
          <p style="font-size:13px;margin:2px 0;">─────────────</p>
          <p style="font-size:13px;margin:0;">Số: ......./GĐĐ</p>
        </div>
        <div style="text-align:center;width:45%;">
          <p style="font-weight:bold;font-size:14px;margin:0;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p style="font-size:14px;font-weight:bold;margin:4px 0;text-decoration:underline;">Độc lập - Tự do - Hạnh phúc</p>
          <p style="font-size:13px;font-style:italic;margin:2px 0;">───────────────</p>
        </div>
      </div>

      <div style="text-align:center;margin-bottom:30px;">
        <h2 style="font-size:22px;font-weight:bold;margin:0;letter-spacing:1px;">GIẤY ĐI ĐƯỜNG / GIẤY ĐIỀU XE</h2>
      </div>

      <div style="margin-bottom:20px;border:1px solid #ccc;padding:16px;border-radius:4px;">
        <p style="margin:0 0 10px 0;"><strong>Họ và tên người đi:</strong> {{name}}</p>
        <p style="margin:0 0 10px 0;"><strong>Phòng ban:</strong> {{department}}</p>
        <p style="margin:0 0 10px 0;"><strong>Nơi đến:</strong> {{destination}}</p>
        <p style="margin:0 0 10px 0;"><strong>Mục đích chuyến đi:</strong> {{purpose}}</p>
        <p style="margin:0 0 10px 0;"><strong>Phương tiện sử dụng:</strong> {{vehicle}}</p>
        <p style="margin:0 0 10px 0;"><strong>Tên lái xe:</strong> {{driverName}}</p>
        <p style="margin:0 0 10px 0;"><strong>Ngày khởi hành:</strong> {{startDate}}</p>
        <p style="margin:0;"><strong>Ngày dự kiến về:</strong> {{endDate}}</p>
      </div>

      <div style="margin-bottom:10px;">
        <p><strong>Người phê duyệt:</strong> {{approver}}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px;">
        <thead>
          <tr style="background:#f0f0f0;">
            <th style="border:1px solid #ccc;padding:8px;text-align:center;">Ngày</th>
            <th style="border:1px solid #ccc;padding:8px;text-align:center;">Nơi đi</th>
            <th style="border:1px solid #ccc;padding:8px;text-align:center;">Nơi đến</th>
            <th style="border:1px solid #ccc;padding:8px;text-align:center;">Phương tiện</th>
            <th style="border:1px solid #ccc;padding:8px;text-align:center;">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>
            <td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>
            <td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>
            <td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>
            <td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>
            <td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>
            <td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>
            <td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>
            <td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>
          </tr>
        </tbody>
      </table>

      <div style="display:flex;justify-content:space-between;margin-top:50px;text-align:center;">
        <div>
          <p style="font-weight:bold;margin:0;">NGƯỜI PHÊ DUYỆT</p>
          <p style="font-style:italic;font-size:13px;margin:4px 0;">(Ký và ghi rõ họ tên)</p>
          <div style="height:70px;"></div>
          <p style="font-weight:bold;margin:0;">{{approver}}</p>
        </div>
        <div>
          <p style="font-weight:bold;margin:0;">LÁI XE</p>
          <p style="font-style:italic;font-size:13px;margin:4px 0;">(Ký và ghi rõ họ tên)</p>
          <div style="height:70px;"></div>
          <p style="font-weight:bold;margin:0;">{{driverName}}</p>
        </div>
        <div>
          <p style="font-weight:bold;margin:0;">NGƯỜI ĐI CÔNG TÁC</p>
          <p style="font-style:italic;font-size:13px;margin:4px 0;">(Ký và ghi rõ họ tên)</p>
          <div style="height:70px;"></div>
          <p style="font-weight:bold;margin:0;">{{name}}</p>
        </div>
      </div>
    </div>
  `,
};

// ─── Kiểu dữ liệu ────────────────────────────────────────────────────────────

export interface TemplateField {
  id: string;
  label: string;
  type: "text" | "date" | "number" | "textarea";
}

export interface DocumentTemplate {
  id: string;
  name: string;
  fields: TemplateField[];
  templateContent: string; // HTML string với placeholder {{field.id}}
}

// ─── Import tất cả mẫu đơn từ thư mục templates/ ────────────────────────────

export { leaveRequestTemplate } from "./leave_request";
export { paymentRequestTemplate } from "./payment_request";
export { travelPermitTemplate } from "./travel_permit";
export { assetHandoverTemplate } from "./asset_handover";

// ─── Danh sách tổng hợp (dùng ở DocumentFillerPage) ─────────────────────────

import { leaveRequestTemplate } from "./leave_request";
import { paymentRequestTemplate } from "./payment_request";
import { travelPermitTemplate } from "./travel_permit";
import { assetHandoverTemplate } from "./asset_handover";

export const Templates: DocumentTemplate[] = [
  leaveRequestTemplate,
  paymentRequestTemplate,
  travelPermitTemplate,
  assetHandoverTemplate,
];

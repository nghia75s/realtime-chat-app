export type DocCategory = "files" | "images" | "links" | "forms";

export interface DocItem {
  id: string;
  userId: string;
  category: DocCategory;
  name: string;
  size?: string;
  url?: string;
  date: string;
  status?: "pending" | "approved" | "rejected"; // For forms
}

export const mockDocs: DocItem[] = [
  // User 2 (Nguyễn Văn A - Phòng Kỹ thuật)
  { id: "d1", userId: "u2", category: "files", name: "Bao_cao_Q1_2026.pdf", size: "2.4 MB", date: "05/05/2026" },
  { id: "d2", userId: "u2", category: "files", name: "Thiet_ke_he_thong.docx", size: "1.1 MB", date: "08/05/2026" },
  { id: "d3", userId: "u2", category: "images", name: "UI_Mockup_V1.png", size: "4.5 MB", date: "09/05/2026" },
  { id: "d4", userId: "u2", category: "links", name: "Figma Design UI/UX", url: "https://figma.com/file/...", date: "01/05/2026" },
  { id: "d5", userId: "u2", category: "forms", name: "Đơn xin nghỉ phép - 12/05/2026", status: "pending", date: "09/05/2026" },
  { id: "d6", userId: "u2", category: "forms", name: "Đề nghị cấp phát thiết bị", status: "approved", date: "15/04/2026" },

  // User 3 (Trần Thị B - Phòng Marketing)
  { id: "d7", userId: "u3", category: "files", name: "Ke_hoach_Marketing_T6.xlsx", size: "5.2 MB", date: "07/05/2026" },
  { id: "d8", userId: "u3", category: "images", name: "Banner_Quang_cao.jpg", size: "8.1 MB", date: "08/05/2026" },
  { id: "d9", userId: "u3", category: "links", name: "Google Drive Folder Marketing", url: "https://drive.google.com/...", date: "02/05/2026" },
  { id: "d10", userId: "u3", category: "forms", name: "Đơn thanh toán công tác phí", status: "pending", date: "09/05/2026" },

  // User 5 (Phạm Thị D - Phòng Marketing)
  { id: "d11", userId: "u5", category: "files", name: "Danh_sach_KOLs.csv", size: "125 KB", date: "06/05/2026" },
  { id: "d12", userId: "u5", category: "forms", name: "Đơn xin làm việc từ xa (WFH)", status: "rejected", date: "01/05/2026" },
];

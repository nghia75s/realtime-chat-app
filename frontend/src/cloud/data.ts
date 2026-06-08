export type DocCategory = "files" | "images" | "links" | "forms";

export const mockDocs = [
  {
    id: "1",
    userId: "user-1", // ID nhân viên ảo, sẽ không hiện ra nếu không khớp
    category: "files" as DocCategory,
    name: "Tài liệu thiết kế hệ thống.pdf",
    date: "10/05/2026",
    size: "2.5 MB",
    status: "",
    url: "#"
  },
  {
    id: "2",
    userId: "user-1",
    category: "images" as DocCategory,
    name: "Banner chiến dịch mới.png",
    date: "12/05/2026",
    size: "1.2 MB",
    status: "",
    url: "#"
  },
  {
    id: "3",
    userId: "user-1",
    category: "forms" as DocCategory,
    name: "Đơn xin nghỉ phép",
    date: "15/05/2026",
    size: "-",
    status: "approved",
    url: "#"
  }
];

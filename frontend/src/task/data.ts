export type Role = "manager" | "employee" | null;
export type TaskStatus = "pending" | "done" | "rejected";
export type CommitType = "create" | "commit" | "approve" | "reject";

export interface CommitItem {
  id: string;
  type: CommitType;
  user: string;
  time: string;
  description: string;
  fileName?: string;
  targetCommitId?: string; // ID of the commit being evaluated (for nested feedback)
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  assignees: string[];
  creator: string;
  deadline: string;
  status: TaskStatus;
  commits: CommitItem[];
}

export const initialTasks: TaskItem[] = [
  {
    id: "t1",
    title: "Phân tích Data quý 1",
    description: "Tổng hợp dữ liệu doanh thu và chi phí quý 1 năm 2026. Lập biểu đồ so sánh với năm trước.",
    assignees: ["Nguyễn Văn A", "Nguyễn Văn B", "Lê Thị C", "Trần Văn D", "Phạm Hùng E", "Hồ Văn F"], // Nhiều người để test UI
    creator: "Manager Tiến Đạt",
    deadline: "2026-04-20",
    status: "pending",
    commits: [
      {
        id: "c1",
        type: "create",
        user: "Manager Tiến Đạt",
        time: "10:00 12/04/2026",
        description: "Bắt đầu khởi tạo task."
      }
    ]
  },
  {
    id: "t2",
    title: "Cập nhật tài liệu UI/UX",
    description: "Review lại toàn bộ file figma và xuất ra bản PDF gửi cho team kỹ thuật.",
    assignees: ["Nguyễn Văn B"],
    creator: "Manager Tiến Đạt",
    deadline: "2026-04-15",
    status: "rejected",
    commits: [
      {
        id: "c2",
        type: "create",
        user: "Manager Tiến Đạt",
        time: "09:00 10/04/2026",
        description: "Bắt đầu khởi tạo task."
      },
      {
        id: "c3",
        type: "commit",
        user: "Nguyễn Văn B",
        time: "14:30 11/04/2026",
        description: "Đã hoàn thành xuất file PDF, mời sếp xem qua ạ.",
        fileName: "UI_UX_Design_System_2026.pdf"
      },
      {
        id: "c4",
        type: "reject",
        user: "Manager Tiến Đạt",
        time: "16:00 11/04/2026",
        description: "Màu sắc ở trang 3 bị sai mã HEX, em sửa lại theo chuẩn Dark Mode nhé.",
        targetCommitId: "c3"
      }
    ]
  },
  {
    id: "t3",
    title: "Fix bug hiển thị danh bạ",
    description: "Sửa lỗi không hiển thị đúng nhóm bảng chữ cái ở màn hình Contacts.",
    assignees: ["Nguyễn Văn A", "Nguyễn Văn B"],
    creator: "Manager Tiến Đạt",
    deadline: "2026-04-10",
    status: "done",
    commits: [
      {
        id: "c5",
        type: "create",
        user: "Manager Tiến Đạt",
        time: "08:00 09/04/2026",
        description: "Bắt đầu khởi tạo task."
      },
      {
        id: "c6",
        type: "commit",
        user: "Nguyễn Văn A",
        time: "10:30 10/04/2026",
        description: "Đã nạp file APK cho anh em tester test thử ạ.",
        fileName: "FixContactsBug_build_final.apk"
      },
      {
        id: "c7",
        type: "approve",
        user: "Manager Tiến Đạt",
        time: "11:00 10/04/2026",
        description: "Chạy mượt, duyệt!"
      }
    ]
  }
];

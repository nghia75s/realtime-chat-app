export const mockConversations = [
  { id: 1, name: "Team Design", avatar: "/avatars/01.png", fallback: "TD", lastMessage: "Jessie: Đã gửi file thiết kế mới", time: "6 phút", unread: 2, isOnline: true },
  { id: 2, name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?u=a", fallback: "NA", lastMessage: "Bạn: Ok chốt vậy nhé!", time: "20 phút", isOnline: true },
  { id: 3, name: "Trần Thị B", avatar: "https://i.pravatar.cc/150?u=b", fallback: "TB", lastMessage: "Trần Thị B đã gửi 1 ảnh", time: "1 giờ", isOnline: false },
  { id: 4, name: "Group Frontend", avatar: "https://i.pravatar.cc/150?u=g", fallback: "GF", lastMessage: "Bạn: Chừng nào release?", time: "Hôm qua", unread: 5, isOnline: true },
  { id: 5, name: "Lê Hoàng C", avatar: "https://i.pravatar.cc/150?u=c", fallback: "LC", lastMessage: "Thanks bro", time: "Hôm qua", isRead: true },
  { id: 6, name: "Phạm D", avatar: "https://i.pravatar.cc/150?u=d", fallback: "PD", lastMessage: "Gọi tôi lúc 5h chiều nay", time: "Thứ 2" },
  { id: 7, name: "Gia đình", avatar: "https://i.pravatar.cc/150?u=f", fallback: "GĐ", lastMessage: "Mẹ: Cuối tuần về không con?", time: "Thứ 2" },
  { id: 8, name: "Vũ E", avatar: "https://i.pravatar.cc/150?u=e", fallback: "VE", lastMessage: "Voice message", time: "25/03" },
  { id: 9, name: "Startup Founder Club", avatar: "https://i.pravatar.cc/150?u=s", fallback: "SF", lastMessage: "Lịch họp tháng này dời sang T6", time: "20/03" },
];

export type ChatItem = typeof mockConversations[0];


// data để test giao diện

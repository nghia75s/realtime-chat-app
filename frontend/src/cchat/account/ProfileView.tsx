import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { X, Camera } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"

export const ProfileView = ({ onViewChange, onClose }: any) => {
  const { authUser } = useAuthStore()

  return (
    <div className="flex flex-col w-full min-h-[500px] h-full relative animate-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-chat-border shrink-0 z-10 bg-chat-sidebar">
        <h2 className="text-[16px] font-semibold text-chat-text">Thông tin tài khoản</h2>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-chat-hover transition-colors"><X className="w-5 h-5 text-chat-muted" /></button>
      </div>

      {/* Cover Profile */}
      <div className="relative w-full h-[160px] bg-chat-hover shrink-0 group">
        <img src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Cover" />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* Avatar Section */}
      <div className="px-4 relative flex flex-col -mt-10 mb-4 shrink-0">
        <div className="flex items-end gap-3">
          <div className="relative group/avatar cursor-pointer" onClick={() => onViewChange("edit-avatar")}>
            <Avatar className="w-[76px] h-[76px] border-4 border-chat-sidebar shadow-sm ring-1 ring-chat-border">
              <AvatarImage src={authUser?.profilePicture || "/avatar.png"} />
              <AvatarFallback>{authUser?.fullname?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
            </Avatar>
            {/* Camera icon button */}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-chat-sidebar rounded-full border-[1.5px] border-chat-sidebar flex items-center justify-center hover:bg-chat-hover transition-colors shadow-sm">
              <Camera className="w-[15px] h-[15px] text-chat-text" />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2 group/name">
            <h3 className="text-[18px] font-semibold text-chat-text pb-0.5">{authUser?.fullname || "Người dùng"}</h3>
          </div>
        </div>
      </div>

      {/* Scrollable Details */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
        <div className="bg-chat-main border border-chat-border rounded-lg p-3 px-4 shadow-sm">
          <h4 className="text-[15px] font-bold text-chat-text mb-3 border-b border-chat-border pb-2">Thông tin cá nhân</h4>
          <div className="flex flex-col gap-3.5 text-[14px] pt-1">
            <div className="grid grid-cols-[100px_1fr] items-start">
              <span className="text-chat-muted font-medium">Giới tính</span>
              <span className="text-chat-text font-medium">{authUser?.gender || "Chưa cập nhật"}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-start">
              <span className="text-chat-muted font-medium">Ngày sinh</span>
              <span className="text-chat-text font-medium">{authUser?.dateOfBirth || "Chưa cập nhật"}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-start">
              <span className="text-chat-muted font-medium">Điện thoại</span>
              <span className="text-chat-text font-medium">{authUser?.phoneNumber || "Chưa cập nhật"}</span>
            </div>
            <div className="border-t border-chat-border my-0 pt-3 grid grid-cols-[100px_1fr] items-start">
              <span className="text-chat-muted font-medium">Phòng ban</span>
              <span className="text-[#7c3aed] dark:text-[#a78bfa] font-semibold bg-[#ede9fe] dark:bg-[#7c3aed]/20 w-max px-2 py-0.5 rounded text-[13px]">
                {authUser?.department || "Chưa xếp phòng"}
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-start">
              <span className="text-chat-muted font-medium">Chức vụ</span>
              <span className="text-chat-text font-medium">
                {authUser?.role === "admin" ? "Admin" : authUser?.role === "director" ? "Giám đốc" : authUser?.role === "moderator" ? "Quản lý" : "Nhân viên"}
              </span>
            </div>
          </div>
        </div>
      </div>



    </div>
  )
}


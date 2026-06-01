import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ProfileModal({ 
  selectedProfile, 
  onClose 
}: { 
  selectedProfile: any | null, 
  onClose: () => void 
}) {
  return (
    <Dialog open={!!selectedProfile} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[400px] p-0 overflow-hidden border shadow-2xl rounded-xl" style={{ background: 'var(--chat-bg-sidebar)', borderColor: 'var(--chat-border)', color: 'var(--chat-text)' }}>
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b shrink-0 z-10" style={{ borderColor: 'var(--chat-border)', background: 'var(--chat-bg-header)' }}>
          <DialogTitle className="text-[16px] font-semibold text-chat-text">Thông tin tài khoản</DialogTitle>
        </DialogHeader>

        {/* Cover Profile */}
        <div className="relative w-full h-[140px] bg-chat-hover shrink-0 group">
          <img src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Cover" />
        </div>

        {/* Avatar Section */}
        <div className="px-4 relative flex flex-col -mt-10 mb-4 shrink-0">
          <div className="flex items-end gap-3">
            <div className="relative group/avatar">
              <img src={selectedProfile?.profilePicture || "/avatar.png"} className="w-[76px] h-[76px] rounded-full object-cover border-4 shadow-sm" style={{ borderColor: 'var(--chat-bg-sidebar)' }} alt={selectedProfile?.fullname} />
            </div>
            <div className="flex items-center gap-2 mb-2 group/name">
              <h3 className="text-[18px] font-semibold text-chat-text pb-0.5">{selectedProfile?.fullname || "Người dùng"}</h3>
            </div>
          </div>
        </div>

        {/* Scrollable Details */}
        <div className="px-4 pb-4">
          <div className="border rounded-lg p-3 px-4 shadow-sm" style={{ background: 'var(--chat-bg-main)', borderColor: 'var(--chat-border)' }}>
            <h4 className="text-[15px] font-bold text-chat-text mb-3 border-b pb-2" style={{ borderColor: 'var(--chat-border)' }}>Thông tin cá nhân</h4>
            <div className="flex flex-col gap-3.5 text-[14px] pt-1">
              <div className="grid grid-cols-[100px_1fr] items-start">
                <span className="text-chat-muted font-medium">Giới tính</span>
                <span className="text-chat-text font-medium">{selectedProfile?.gender || "Chưa cập nhật"}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] items-start">
                <span className="text-chat-muted font-medium">Ngày sinh</span>
                <span className="text-chat-text font-medium">{selectedProfile?.dateOfBirth || "Chưa cập nhật"}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] items-start">
                <span className="text-chat-muted font-medium">Điện thoại</span>
                <span className="text-chat-text font-medium">{selectedProfile?.phoneNumber || "Chưa cập nhật"}</span>
              </div>
              <div className="border-t my-0 pt-3 grid grid-cols-[100px_1fr] items-start" style={{ borderColor: 'var(--chat-border)' }}>
                <span className="text-chat-muted font-medium">Phòng ban</span>
                <span className="text-[#7c3aed] dark:text-[#a78bfa] font-semibold bg-[#ede9fe] dark:bg-[#7c3aed]/20 w-max px-2 py-0.5 rounded text-[13px]">
                  {selectedProfile?.department || "Chưa xếp phòng"}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] items-start">
                <span className="text-chat-muted font-medium">Chức vụ</span>
                <span className="text-chat-text font-medium">
                  {selectedProfile?.role === "admin" ? "Admin" : selectedProfile?.role === "director" ? "Giám đốc" : selectedProfile?.role === "moderator" ? "Quản lý" : "Nhân viên"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

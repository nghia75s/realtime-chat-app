import { X, Mail, Calendar, Shield, Lock, Unlock } from "lucide-react"
import type { AdminUser } from "@/store/useAdminStore"
import { ROLE_LABELS, ROLE_COLORS, useAdminStore } from "@/store/useAdminStore"
import { useState } from "react"
import { toast } from "react-hot-toast"

interface UserDetailPanelProps {
  user: AdminUser
  onClose: () => void
  onUserUpdated: (updatedUser: AdminUser) => void
}

export default function UserDetailPanel({ user, onClose, onUserUpdated }: UserDetailPanelProps) {
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const [showReasonInput, setShowReasonInput] = useState(false)
  const [lockReason, setLockReason] = useState("")
  const { updateUserStatus } = useAdminStore()

  const handleToggleStatus = async () => {
    if (user.isActive && !showReasonInput) {
      setShowReasonInput(true);
      return;
    }

    if (user.isActive && showReasonInput && !lockReason.trim()) {
      toast.error("Vui lòng nhập lý do khoá tài khoản");
      return;
    }

    setIsTogglingStatus(true)
    const updated = await updateUserStatus(user._id, !user.isActive, user.isActive ? lockReason : undefined);
    if (updated) {
      onUserUpdated(updated);
    }
    setIsTogglingStatus(false)
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[360px] bg-[#1e1f22] border-l border-[#2b2d31] z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2b2d31] shrink-0">
          <h3 className="text-[15px] font-semibold text-white">Chi tiết nhân sự</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#2b2d31] text-[#a1a1a1] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Avatar & Name Section */}
          <div className="flex flex-col items-center pt-8 pb-6 px-5 border-b border-[#2b2d31]">
            <div className="relative mb-4">
              <img
                src={user.profilePicture || "/avatar.png"}
                alt={user.fullname}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#2b2d31]"
              />
              <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#1e1f22] ${user.isActive ? "bg-emerald-500" : "bg-[#4e4f52]"}`} />
            </div>
            <h2 className="text-[18px] font-bold text-white mb-1">{user.fullname}</h2>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[user.role]}`}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>

          {/* Info List */}
          <div className="px-5 py-5 flex flex-col gap-4">
            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#2b2d31] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-[#a1a1a1]" />
              </div>
              <div>
                <p className="text-[11px] text-[#717171] mb-0.5">Email</p>
                <p className="text-[14px] text-[#e1e1e1]">{user.email}</p>
              </div>
            </div>

            {/* Vai trò */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#2b2d31] flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-[#a1a1a1]" />
              </div>
              <div>
                <p className="text-[11px] text-[#717171] mb-0.5">Vai trò</p>
                <p className="text-[14px] text-[#e1e1e1]">{ROLE_LABELS[user.role]}</p>
              </div>
            </div>

            {/* Ngày tạo */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#2b2d31] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-[#a1a1a1]" />
              </div>
              <div>
                <p className="text-[11px] text-[#717171] mb-0.5">Ngày tham gia</p>
                <p className="text-[14px] text-[#e1e1e1]">{formatDate(user.createdAt)}</p>
              </div>
            </div>

            {/* Trạng thái */}
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${user.isActive ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                {user.isActive
                  ? <Unlock className="w-4 h-4 text-emerald-400" />
                  : <Lock className="w-4 h-4 text-red-400" />
                }
              </div>
              <div>
                <p className="text-[11px] text-[#717171] mb-0.5">Trạng thái</p>
                <p className={`text-[14px] font-medium ${user.isActive ? "text-emerald-400" : "text-red-400"}`}>
                  {user.isActive ? "Đang hoạt động" : "Bị khoá"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-5 border-t border-[#2b2d31] shrink-0">
          {showReasonInput && user.isActive ? (
            <div className="mb-4 animate-in fade-in slide-in-from-bottom-2">
              <label className="text-[11px] text-[#a1a1a1] mb-1.5 block">Lý do khoá tài khoản *</label>
              <input
                type="text"
                autoFocus
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="Ví dụ: Vi phạm quy tắc cộng đồng..."
                className="w-full bg-[#131416] border border-[#2b2d31] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#4e4f52] focus:outline-none focus:border-red-500 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleToggleStatus();
                  if (e.key === "Escape") setShowReasonInput(false);
                }}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowReasonInput(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold bg-[#2b2d31] text-[#a1a1a1] hover:text-white transition-colors"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleToggleStatus}
                  disabled={isTogglingStatus}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                >
                  {isTogglingStatus ? "Đang xử lý..." : "Xác nhận khoá"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                user.isActive
                  ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                  : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
              }`}
            >
              {isTogglingStatus ? "Đang xử lý..." : user.isActive ? "🔒 Khoá tài khoản" : "🔓 Mở khoá tài khoản"}
            </button>
          )}
        </div>
      </div>
    </>
  )
}

import { X } from "lucide-react"
import type { AdminUser } from "@/store/useAdminStore"
import { ROLE_LABELS, ROLE_COLORS, useAdminStore } from "@/store/useAdminStore"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { UserDetailView } from "./UserDetailView"
import { UserDetailEdit, type EditUserFields } from "./UserDetailEdit"

interface UserDetailPanelProps {
  user: AdminUser
  onClose: () => void
  onUserUpdated: (updatedUser: AdminUser) => void
}

export default function UserDetailPanel({ user, onClose, onUserUpdated }: UserDetailPanelProps) {
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const [showReasonInput, setShowReasonInput] = useState(false)
  const [lockReason, setLockReason] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const { updateUserStatus, updateUserProfileAdmin, isLoading } = useAdminStore()

  useEffect(() => {
    setIsEditing(false)
    setLockReason("")
    setShowReasonInput(false)
  }, [user])

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

  const handleSave = async (fields: EditUserFields) => {
    const updated = await updateUserProfileAdmin(user._id, fields)
    if (updated) {
      onUserUpdated(updated)
      setIsEditing(false)
    }
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
      <div className="fixed right-0 top-0 h-full w-[360px] bg-chat-sidebar border-l border-chat-border z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-chat-border shrink-0">
          <h3 className="text-[15px] font-semibold text-chat-text">
            {isEditing ? "Chỉnh sửa thông tin" : "Chi tiết nhân sự"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-chat-hover text-chat-muted hover:text-chat-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {isEditing ? (
          <UserDetailEdit
            user={user}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
            isLoading={isLoading}
          />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Avatar & Name Section */}
              <div className="flex flex-col items-center pt-8 pb-6 px-5 border-b border-chat-border">
                <div className="relative mb-4">
                  <img
                    src={user.profilePicture || "/avatar.png"}
                    alt={user.fullname}
                    className="w-20 h-20 rounded-full object-cover border-2 border-chat-border"
                  />
                  <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-chat-sidebar ${user.isActive ? "bg-emerald-500" : "bg-[#4e4f52]"}`} />
                </div>
                <h2 className="text-[18px] font-bold text-chat-text mb-1">{user.fullname}</h2>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[user.role]}`}>
                  {ROLE_LABELS[user.role]}
                </span>
              </div>

              {/* Read Only Details */}
              <UserDetailView user={user} formatDate={formatDate} />
            </div>

            {/* Footer Actions (Only visible in Read mode) */}
            <div className="p-5 border-t border-chat-border shrink-0 flex flex-col gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow"
              >
                ✏️ Sửa thông tin
              </button>

              {/* Block / Unblock Section */}
              {showReasonInput && user.isActive ? (
                <div className="mt-2 p-3 bg-chat-main border border-chat-border rounded-lg animate-in fade-in slide-in-from-bottom-2">
                  <label className="text-[11px] text-chat-muted mb-1.5 block">Lý do khoá tài khoản *</label>
                  <input
                    type="text"
                    autoFocus
                    value={lockReason}
                    onChange={(e) => setLockReason(e.target.value)}
                    placeholder="Ví dụ: Vi phạm quy tắc..."
                    className="w-full bg-chat-sidebar border border-chat-border rounded-lg px-3 py-2 text-xs text-chat-text placeholder:text-chat-muted focus:outline-none focus:border-red-500 transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleToggleStatus();
                      if (e.key === "Escape") setShowReasonInput(false);
                    }}
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setShowReasonInput(false)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-chat-hover text-chat-muted hover:text-chat-text transition-colors"
                    >
                      Huỷ
                    </button>
                    <button
                      onClick={handleToggleStatus}
                      disabled={isTogglingStatus}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                    >
                      {isTogglingStatus ? "Đang khóa..." : "Khoá"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleToggleStatus}
                  disabled={isTogglingStatus}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 border ${user.isActive
                    ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                    : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                    }`}
                >
                  {isTogglingStatus ? "Đang xử lý..." : user.isActive ? "🔒 Khoá tài khoản" : "🔓 Mở khoá tài khoản"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

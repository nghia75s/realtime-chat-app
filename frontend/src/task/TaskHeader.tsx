import { useState, useEffect, useRef } from "react"
import { Bell, Check } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useNotificationStore } from "@/store/useNotificationStore"

export function TaskHeader() {
  const { authUser } = useAuthStore()
  const {
    notifications,
    unreadCount,
    isSubscribed,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    subscribeToNotifications,
    unsubscribeFromNotifications
  } = useNotificationStore()

  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
    subscribeToNotifications()
    return () => unsubscribeFromNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Zustand functions được memo ổn định, dùng [] tránh chạy lại vô ńí gây duplicate listener

  // Bug #7 retry: Nếu lần đầu socket chưa sẵn sàng (authUser thay đổi sau login),
  // gọi lại subscribe để đảm bảo realtime notification luôn được kết nối
  useEffect(() => {
    if (!isSubscribed) {
      subscribeToNotifications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, isSubscribed])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[#1e1f22] border-b border-[#2b2d31] shrink-0 h-[64px]">
      <h2 className="text-[17px] font-semibold text-white">Quản lý công việc</h2>
      <div className="flex items-center gap-4 relative">
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 text-[#a1a1a1] hover:text-white hover:bg-[#2b2d31] rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 text-[10px] flex items-center justify-center rounded-full bg-red-500 text-white font-bold border border-[#1e1f22]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-[350px] bg-[#1e1f22] border border-[#2b2d31] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between p-3 border-b border-[#2b2d31]">
                <h3 className="font-semibold text-white">Thông báo</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[12px] text-[#0052cc] hover:text-[#0052cc]/80 transition-colors flex items-center gap-1">
                    <Check className="w-3 h-3" /> Đánh dấu đã đọc
                  </button>
                )}
              </div>
              <div className="max-h-[350px] overflow-y-auto custom-scrollbar flex flex-col">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => {
                        if (!n.isRead) markAsRead(n._id);
                      }}
                      className={`flex gap-3 p-3 border-b border-[#2b2d31] hover:bg-[#2b2d31]/50 cursor-pointer transition-colors ${!n.isRead ? 'bg-[#0052cc]/5' : ''}`}
                    >
                      <img src={n.sender.profilePicture || "/avatar.png"} className="w-8 h-8 rounded-full object-cover shrink-0 bg-[#2b2d31]" />
                      <div className="flex flex-col gap-1 flex-1">
                        <p className={`text-[13px] leading-tight ${!n.isRead ? 'text-white font-medium' : 'text-[#e1e1e1]'}`}>{n.message}</p>
                        <span className="text-[11px] text-[#a1a1a1]">
                          {new Date(n.createdAt).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}
                        </span>
                      </div>
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-[#0052cc] shrink-0 mt-1"></div>}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-[13px] text-[#a1a1a1]">Không có thông báo nào</div>
                )}
              </div>
            </div>
          )}
        </div>

        <img
          src={authUser?.profilePicture || "/avatar.png"}
          alt="Avatar"
          className="w-9 h-9 rounded-full object-cover border border-[#2b2d31]"
        />
      </div>
    </div>
  )
}

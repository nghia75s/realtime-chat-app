import React from "react"
import { Search, X } from "lucide-react"

// Constants
const ROLE_LABEL: Record<string, string> = {
  moderator: "Quản lý",
  director: "Giám đốc",
}

const ROLE_COLOR: Record<string, string> = {
  moderator: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  director: "bg-purple-500/20 text-purple-300 border-purple-500/30",
}

interface ReceiverSelectionModalProps {
  onClose: () => void
  searchQuery: string
  setSearchQuery: (val: string) => void
  filteredList: any[]
  receivers: string[]
  toggleReceiver: (id: string) => void
  contactList: any[]
}

export function ReceiverSelectionModal({
  onClose,
  searchQuery,
  setSearchQuery,
  filteredList,
  receivers,
  toggleReceiver,
  contactList,
}: ReceiverSelectionModalProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[660px] bg-[#1e1f22] rounded-xl border border-[#2b2d31] shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-200">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2b2d31]">
          <div>
            <h2 className="text-[16px] font-semibold text-white">Chọn Quản lý để gửi đơn</h2>
            <p className="text-[12px] text-blue-400 mt-0.5">
              Quản lý sẽ có thể phê duyệt hoặc từ chối lá đơn
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#a1a1a1] hover:text-white p-1 rounded-md hover:bg-[#2b2d31] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[300px] bg-[#131416]">
          {/* Left: list */}
          <div className="flex-1 flex flex-col border-r border-[#2b2d31]">
            <div className="p-3 border-b border-[#2b2d31] relative">
              <Search className="w-4 h-4 text-[#a1a1a1] absolute left-5 top-1/2 -translate-y-1/2" />
              <input
                placeholder="Tìm quản lý..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-[13px] text-[#e1e1e1] pl-8 pr-2 py-1"
              />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
              {filteredList.length === 0 && (
                <div className="text-center text-[13px] text-[#a1a1a1] mt-8 px-4">
                  Không có quản lý nào trong hệ thống
                </div>
              )}
              {filteredList.map((c: any) => {
                const isSelected = receivers.includes(c._id)
                return (
                  <div
                    key={c._id}
                    onClick={() => toggleReceiver(c._id)}
                    className="flex items-center gap-3 p-2 hover:bg-[#1e1f22] rounded-md cursor-pointer transition-colors group"
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${isSelected ? "bg-[#0052cc] border-[#0052cc]" : "border-[#a1a1a1] group-hover:border-white"
                      }`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                    <img src={c.profilePicture || "/avatar.png"} className="w-8 h-8 rounded-full bg-[#2b2d31] shrink-0" alt="avatar" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] text-[#e1e1e1] group-hover:text-white transition-colors truncate">
                        {c.fullname}
                      </p>
                      {c.department && (
                        <p className="text-[11px] text-[#a1a1a1] truncate">{c.department}</p>
                      )}
                    </div>
                    {/* Role badge cho manager */}
                    {c.role && ROLE_LABEL[c.role] && (
                      <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ROLE_COLOR[c.role]}`}>
                        {ROLE_LABEL[c.role]}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: selected */}
          <div className="w-[45%] flex flex-col bg-[#1e1f22]/30">
            <div className="p-4 text-[13px] font-medium text-[#e1e1e1] border-b border-[#2b2d31]">
              Đã chọn: <span className="text-[#0052cc]">{receivers.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-wrap gap-2 content-start">
              {receivers.map((id) => {
                const c = contactList.find((x: any) => x._id === id) as any
                if (!c) return null
                return (
                  <div
                    key={id}
                    className="flex items-center gap-1.5 bg-[#1e1f22] hover:bg-[#2b2d31] border border-[#2b2d31] rounded-full pl-2 pr-1.5 py-1.5 transition-colors"
                  >
                    <img src={c.profilePicture || "/avatar.png"} className="w-5 h-5 rounded-full" alt="avatar" />
                    <span className="text-[12px] text-[#e1e1e1] truncate max-w-[90px]">{c.fullname}</span>
                    <div
                      onClick={() => toggleReceiver(id)}
                      className="p-0.5 hover:bg-black/30 rounded-full cursor-pointer ml-1"
                    >
                      <X className="w-3 h-3 text-[#a1a1a1] hover:text-red-400" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end px-5 py-3 border-t border-[#2b2d31] bg-[#1e1f22]">
          <button
            onClick={onClose}
            className="px-5 py-2 text-[14px] font-medium bg-[#0052cc] hover:bg-[#0052cc]/90 text-white rounded-md transition-colors shadow-sm"
          >
            Xác nhận ({receivers.length})
          </button>
        </div>
      </div>
    </div>
  )
}

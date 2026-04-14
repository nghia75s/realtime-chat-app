import { useEffect, useState } from "react"
import { Search, UserPlus, Users as GroupIcon, ChevronDown } from "lucide-react"
import { useChatStore } from "@/store/useChatStore"
import UsersLoadingSkeleton from "@/components/ui/UsersLoadingSkeleton"
import NoChatsFound from "@/components/ui/NoChatsFound"
import { useAuthStore } from "@/store/useAuthStore"

export function ChatListSidebar() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, selectedUser } = useChatStore()
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all")
  const { onlineUsers } = useAuthStore()

  useEffect(() => {
    getMyChatPartners()
  }, [getMyChatPartners])

  if (isUsersLoading) {
    return <UsersLoadingSkeleton />
  }

  return (
    <div className="flex w-[320px] shrink-0 flex-col border-r border-[#2b2d31] bg-[#1e1f22] h-full z-10 text-[#e1e1e1]">
      {/* Search Header */}
      <div className="flex flex-col px-4 pt-4 pb-2 border-b border-[#1e1f22]">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#a1a1a1]" />
            <input
              placeholder="Tìm kiếm"
              className="w-full rounded-md bg-[#131416] py-[6px] pl-[30px] pr-3 text-[14px] text-[#e1e1e1] outline-none placeholder:text-[#a1a1a1] focus:ring-1 focus:ring-[#0052cc] transition-all border border-[#2b2d31]"
            />
          </div>
          <button className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-md text-[#a1a1a1] hover:bg-[#2b2d31] transition-colors" title="Thêm bạn bè">
            <UserPlus className="h-[18px] w-[18px]" />
          </button>
          <button className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-md text-[#a1a1a1] hover:bg-[#2b2d31] transition-colors" title="Tạo nhóm">
            <GroupIcon className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Filter & Tabs */}
        <div className="flex items-center justify-between mt-1 border-b border-[#2b2d31]">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`pb-2 text-[14px] font-medium border-b-2 transition-colors ${activeTab === "all" ? "text-white border-[#0052cc]" : "text-[#a1a1a1] border-transparent hover:text-white"}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`pb-2 text-[14px] font-medium border-b-2 transition-colors ${activeTab === "unread" ? "text-white border-[#0052cc]" : "text-[#a1a1a1] border-transparent hover:text-white"}`}
            >
              Chưa đọc
            </button>
          </div>
          <div className="flex items-center gap-1 text-[#a1a1a1] cursor-pointer hover:text-white pb-2 transition-colors">
            <span className="text-[13px]">Phân loại</span>
            <ChevronDown className="h-[14px] w-[14px]" />
          </div>
        </div>
      </div>

      {/* Chat List (ScrollArea) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {chats.length === 0 ? (
          <NoChatsFound />
        ) : (
          chats.map((chat) => {
            const isActive = selectedUser?._id === chat._id
            return (
              <div
                key={chat._id}
                className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 ${isActive ? "bg-[#1a437a]" : "hover:bg-[#2b2d31]"}`}
                onClick={() => setSelectedUser(chat)}
              >
                <div className="relative">
                  <img src={chat.profilePicture || "/avatar.png"} alt={chat.fullname} className="w-[44px] h-[44px] rounded-full object-cover" />
                  {/* Trạng thái online: Chấm xanh */}
                  <div className={`absolute bottom-0 right-0 w-3 h-3 ${onlineUsers.includes(chat._id) ? "bg-green-500" : "bg-gray-500"} rounded-full border-2 border-[#1e1f22]`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="font-semibold text-[15px] truncate text-[#e1e1e1]">{chat.fullname}</h4>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

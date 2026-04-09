import * as React from "react"
import { Search, UserPlus, Filter, MoreHorizontal, CheckCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockConversations } from "../data/mockData"

interface ChatListSidebarProps {
  activeChatId: number;
  onSelectChat: (id: number) => void;
}

export function ChatListSidebar({ activeChatId, onSelectChat }: ChatListSidebarProps) {
  const [activeTab, setActiveTab] = React.useState("all")

  return (
    <div className="flex w-[340px] shrink-0 flex-col border-r border-zinc-200 bg-white h-full z-10">
      {/* Search Header */}
      <div className="flex flex-col px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-zinc-500" />
            <input
              placeholder="Tìm kiếm"
              className="w-full rounded-md bg-[#eaedf0] py-[6px] pl-[30px] pr-3 text-[14px] text-zinc-900 outline-none placeholder:text-zinc-500 focus:bg-white focus:ring-1 focus:ring-[#7c3aed] transition-all"
            />
          </div>
          <button className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 transition-colors">
            <UserPlus className="h-[18px] w-[18px]" />
          </button>
          <button className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 transition-colors">
            <MoreHorizontal className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between border-b border-zinc-200">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setActiveTab("all")}
              className={`text-[14px] pb-[6px] font-medium transition-colors border-b-2 ${
                activeTab === "all" ? "border-[#7c3aed] text-[#7c3aed]" : "border-transparent text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setActiveTab("unread")}
              className={`text-[14px] pb-[6px] font-medium transition-colors border-b-2 ${
                activeTab === "unread" ? "border-[#7c3aed] text-[#7c3aed]" : "border-transparent text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Chưa đọc
            </button>
          </div>
          <button className="flex items-center justify-center pb-[6px] text-zinc-500 hover:text-zinc-800 transition-colors">
            <Filter className="h-[16px] w-[16px]" />
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        <div className="flex flex-col py-1">
          {mockConversations.map((chat) => {
            const isActive = chat.id === activeChatId

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer relative group ${
                  isActive ? "bg-[#ede9fe]" : "hover:bg-zinc-100"
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-[48px] w-[48px] rounded-full border border-zinc-200/50">
                    <AvatarImage src={chat.avatar} alt={chat.name} className="object-cover" />
                    <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold text-lg">
                      {chat.fallback}
                    </AvatarFallback>
                  </Avatar>
                  {chat.isOnline && (
                     <span className="absolute bottom-0 right-0 h-[12px] w-[12px] rounded-full bg-purple-500 border-2 border-white"></span>
                  )}
                </div>

                <div className="flex flex-1 flex-col overflow-hidden pt-[2px] min-w-0">
                  <div className="flex items-center justify-between mb-[2px]">
                    <span className="truncate text-[15px] font-medium text-zinc-900">
                      {chat.name}
                    </span>
                    <span className={`text-[12px] whitespace-nowrap ml-2 ${chat.unread ? "text-zinc-900 font-medium" : "text-zinc-500"}`}>
                      {chat.time}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between min-w-0">
                    <div className={`truncate text-[14px] flex-1 min-w-0 pr-2 ${chat.unread ? "text-zinc-900 font-medium" : "text-zinc-500"}`}>
                      <span className={chat.lastMessage.startsWith("Bạn:") ? "text-zinc-500 font-normal" : ""}>
                         {chat.lastMessage}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0 h-[18px]">
                      {chat.isRead && !chat.unread && (
                        <CheckCheck className="h-[14px] w-[14px] text-zinc-400" />
                      )}
                      {chat.unread && (
                        <span className="flex h-[18px] min-w-[18px] px-[5px] items-center justify-center rounded-full bg-[#ff4a4a] text-[11px] font-bold text-white shadow-sm">
                          {chat.unread > 5 ? "5+" : chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


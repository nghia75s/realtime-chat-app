import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, UserPlus, Users as GroupIcon, ChevronDown, Pin, MoreHorizontal } from "lucide-react"
import { useChatStore } from "@/store/useChatStore"
import { useAuthStore } from "@/store/useAuthStore"
import UsersLoadingSkeleton from "@/components/ui/UsersLoadingSkeleton"
import NoChatsFound from "@/components/ui/NoChatsFound"
import { CreateGroupModal } from "./CreateGroupModal"
import { formatRelativeTime } from "@/lib/formatTime"
import toast from "react-hot-toast"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const renderLastMessagePreview = (msg: any, isGroup: boolean, authUser: any, partnerName: string) => {
  if (!msg) return null;
  
  const senderId = typeof msg.senderId === "object" ? msg.senderId?._id : msg.senderId;
  const isMe = senderId?.toString() === authUser?._id?.toString();
  
  const senderPrefix = isMe ? "Bạn: " : (isGroup && msg.senderId?.fullname ? `${msg.senderId.fullname.split(" ").pop()}: ` : "");
  
  if (msg.messageType === "task_assignment") {
    return `${senderPrefix}Có task mới được giao`;
  }
  
  if (msg.messageType === "document") {
    const senderName = isMe ? "Bạn" : partnerName; 
    const displayName = isMe ? "Bạn" : (isGroup && msg.senderId?.fullname ? msg.senderId.fullname : senderName);
    return `${displayName} đã gửi đơn từ cần phê duyệt`;
  }
  
  if (msg.messageType === "poll") {
    return `${senderPrefix}[Bình chọn] ${msg.pollPayload?.question || ""}`;
  }
  
  if (msg.messageType === "note") {
    return `${senderPrefix}[Ghi chú] ${msg.notePayload?.content || msg.text || ""}`;
  }
  
  if (msg.image && !msg.text) {
    return `${senderPrefix}[Hình ảnh]`;
  }
  
  if (msg.file && !msg.text) {
    return `${senderPrefix}[File] ${msg.file.name || "Đính kèm"}`;
  }
  
  return `${senderPrefix}${msg.text || ""}`;
};

export function ChatListSidebar() {
  const navigate = useNavigate()
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, selectedUser, getMyGroups, groups, isGroupsLoading, activeTab, setActiveTab, unreadChats, unreadGroups } = useChatStore()
  const { onlineUsers, authUser, pinChat, muteChat } = useAuthStore()
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const [hiddenChatIds, setHiddenChatIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("hidden-chats");
    return saved ? JSON.parse(saved) : [];
  })
  const [deletedChatIds, setDeletedChatIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("deleted-chats");
    return saved ? JSON.parse(saved) : [];
  })

  const handlePinToggle = async (id: string) => {
    const isCurrentlyPinned = authUser?.pinnedChats?.includes(id);
    await pinChat(id);
    toast.success(isCurrentlyPinned ? "Đã bỏ ghim hội thoại" : "Đã ghim hội thoại");
  }

  const handleMuteToggle = async (id: string) => {
    const isCurrentlyMuted = authUser?.mutedChats?.some((m: any) => m.chatId === id);
    if (isCurrentlyMuted) {
      await muteChat(id);
      toast.success("Đã bật lại thông báo");
    } else {
      const farFuture = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString();
      await muteChat(id, farFuture);
      toast.success("Đã tắt thông báo");
    }
  }

  const handleHideChat = (id: string) => {
    const next = [...hiddenChatIds, id];
    setHiddenChatIds(next);
    localStorage.setItem("hidden-chats", JSON.stringify(next));
    toast.success("Đã ẩn trò chuyện");
  }

  const handleUnhideChat = (id: string) => {
    const next = hiddenChatIds.filter(x => x !== id);
    setHiddenChatIds(next);
    localStorage.setItem("hidden-chats", JSON.stringify(next));
    toast.success("Đã hiện lại trò chuyện");
  }

  const handleDeleteChat = (id: string) => {
    const next = [...deletedChatIds, id];
    setDeletedChatIds(next);
    localStorage.setItem("deleted-chats", JSON.stringify(next));
    toast.success("Đã xóa hội thoại");
  }

  const handleRestoreChat = (id: string) => {
    const next = deletedChatIds.filter(x => x !== id);
    setDeletedChatIds(next);
    localStorage.setItem("deleted-chats", JSON.stringify(next));
    toast.success("Đã khôi phục hội thoại");
  }

  useEffect(() => {
    getMyChatPartners()
    getMyGroups()
  }, [getMyChatPartners, getMyGroups])

  return (
    <div className="flex w-[320px] shrink-0 flex-col border-r border-chat-border bg-chat-sidebar h-full z-10 text-chat-text">
      {/* Search Header */}
      <div className="flex flex-col px-4 pt-4 pb-2 border-b border-chat-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-chat-muted" />
            <input
              placeholder="Tìm kiếm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md bg-chat-main py-[6px] pl-[30px] pr-3 text-[14px] text-chat-text outline-none placeholder:text-chat-muted focus:ring-1 focus:ring-[#0052cc] transition-all border border-chat-border"
            />
          </div>
          <button className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-md text-chat-muted hover:bg-chat-hover transition-colors" title="Thêm bạn bè" onClick={() => navigate("/contacts") }>
            <UserPlus className="h-[18px] w-[18px]" />
          </button>
          <button 
            onClick={() => setIsCreateGroupOpen(true)}
            className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-md text-chat-muted hover:bg-chat-hover transition-colors" title="Tạo nhóm"
          >
            <GroupIcon className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Filter & Tabs */}
        <div className="flex items-center justify-between mt-1 border-b border-chat-border">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("personal")}
              className={`pb-2 text-[14px] font-medium border-b-2 transition-colors relative ${activeTab === "personal" ? "text-chat-text border-[#0052cc]" : "text-chat-muted border-transparent hover:text-chat-text"}`}
            >
              Cá nhân
              {unreadChats.length > 0 && <span className="absolute top-0 -right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_4px_rgba(239,68,68,0.8)]"></span>}
            </button>
            <button
              onClick={() => setActiveTab("group")}
              className={`pb-2 text-[14px] font-medium border-b-2 transition-colors relative ${activeTab === "group" ? "text-chat-text border-[#0052cc]" : "text-chat-muted border-transparent hover:text-chat-text"}`}
            >
              Nhóm
              {unreadGroups.length > 0 && <span className="absolute top-0 -right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_4px_rgba(239,68,68,0.8)]"></span>}
            </button>
          </div>
          <div className="flex items-center gap-1 text-chat-muted cursor-pointer hover:text-chat-text pb-2 transition-colors">
            <span className="text-[13px]">Phân loại</span>
            <ChevronDown className="h-[14px] w-[14px]" />
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Tab Cá Nhân */}
        {activeTab === "personal" && (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isUsersLoading ? (
              <UsersLoadingSkeleton />
            ) : chats.length === 0 ? (
              <NoChatsFound />
            ) : (
              [...chats]
                .filter(c => {
                  const matchesSearch = c.fullname.toLowerCase().includes(searchQuery.toLowerCase());
                  if (!matchesSearch) return false;
                  if (searchQuery.trim() !== "") return true;
                  return !hiddenChatIds.includes(c._id) && !deletedChatIds.includes(c._id);
                })
                .sort((a, b) => {
                  const aPinned = authUser?.pinnedChats?.includes(a._id);
                  const bPinned = authUser?.pinnedChats?.includes(b._id);
                  if (aPinned && !bPinned) return -1;
                  if (!aPinned && bPinned) return 1;
                  const aTime = a.lastMessageDate ? new Date(a.lastMessageDate).getTime() : 0;
                  const bTime = b.lastMessageDate ? new Date(b.lastMessageDate).getTime() : 0;
                  return bTime - aTime;
                }).map((chat) => {
                  const isActive = selectedUser?._id === chat._id
                  const isPinned = authUser?.pinnedChats?.includes(chat._id)
                  const isMuted = authUser?.mutedChats?.some((m: any) => m.chatId === chat._id)
                  const timeStr = chat.lastMessageDate ? formatRelativeTime(chat.lastMessageDate) : ""
                  return (
                    <div
                      key={chat._id}
                      className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 group relative ${isActive ? "bg-chat-active" : "hover:bg-chat-hover"}`}
                      onClick={() => setSelectedUser(chat)}
                    >
                      <div className="relative flex shrink-0">
                        <img src={chat.profilePicture || "/avatar.png"} alt={chat.fullname} className="w-[44px] h-[44px] rounded-full object-cover" />
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-chat-sidebar transition-colors ${
                          onlineUsers.includes(chat._id) ? "bg-green-500" : "bg-chat-border"
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start mb-0.5">
                          <div className="flex items-center flex-1 min-w-0 mr-2">
                            <h4 className={`font-semibold text-[15px] truncate ${unreadChats.includes(chat._id) ? "text-chat-text" : "text-chat-text/90"}`}>{chat.fullname}</h4>
                            {isPinned && <Pin className="h-3 w-3 text-[#1877F2] fill-current ml-2 shrink-0" />}
                            {isMuted && <span className="text-[11px] text-chat-muted ml-1.5 shrink-0" title="Đã tắt thông báo">🔕</span>}
                            {unreadChats.includes(chat._id) && <span className="w-2.5 h-2.5 bg-red-500 rounded-full ml-2 shrink-0"></span>}
                          </div>
                          
                          <div className="shrink-0 mt-0.5 relative flex items-center justify-end h-5 min-w-[50px]">
                            {timeStr && (
                              <span className={`text-[12px] text-chat-muted ${openMenuId === chat._id ? "hidden" : "group-hover:hidden"}`}>
                                {timeStr}
                              </span>
                            )}
                            <div className={`${openMenuId === chat._id ? "block" : "hidden group-hover:block"}`} onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu onOpenChange={(open) => setOpenMenuId(open ? chat._id : null)}>
                                <DropdownMenuTrigger asChild>
                                  <button className="relative flex items-center justify-center w-7 h-7 rounded bg-chat-hover text-chat-muted hover:bg-chat-active hover:text-chat-text transition-colors">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-chat-sidebar border border-chat-border text-chat-text rounded-md shadow-lg py-1 z-[100]">
                                  <DropdownMenuItem onClick={() => handlePinToggle(chat._id)} className="flex items-center px-4 py-2.5 text-[14px] font-normal hover:bg-chat-hover focus:bg-chat-hover focus:text-chat-text cursor-pointer transition-colors border-none outline-none">
                                    {isPinned ? "Bỏ ghim hội thoại" : "Ghim hội thoại"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleMuteToggle(chat._id)} className="flex items-center px-4 py-2.5 text-[14px] font-normal hover:bg-chat-hover focus:bg-chat-hover focus:text-chat-text cursor-pointer transition-colors border-none outline-none">
                                    {isMuted ? "Bật thông báo" : "Tắt thông báo"}
                                  </DropdownMenuItem>
                                  {hiddenChatIds.includes(chat._id) ? (
                                    <DropdownMenuItem onClick={() => handleUnhideChat(chat._id)} className="flex items-center px-4 py-2.5 text-[14px] font-normal hover:bg-chat-hover focus:bg-chat-hover focus:text-chat-text cursor-pointer transition-colors border-none outline-none">
                                      Hiện trò chuyện
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleHideChat(chat._id)} className="flex items-center px-4 py-2.5 text-[14px] font-normal hover:bg-chat-hover focus:bg-chat-hover focus:text-chat-text cursor-pointer transition-colors border-none outline-none">
                                      Ẩn trò chuyện
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator className="h-px bg-chat-border my-1" />
                                  {deletedChatIds.includes(chat._id) ? (
                                    <DropdownMenuItem onClick={() => handleRestoreChat(chat._id)} className="flex items-center px-4 py-2.5 text-[14px] font-normal hover:bg-chat-hover focus:bg-chat-hover focus:text-chat-text cursor-pointer transition-colors border-none outline-none">
                                      Khôi phục hội thoại
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleDeleteChat(chat._id)} className="flex items-center px-4 py-2.5 text-[14px] font-normal text-red-500 hover:bg-chat-hover focus:bg-chat-hover focus:text-red-500 cursor-pointer transition-colors border-none outline-none">
                                      Xóa hội thoại
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                        <p className="text-[13px] text-chat-muted truncate">
                          {renderLastMessagePreview(chat.lastMessage, false, authUser, chat.fullname)}
                        </p>
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        )}

        {/* Tab Nhóm */}
        {activeTab === "group" && (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isGroupsLoading ? (
              <UsersLoadingSkeleton />
            ) : groups.length === 0 ? (
              <div className="px-4 py-6 text-chat-muted text-[13px] italic text-center">Bạn chưa tham gia nhóm nào</div>
            ) : (
              [...groups]
                .filter(g => {
                  const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
                  if (!matchesSearch) return false;
                  if (searchQuery.trim() !== "") return true;
                  return !hiddenChatIds.includes(g._id) && !deletedChatIds.includes(g._id);
                })
                .sort((a, b) => {
                  const aPinned = authUser?.pinnedChats?.includes(a._id);
                  const bPinned = authUser?.pinnedChats?.includes(b._id);
                  if (aPinned && !bPinned) return -1;
                  if (!aPinned && bPinned) return 1;
                  const aTime = a.lastMessageDate ? new Date(a.lastMessageDate).getTime() : 0;
                  const bTime = b.lastMessageDate ? new Date(b.lastMessageDate).getTime() : 0;
                  return bTime - aTime;
                }).map((group) => {
                  const isActive = selectedUser?._id === group._id
                  const isPinned = authUser?.pinnedChats?.includes(group._id)
                  const isMuted = authUser?.mutedChats?.some((m: any) => m.chatId === group._id)
                  const timeStr = group.lastMessageDate ? formatRelativeTime(group.lastMessageDate) : ""
                  return (
                    <div
                      key={group._id}
                      className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 group relative ${isActive ? "bg-chat-active" : "hover:bg-chat-hover"}`}
                      onClick={() => setSelectedUser(group)}
                    >
                      <div className="relative flex shrink-0">
                        <div className="w-[44px] h-[44px] rounded-full bg-chat-hover flex items-center justify-center border border-chat-border overflow-hidden">
                          {group.groupPicture ? (
                            <img src={group.groupPicture} alt={group.name} className="w-full h-full object-cover" />
                          ) : (
                            <GroupIcon className="w-5 h-5 text-chat-muted" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <div className="flex items-center flex-1 min-w-0 mr-2">
                            <h4 className={`font-semibold text-[15px] truncate ${unreadGroups.includes(group._id) ? "text-chat-text" : "text-chat-text/90"}`}>{group.name}</h4>
                            {isPinned && <Pin className="h-3 w-3 text-[#1877F2] fill-current ml-2 shrink-0" />}
                            {isMuted && <span className="text-[11px] text-chat-muted ml-1.5 shrink-0" title="Đã tắt thông báo">🔕</span>}
                            {unreadGroups.includes(group._id) && <span className="w-2.5 h-2.5 bg-red-500 rounded-full ml-2 shrink-0"></span>}
                          </div>
                          
                          <div className="shrink-0 mt-0.5 relative flex items-center justify-end h-5 min-w-[50px]">
                            {timeStr && (
                              <span className={`text-[12px] text-chat-muted ${openMenuId === group._id ? "hidden" : "group-hover:hidden"}`}>
                                {timeStr}
                              </span>
                            )}
                            <div className={`${openMenuId === group._id ? "block" : "hidden group-hover:block"}`} onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu onOpenChange={(open) => setOpenMenuId(open ? group._id : null)}>
                                <DropdownMenuTrigger asChild>
                                  <button className="relative flex items-center justify-center w-7 h-7 rounded bg-chat-hover text-chat-muted hover:bg-chat-active hover:text-chat-text transition-colors">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-chat-sidebar border border-chat-border text-chat-text rounded-md shadow-lg py-1 z-[100]">
                                  <DropdownMenuItem onClick={() => handlePinToggle(group._id)} className="flex items-center px-4 py-2.5 text-[14px] font-normal hover:bg-chat-hover focus:bg-chat-hover focus:text-chat-text cursor-pointer transition-colors border-none outline-none">
                                    {isPinned ? "Bỏ ghim hội thoại" : "Ghim hội thoại"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleMuteToggle(group._id)} className="flex items-center px-4 py-2.5 text-[14px] font-normal hover:bg-chat-hover focus:bg-chat-hover focus:text-chat-text cursor-pointer transition-colors border-none outline-none">
                                    {isMuted ? "Bật thông báo" : "Tắt thông báo"}
                                  </DropdownMenuItem>
                                  {hiddenChatIds.includes(group._id) ? (
                                    <DropdownMenuItem onClick={() => handleUnhideChat(group._id)} className="flex items-center px-4 py-2.5 text-[14px] font-normal hover:bg-chat-hover focus:bg-chat-hover focus:text-chat-text cursor-pointer transition-colors border-none outline-none">
                                      Hiện trò chuyện
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleHideChat(group._id)} className="flex items-center px-4 py-2.5 text-[14px] font-normal hover:bg-chat-hover focus:bg-chat-hover focus:text-chat-text cursor-pointer transition-colors border-none outline-none">
                                      Ẩn trò chuyện
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator className="h-px bg-chat-border my-1" />
                                  {deletedChatIds.includes(group._id) ? (
                                    <DropdownMenuItem onClick={() => handleRestoreChat(group._id)} className="flex items-center px-4 py-2.5 text-[14px] font-normal hover:bg-chat-hover focus:bg-chat-hover focus:text-chat-text cursor-pointer transition-colors border-none outline-none">
                                      Khôi phục hội thoại
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleDeleteChat(group._id)} className="flex items-center px-4 py-2.5 text-[14px] font-normal text-red-500 hover:bg-chat-hover focus:bg-chat-hover focus:text-red-500 cursor-pointer transition-colors border-none outline-none">
                                      Xóa hội thoại
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                        <p className="text-[13px] text-chat-muted truncate">
                          {renderLastMessagePreview(group.lastMessage, true, authUser, group.name) || `${group.memberCount || 0} thành viên`}
                        </p>
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        )}

      </div>

      <CreateGroupModal isOpen={isCreateGroupOpen} onClose={() => setIsCreateGroupOpen(false)} />
    </div>
  )
}

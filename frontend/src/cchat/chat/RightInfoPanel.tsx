import { useEffect, useMemo, useState } from "react"
import { Bell, BellOff, ShieldAlert, ChevronRight, FileText, Pin, Users, LogOut, PenBox, Settings, AlertTriangle, Trash2, Search } from "lucide-react"
import { ArchivePanel } from "./ArchivePanel"
import { GroupManagementPanel } from "./GroupManagementPanel"
import { MembersPanel } from "./MembersPanel"
import { GroupBoardPanel } from "../chat/GroupBoardPanel"
import { AddGroupMemberModal } from "./modals/AddGroupMemberModal"
import { EditGroupModal } from "./modals/EditGroupModal"
import { MuteNotificationModal } from "./modals/MuteNotificationModal"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useAuthStore } from "@/store/useAuthStore"
import { useChatStore } from "@/store/useChatStore"

export function RightInfoPanel({ chat, onRequestOpenImage }: { chat: any; onRequestOpenImage?: (messageId: string) => void }) {
  const [view, setView] = useState<"info" | "archive" | "management" | "members" | "board" | "search">("info")
  const [archiveTab, setArchiveTab] = useState<"media" | "file" | "link">("media")
  const [isBoardOpen, setIsBoardOpen] = useState(false)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false)
  const [isMuteNotificationOpen, setIsMuteNotificationOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { authUser, pinChat, muteChat } = useAuthStore()
  const { messages } = useChatStore()

  useEffect(() => {
    setView("info")
    setArchiveTab("media")
    setIsBoardOpen(false)
    setIsAddMemberOpen(false)
    setIsEditGroupOpen(false)
    setIsMuteNotificationOpen(false)
    setSearchQuery("")
  }, [chat?._id])

  const openArchive = (tab: "media" | "file" | "link") => {
    setArchiveTab(tab)
    setView("archive")
  }

  if (!chat) return null;

  const isGroup = chat.isGroup || false
  const members = chat.members || []
  const creatorId = typeof chat.createdBy === "string" ? chat.createdBy : chat.createdBy?._id
  const memberIds = members.map((member: any) => typeof member === "string" ? member : member._id)
  const adminIds = (chat.admins || []).map((admin: any) => typeof admin === "string" ? admin : admin._id)

  const isCreator = authUser?._id === creatorId
  const isAdmin = adminIds.includes(authUser?._id)
  const isManager = isCreator || isAdmin
  const canEditInfo = isManager || (chat.settings?.memberPermissions?.changeNameAndAvatar !== false)

  const isPinned = authUser?.pinnedChats?.includes(chat._id)

  const isMuted = useMemo(() => {
    return authUser?.mutedChats?.some((m: any) => {
      if (m.chatId !== chat._id) return false
      if (!m.mutedUntil) return true
      return new Date(m.mutedUntil) > new Date()
    })
  }, [authUser?.mutedChats, chat._id])

  const handleToggleNotifications = async () => {
    if (isMuted) {
      await muteChat(chat._id)
    } else {
      setIsMuteNotificationOpen(true)
    }
  }

  const filteredMessages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return []

    return (messages || []).filter((msg: any) => {
      const text = [
        msg.text,
        msg.file?.name,
        msg.senderId?.fullname,
        msg.messageType === "document" ? msg.templateName || msg.documentName : "",
        msg.messageType === "task_assignment" ? msg.taskTitle || msg.text : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return text.includes(query)
    })
  }, [messages, searchQuery])

  const handleScrollToMessage = (msgId: string) => {
    const el = document.getElementById(`message-${msgId}`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      el.classList.add("bg-chat-hover/50", "transition-colors", "duration-500", "rounded-lg")
      setTimeout(() => {
        el.classList.remove("bg-chat-hover/50")
      }, 2000)
    }
  }

  const handlePinChat = () => {
    pinChat(chat._id)
  }

  if (view === "archive") {
    return <ArchivePanel initialTab={archiveTab} onBack={() => setView("info")} onMediaClick={onRequestOpenImage} />
  }

  if (view === "management") {
    return <GroupManagementPanel chat={chat} onBack={() => setView("info")} />
  }

  if (view === "members") {
    return (
      <>
        <MembersPanel
          chat={chat}
          onBack={() => setView("info")}
          onAddMember={() => setIsAddMemberOpen(true)}
        />
        <AddGroupMemberModal
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          groupId={chat._id}
          currentMembers={memberIds}
        />
      </>
    )
  }

  if (view === "board") {
    return <GroupBoardPanel chat={chat} onBack={() => setView("info")} />
  }

  if (view === "search") {
    return (
      <div className="flex w-[340px] shrink-0 flex-col bg-chat-sidebar border-l border-chat-border h-full overflow-hidden text-chat-text">
        <div className="flex h-[65px] items-center justify-between border-b border-chat-border px-4 py-[14px] shrink-0 font-medium text-[16px] text-chat-text shadow-sm z-10">
          <button onClick={() => { setView("info"); setSearchQuery("") }} className="text-chat-muted hover:text-chat-text transition-colors">
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <span>Tìm tin nhắn</span>
          <div className="w-5" />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar px-4 py-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-chat-muted" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo nội dung hoặc tên người gửi"
                className="w-full rounded-2xl border border-chat-border bg-chat-bg py-3 pl-10 pr-4 text-chat-text outline-none transition-colors focus:border-chat-active focus:ring-2 focus:ring-chat-active/20"
              />
            </div>
          </div>

          {searchQuery.trim() === "" ? (
            <div className="text-chat-muted text-sm">Nhập từ khóa để tìm tin nhắn trong hội thoại.</div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-chat-muted text-sm">Không tìm thấy tin nhắn phù hợp.</div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((msg: any) => (
                <button
                  key={msg._id}
                  onClick={() => handleScrollToMessage(msg._id)}
                  className="w-full rounded-xl border border-chat-border bg-chat-hover p-3 text-left transition hover:border-chat-active hover:bg-chat-active/10"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-chat-text truncate">{msg.senderId?.fullname || (isGroup ? "Người dùng" : chat.fullname)}</span>
                    <span className="text-[12px] text-chat-muted">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-[14px] text-chat-text line-clamp-2">
                    {msg.text || msg.file?.name || (msg.messageType === "document" ? "Tin nhắn tài liệu" : "Tin nhắn")}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-[340px] shrink-0 flex-col bg-chat-sidebar border-l border-chat-border h-full overflow-hidden text-chat-text">
      {/* Header */}
      <div className="flex h-[65px] items-center justify-center border-b border-chat-border px-4 py-[14px] shrink-0 font-medium text-[16px] text-chat-text shadow-sm z-10">
        Thông tin {isGroup ? "nhóm" : "hội thoại"}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        <div className="flex flex-col pb-6">

          {/* Profile Section */}
          <div className="flex flex-col items-center pt-5 pb-4 px-4 border-b border-chat-border">
            <img src={isGroup ? (chat.groupPicture || "/group.png") : (chat.profilePicture || "/avatar.png")} className="h-[64px] w-[64px] mb-3 rounded-full object-cover border border-chat-border" alt="Avatar" />
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-[18px] font-semibold text-chat-text text-center cursor-pointer hover:underline">{isGroup ? chat.name : chat.fullname}</h2>
              {isGroup && canEditInfo && (
                <button onClick={() => setIsEditGroupOpen(true)} className="text-chat-muted hover:text-chat-text transition-colors bg-chat-hover rounded-full p-1 cursor-pointer">
                  <PenBox className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Actions - 4 Buttons for Groups, 2 for personal */}
            <div className="flex items-start justify-center gap-4 w-full">
              <div className="flex flex-col items-center gap-1.5 cursor-pointer group w-14" onClick={handleToggleNotifications}>
                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-chat-hover text-chat-text transition-colors group-hover:bg-chat-active/20 group-hover:text-[#7c3aed]">
                  {isMuted ? <BellOff className="h-[18px] w-[18px]" /> : <Bell className="h-[18px] w-[18px]" />}
                </div>
                <span className="text-[12px] text-chat-text text-center leading-tight">{isMuted ? "Mở thông báo" : "Tắt thông báo"}</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 cursor-pointer group w-14" onClick={() => setView("search") }>
                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-chat-hover text-chat-text transition-colors group-hover:bg-chat-active/20 group-hover:text-[#7c3aed]">
                  <Search className="h-[18px] w-[18px]" />
                </div>
                <span className="text-[12px] text-chat-text text-center leading-tight">Tìm tin nhắn</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 cursor-pointer group w-14" onClick={handlePinChat}>
                <div className={`flex h-[36px] w-[36px] items-center justify-center rounded-full transition-colors group-hover:bg-chat-active/20 group-hover:text-[#7c3aed] ${isPinned ? "bg-[#1877F2] text-white" : "bg-chat-hover text-chat-text"}`}>
                  <Pin className={`h-[18px] w-[18px] ${isPinned ? "fill-current" : ""}`} />
                </div>
                <span className="text-[12px] text-chat-text text-center leading-tight">{isPinned ? "Bỏ ghim" : "Ghim hội thoại"}</span>
              </div>

              {isGroup && isManager && (
                <>
                  <div className="flex flex-col items-center gap-1.5 cursor-pointer group w-14" onClick={() => setIsAddMemberOpen(true)}>
                    <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-chat-hover text-chat-text transition-colors group-hover:bg-chat-active/20 group-hover:text-[#7c3aed]">
                      <Users className="h-[18px] w-[18px]" />
                    </div>
                    <span className="text-[12px] text-chat-text text-center leading-tight">Thêm thành viên</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 cursor-pointer group w-14" onClick={() => setView("management")}>
                    <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-chat-hover text-chat-text transition-colors group-hover:bg-chat-active/20 group-hover:text-[#7c3aed]">
                      <Settings className="h-[18px] w-[18px]" />
                    </div>
                    <span className="text-[12px] text-chat-text text-center leading-tight">Quản lý nhóm</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Accordion Menus */}
          <div className="flex flex-col">

            {/* Members Section */}
            {isGroup && (
              <button onClick={() => setView('members')} className="flex flex-col w-full px-4 py-3 hover:bg-chat-hover transition-colors border-b border-chat-border group">
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[15px] font-bold text-chat-text">Thành viên nhóm</span>
                  <ChevronRight className="h-4 w-4 text-chat-muted group-hover:text-chat-text transition-colors" />
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-chat-muted" />
                  <span className="text-[13px] text-chat-muted">{members.length} thành viên</span>
                </div>
              </button>
            )}

            {/* Bảng tin nhóm */}
            {isGroup && (
              <Collapsible open={isBoardOpen} onOpenChange={setIsBoardOpen} className="border-b border-chat-border w-full">
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-chat-hover transition-colors">
                  <span className="text-[15px] font-bold text-chat-text">Bảng tin nhóm</span>
                  <ChevronRight className={`h-4 w-4 text-chat-muted transition-transform duration-200 ${isBoardOpen ? 'rotate-90' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2 pb-2">
                  <div className="flex flex-col mt-1">
                    <button onClick={() => setView('board')} className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-chat-hover transition-colors rounded-md text-chat-text">
                      <FileText className="w-4 h-4 text-[#a1a1a1]" />
                      <span className="text-[14px]">Ghi chú, ghim, bình chọn</span>
                    </button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Media/Content */}
            <div className="border-b border-chat-border w-full py-1">
              <button onClick={() => openArchive('media')} className="flex items-center justify-between w-full px-4 py-3 hover:bg-chat-hover transition-colors cursor-pointer group">
                <span className="text-[15px] font-bold text-chat-text">Ảnh/Video</span>
                <ChevronRight className="h-4 w-4 text-chat-muted" />
              </button>

              <button onClick={() => openArchive('file')} className="flex items-center justify-between w-full px-4 py-3 hover:bg-chat-hover transition-colors cursor-pointer group">
                <span className="text-[15px] font-bold text-chat-text">File</span>
                <ChevronRight className="h-4 w-4 text-chat-muted" />
              </button>

              <button onClick={() => openArchive('link')} className="flex items-center justify-between w-full px-4 py-3 hover:bg-chat-hover transition-colors cursor-pointer group">
                <span className="text-[15px] font-bold text-chat-text">Link</span>
                <ChevronRight className="h-4 w-4 text-chat-muted" />
              </button>
            </div>

            {/* Security */}
            <div className="border-b border-chat-border w-full py-1">
              <div className="px-4 py-3">
                <span className="text-[15px] font-bold text-chat-text">Thiết lập bảo mật</span>
              </div>
              <div className="flex flex-col">
                <button className="flex items-center justify-between w-full px-4 py-2 hover:bg-chat-hover transition-colors">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-chat-muted" strokeWidth={1.5} />
                    <span className="text-[14px] font-medium text-chat-text">Tin nhắn tự xóa</span>
                  </div>
                  <span className="text-[13px] text-chat-muted">Không bao giờ</span>
                </button>
                <div className="flex items-center justify-between w-full px-4 py-2 hover:bg-chat-hover transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-chat-muted" strokeWidth={1.5} />
                    <span className="text-[14px] font-medium text-chat-text">Ẩn trò chuyện</span>
                  </div>
                  {/* Switch Toggle Simulation */}
                  <div className="w-8 h-4 bg-[#4B5563] rounded-full flex items-center p-0.5">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Zone */}
            <div className="w-full py-2 flex flex-col">
              <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-chat-hover transition-colors">
                <AlertTriangle className="h-5 w-5 text-chat-muted" strokeWidth={1.5} />
                <span className="text-[15px] text-chat-text">Báo xấu</span>
              </button>

              <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-500/10 text-red-500 transition-colors">
                <Trash2 className="h-5 w-5" strokeWidth={1.5} />
                <span className="text-[15px]">Xóa lịch sử trò chuyện</span>
              </button>

              {isGroup && (
                <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-500/10 text-red-500 transition-colors">
                  <LogOut className="h-5 w-5" strokeWidth={1.5} />
                  <span className="text-[15px]">Rời nhóm</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddGroupMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        groupId={chat._id}
        currentMembers={memberIds}
      />

      <EditGroupModal
        isOpen={isEditGroupOpen}
        onClose={() => setIsEditGroupOpen(false)}
        chat={chat}
      />

      <MuteNotificationModal
        isOpen={isMuteNotificationOpen}
        onClose={() => setIsMuteNotificationOpen(false)}
        chat={chat}
      />
    </div>
  )
}

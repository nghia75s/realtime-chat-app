import { useState } from "react"
import { Bell, ShieldAlert, ChevronRight, Image as ImageIcon, FileText, Link as LinkIcon, Pin, Users, LogOut, Crown, PenBox, Calendar, Settings, AlertTriangle, Trash2 } from "lucide-react"
import { ArchivePanel } from "./ArchivePanel"
import { GroupManagementPanel } from "./GroupManagementPanel"
import { MembersPanel } from "./MembersPanel"
import { AddGroupMemberModal } from "./modals/AddGroupMemberModal"
import { EditGroupModal } from "./modals/EditGroupModal"
import { MuteNotificationModal } from "./modals/MuteNotificationModal"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useAuthStore } from "@/store/useAuthStore"

export function RightInfoPanel({ chat }: { chat: any }) {
  const [view, setView] = useState<"info" | "archive" | "management" | "members">("info")
  const [archiveTab, setArchiveTab] = useState<"media" | "file" | "link">("media")
  const [isMembersOpen, setIsMembersOpen] = useState(true)
  const [isBoardOpen, setIsBoardOpen] = useState(false)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false)
  const [isMuteNotificationOpen, setIsMuteNotificationOpen] = useState(false)

  const { authUser, pinChat } = useAuthStore()

  const openArchive = (tab: "media" | "file" | "link") => {
    setArchiveTab(tab)
    setView("archive")
  }

  if (!chat) return null;

  const isGroup = chat.isGroup || false
  const members = chat.members || []
  const creatorId = typeof chat.createdBy === "string" ? chat.createdBy : chat.createdBy?._id
  const memberIds = members.map((member: any) => typeof member === "string" ? member : member._id)

  const isPinned = authUser?.pinnedChats?.includes(chat._id)

  const handlePinChat = () => {
    pinChat(chat._id)
  }

  if (view === "archive") {
    return <ArchivePanel initialTab={archiveTab} onBack={() => setView("info")} />
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
              {isGroup && (
                <button onClick={() => setIsEditGroupOpen(true)} className="text-chat-muted hover:text-chat-text transition-colors bg-chat-hover rounded-full p-1 cursor-pointer">
                  <PenBox className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Actions - 4 Buttons for Groups, 2 for personal */}
            <div className="flex items-start justify-center gap-4 w-full">
              <div className="flex flex-col items-center gap-1.5 cursor-pointer group w-14" onClick={() => setIsMuteNotificationOpen(true)}>
                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-chat-hover text-chat-text transition-colors group-hover:bg-chat-active/20 group-hover:text-[#7c3aed]">
                  <Bell className="h-[18px] w-[18px]" />
                </div>
                <span className="text-[12px] text-chat-text text-center leading-tight">Tắt thông báo</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 cursor-pointer group w-14" onClick={handlePinChat}>
                <div className={`flex h-[36px] w-[36px] items-center justify-center rounded-full transition-colors group-hover:bg-chat-active/20 group-hover:text-[#7c3aed] ${isPinned ? "bg-[#1877F2] text-white" : "bg-chat-hover text-chat-text"}`}>
                  <Pin className={`h-[18px] w-[18px] ${isPinned ? "fill-current" : ""}`} />
                </div>
                <span className="text-[12px] text-chat-text text-center leading-tight">{isPinned ? "Bỏ ghim" : "Ghim hội thoại"}</span>
              </div>

              {isGroup && (
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
                    <button className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-chat-hover transition-colors rounded-md text-chat-text">
                      <FileText className="w-4 h-4 text-chat-muted" />
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

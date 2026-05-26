import { useEffect, useState } from "react"
import { Bell, Clock, ShieldAlert, ChevronRight, Image as ImageIcon, FileText, Link as LinkIcon, Pin, Users, UserPlus, LogOut, Crown, Search, Check } from "lucide-react"
import { ArchivePanel } from "./ArchivePanel"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "react-hot-toast"
import { useChatStore } from "@/store/useChatStore"
import { useAuthStore } from "@/store/useAuthStore"

export function RightInfoPanel({ chat }: { chat: any }) {
  const [view, setView] = useState<"info" | "archive">("info")
  const [archiveTab, setArchiveTab] = useState<"media" | "file" | "link">("media")
  const [isMembersOpen, setIsMembersOpen] = useState(true)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  const { allContacts, getAllcontacts, addGroupMember, setSelectedUser } = useChatStore()
  const { authUser } = useAuthStore()

  useEffect(() => {
    if (isAddMemberOpen && allContacts.length === 0) {
      getAllcontacts()
    }
  }, [isAddMemberOpen, allContacts.length, getAllcontacts])

  const openArchive = (tab: "media" | "file" | "link") => {
    setArchiveTab(tab)
    setView("archive")
  }

  if (!chat) return null;

  // Lấy dữ liệu thành viên thật từ props
  const isGroup = chat.isGroup || false
  const members = chat.members || []
  const creatorId = typeof chat.createdBy === "string" ? chat.createdBy : chat.createdBy?._id
  const memberIds = members.map((member: any) => typeof member === "string" ? member : member._id)
  const availableContacts = allContacts.filter(contact => !memberIds.includes(contact._id))
  const filteredContacts = availableContacts.filter(contact =>
    contact.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const selectedMember = allContacts.find(contact => contact._id === selectedMemberId)

  const handleAddMember = async () => {
    if (!selectedMemberId) {
      toast.error("Vui lòng chọn thành viên để thêm")
      return
    }

    try {
      const updatedGroup = await addGroupMember(chat._id, selectedMemberId)
      setSelectedUser({ ...updatedGroup, isGroup: true })
      toast.success(`${selectedMember?.fullname || "Thành viên"} đã được thêm vào nhóm`)
      setIsAddMemberOpen(false)
      setSearchQuery("")
      setSelectedMemberId(null)
    } catch (error) {
      console.error(error)
    }
  }

  if (view === "archive") {
    return <ArchivePanel initialTab={archiveTab} onBack={() => setView("info")} />
  }

  return (
    <div className="flex w-[340px] shrink-0 flex-col bg-[#1e1f22] border-l border-[#2b2d31] h-full overflow-hidden text-[#e1e1e1]">
      {/* Header */}
      <div className="flex h-[60px] items-center justify-center border-b border-[#2b2d31] px-4 py-[14px] shrink-0 font-medium text-[16px] text-white shadow-sm z-10">
        Thông tin {isGroup ? "nhóm" : "hội thoại"}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        <div className="flex flex-col pb-6">

          {/* Profile Section */}
          <div className="flex flex-col items-center pt-5 pb-4 px-4 border-b border-[#2b2d31]">
            <img src={isGroup ? (chat.groupPicture || "/group.png") : (chat.profilePicture || "/avatar.png")} className="h-[64px] w-[64px] mb-3 rounded-full object-cover border border-[#2b2d31]" alt="Avatar" />
            <h2 className="text-[18px] font-semibold text-white mb-4 text-center cursor-pointer hover:underline">{isGroup ? chat.name : chat.fullname}</h2>

            {/* Quick Actions */}
            <div className="flex items-start justify-center gap-6 w-full">
              <div className="flex flex-col items-center gap-1.5 cursor-pointer group w-16">
                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#131416] text-[#a1a1a1] transition-colors group-hover:bg-[#2b2d31] group-hover:text-white">
                  <Bell className="h-[18px] w-[18px]" />
                </div>
                <span className="text-[12px] text-[#a1a1a1] text-center leading-tight">Tắt thông báo</span>
              </div>
              
              {isGroup && creatorId === authUser?._id && (
                <div className="flex flex-col items-center gap-1.5 cursor-pointer group w-16" onClick={() => setIsAddMemberOpen(true)}>
                  <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#131416] text-[#a1a1a1] transition-colors group-hover:bg-[#2b2d31] group-hover:text-white">
                    <UserPlus className="h-[18px] w-[18px]" />
                  </div>
                  <span className="text-[12px] text-[#a1a1a1] text-center leading-tight">Thêm thành viên</span>
                </div>
              )}
              
              <div className="flex flex-col items-center gap-1.5 cursor-pointer group w-16">
                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#131416] text-[#a1a1a1] transition-colors group-hover:bg-[#2b2d31] group-hover:text-white">
                  <Pin className="h-[18px] w-[18px]" />
                </div>
                <span className="text-[12px] text-[#a1a1a1] text-center leading-tight">Ghim hội thoại</span>
              </div>
            </div>
          </div>

          {/* Accordion Menus */}
          <div className="flex flex-col">

            {/* Members Section (Chỉ Nhóm mới có) */}
            {isGroup && (
              <Collapsible open={isMembersOpen} onOpenChange={setIsMembersOpen} className="border-b border-[#2b2d31] w-full">
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-[#2b2d31] transition-colors">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-[#a1a1a1]" strokeWidth={1.5} />
                    <span className="text-[15px] font-medium text-[#e1e1e1]">Thành viên nhóm ({members.length})</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-[#a1a1a1] transition-transform duration-200 ${isMembersOpen ? 'rotate-90' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2 pb-2">
                  <div className="flex flex-col gap-1 mt-1">
                    {members.map((member: any) => {
                      const memberId = typeof member === "string" ? member : member._id
                      const isCreator = memberId?.toString() === creatorId?.toString()
                      const memberPic = member.profilePicture || "/avatar.png"
                      const memberName = member.fullname || memberId
                      return (
                        <div key={memberId} className="flex items-center gap-3 p-2 rounded-md hover:bg-[#2b2d31] transition-colors group cursor-pointer">
                          <img src={memberPic} className="w-8 h-8 rounded-full object-cover" alt="" />
                          <div className="flex-1 min-w-0 flex flex-col">
                            <span className="text-[14px] truncate text-[#e1e1e1]">{memberName}</span>
                            {isCreator && <span className="text-[11px] text-[#ebaa16] flex items-center gap-1"><Crown className="w-3 h-3" /> Trưởng nhóm</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Reminders */}
            <div className="border-b border-[#2b2d31] w-full hover:bg-[#2b2d31] transition-colors">
              <button className="flex items-center justify-between w-full px-4 py-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[#a1a1a1]" strokeWidth={1.5} />
                  <span className="text-[15px] font-medium text-[#e1e1e1]">Danh sách nhắc hẹn</span>
                </div>
                <ChevronRight className="h-4 w-4 text-[#a1a1a1]" />
              </button>
            </div>

            {/* Media/Content */}
            <div className="border-b border-[#2b2d31] w-full py-2">
              <div className="px-4 py-2">
                <span className="text-[13px] font-semibold text-[#a1a1a1] uppercase tracking-wider">Ảnh, Link, File đã gửi</span>
              </div>

              <button onClick={() => openArchive('media')} className="flex items-center justify-between w-full px-4 py-3 hover:bg-[#2b2d31] transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <ImageIcon className="h-5 w-5 text-[#a1a1a1]" strokeWidth={1.5} />
                  <span className="text-[15px] font-medium text-[#e1e1e1] group-hover:text-[#0052cc] transition-colors">Ảnh / Video</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[12px] text-[#a1a1a1] mr-2 group-hover:text-[#0052cc] transition-colors">Xem tất cả</span>
                  <ChevronRight className="h-4 w-4 text-[#a1a1a1] group-hover:text-[#0052cc]" />
                </div>
              </button>

              <button onClick={() => openArchive('file')} className="flex items-center justify-between w-full px-4 py-3 hover:bg-[#2b2d31] transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-[#a1a1a1]" strokeWidth={1.5} />
                  <span className="text-[15px] font-medium text-[#e1e1e1] group-hover:text-[#0052cc] transition-colors">Tài liệu / File</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[12px] text-[#a1a1a1] mr-2 group-hover:text-[#0052cc] transition-colors">Xem tất cả</span>
                  <ChevronRight className="h-4 w-4 text-[#a1a1a1] group-hover:text-[#0052cc]" />
                </div>
              </button>
              
              <button onClick={() => openArchive('link')} className="flex items-center justify-between w-full px-4 py-3 hover:bg-[#2b2d31] transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <LinkIcon className="h-5 w-5 text-[#a1a1a1]" strokeWidth={1.5} />
                  <span className="text-[15px] font-medium text-[#e1e1e1] group-hover:text-[#0052cc] transition-colors">Link chia sẻ</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[12px] text-[#a1a1a1] mr-2 group-hover:text-[#0052cc] transition-colors">Xem tất cả</span>
                  <ChevronRight className="h-4 w-4 text-[#a1a1a1] group-hover:text-[#0052cc]" />
                </div>
              </button>
            </div>

            {/* Security & Danger Zone */}
            <div className="w-full mt-2 flex flex-col">
              <button className="flex items-center justify-between w-full px-4 py-3 hover:bg-[#2b2d31] transition-colors">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-5 w-5 text-[#a1a1a1]" strokeWidth={1.5} />
                  <span className="text-[15px] font-medium text-[#e1e1e1]">Thiết lập bảo mật</span>
                </div>
                <ChevronRight className="h-4 w-4 text-[#a1a1a1]" />
              </button>
              
              {isGroup && (
                <>
                  <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-500/10 text-red-500 transition-colors mt-2">
                    <LogOut className="h-5 w-5" strokeWidth={1.5} />
                    <span className="text-[15px] font-medium">Rời nhóm</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Dialog open={isAddMemberOpen} onOpenChange={(open) => !open && setIsAddMemberOpen(false)}>
        <DialogContent className="max-w-[440px] p-0 overflow-hidden bg-[#1e1f22] text-[#e1e1e1] border border-[#2b2d31] shadow-2xl rounded-xl">
          <DialogHeader className="px-5 py-4 border-b border-[#2b2d31] bg-[#1a1b1e]">
            <DialogTitle className="text-[16px] font-semibold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#0052cc]" />
              Thêm thành viên vào nhóm
            </DialogTitle>
          </DialogHeader>

          <div className="px-5 py-4">
            <p className="text-[14px] text-[#a1a1a1] mb-4">
              Chọn một thành viên chưa có trong nhóm để thêm.
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#a1a1a1]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm liên hệ..."
                className="w-full rounded-full bg-[#131416] py-2 pl-[38px] pr-4 text-[14px] outline-none border border-[#2b2d31] focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all"
              />
            </div>
            <div className="mt-4 max-h-[280px] overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-1">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact: any) => {
                  const isSelected = selectedMemberId === contact._id
                  return (
                    <button
                      key={contact._id}
                      type="button"
                      onClick={() => setSelectedMemberId(contact._id)}
                      className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${isSelected ? "border-[#0052cc] bg-[#1d2a48]" : "border-[#2b2d31] hover:border-[#0052cc] hover:bg-[#2b2d31]"}`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={contact.profilePicture || "/avatar.png"} alt={contact.fullname} className="w-10 h-10 rounded-full object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-medium text-[#e1e1e1]">{contact.fullname}</p>
                          {contact.email && <p className="text-[12px] text-[#a1a1a1] truncate">{contact.email}</p>}
                        </div>
                        {isSelected && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0052cc] text-white">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="py-10 text-center text-[#a1a1a1]">Không còn thành viên nào phù hợp để thêm.</div>
              )}
            </div>
          </div>

          <div className="px-5 py-4 border-t border-[#2b2d31] flex justify-end gap-3 bg-[#1a1b1e]">
            <button type="button" onClick={() => setIsAddMemberOpen(false)} className="px-5 py-2 rounded-md bg-[#2b2b2e] text-[#e1e1e1] hover:bg-[#3a3b3e] transition-colors">
              Hủy
            </button>
            <button type="button" onClick={handleAddMember} disabled={!selectedMemberId} className="px-5 py-2 rounded-md bg-[#0052cc] text-white hover:bg-[#0047b3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Thêm
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { useState } from "react"
import { Bell, Clock, ShieldAlert, ChevronRight, Image as ImageIcon, FileText, Link as LinkIcon, Pin, Users, UserPlus, LogOut, MoreHorizontal, Shield, Crown } from "lucide-react"
import { ArchivePanel } from "./ArchivePanel"
import { useAuthStore } from "@/store/useAuthStore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { toast } from "react-hot-toast"

export function RightInfoPanel({ chat }: { chat: any }) {
  const [view, setView] = useState<"info" | "archive">("info")
  const [archiveTab, setArchiveTab] = useState<"media" | "file" | "link">("media")
  const [isMembersOpen, setIsMembersOpen] = useState(true)
  const { authUser } = useAuthStore()

  const openArchive = (tab: "media" | "file" | "link") => {
    setArchiveTab(tab)
    setView("archive")
  }

  if (!chat) return null;

  // Giả lập logic Nhóm
  const isGroup = chat.isGroup || false
  const myRole = "admin" // fake: 'creator', 'admin', 'member'

  // Dữ liệu giả lập thành viên
  const mockMembers = [
    { _id: "1", fullname: "Hồng Hạnh (Bạn)", role: "creator", profilePicture: "/avatar.png" },
    { _id: "2", fullname: "Thanh Thảo", role: "admin", profilePicture: "/avatar.png" },
    { _id: "3", fullname: "Tân Cương", role: "member", profilePicture: "/avatar.png" },
    { _id: "4", fullname: "Anh Ship", role: "member", profilePicture: "/avatar.png" },
  ]

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
            <img src={chat.profilePicture || "/avatar.png"} className="h-[64px] w-[64px] mb-3 rounded-full object-cover border border-[#2b2d31]" alt="Avatar" />
            <h2 className="text-[18px] font-semibold text-white mb-4 text-center cursor-pointer hover:underline">{chat.fullname}</h2>

            {/* Quick Actions */}
            <div className="flex items-start justify-center gap-6 w-full">
              <div className="flex flex-col items-center gap-1.5 cursor-pointer group w-16">
                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#131416] text-[#a1a1a1] transition-colors group-hover:bg-[#2b2d31] group-hover:text-white">
                  <Bell className="h-[18px] w-[18px]" />
                </div>
                <span className="text-[12px] text-[#a1a1a1] text-center leading-tight">Tắt thông báo</span>
              </div>
              
              {isGroup && (
                <div className="flex flex-col items-center gap-1.5 cursor-pointer group w-16" onClick={() => toast("Chức năng thêm đang phát triển")}>
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
                    <span className="text-[15px] font-medium text-[#e1e1e1]">Thành viên nhóm ({mockMembers.length})</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-[#a1a1a1] transition-transform duration-200 ${isMembersOpen ? 'rotate-90' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2 pb-2">
                  <div className="flex flex-col gap-1 mt-1">
                    {mockMembers.map(member => (
                      <div key={member._id} className="flex items-center gap-3 p-2 rounded-md hover:bg-[#2b2d31] transition-colors group cursor-pointer">
                        <img src={member.profilePicture} className="w-8 h-8 rounded-full object-cover" alt="" />
                        <div className="flex-1 min-w-0 flex flex-col">
                          <span className="text-[14px] truncate text-[#e1e1e1]">{member.fullname}</span>
                          {member.role === "creator" && <span className="text-[11px] text-[#ebaa16] flex items-center gap-1"><Crown className="w-3 h-3" /> Trưởng nhóm</span>}
                          {member.role === "admin" && <span className="text-[11px] text-[#0052cc] flex items-center gap-1"><Shield className="w-3 h-3" /> Phó nhóm</span>}
                        </div>
                        
                        {/* Dropdown quản lý (Dành cho Admin/Creator) */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[#131416] rounded-md transition-all outline-none">
                              <MoreHorizontal className="w-4 h-4 text-[#a1a1a1]" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-[#1e1f22] border-[#2b2d31] text-[#e1e1e1]">
                            <DropdownMenuItem className="hover:bg-[#2b2d31] cursor-pointer">Xem trang cá nhân</DropdownMenuItem>
                            {(myRole === "creator" || myRole === "admin") && member.role !== "creator" && (
                              <>
                                <DropdownMenuSeparator className="bg-[#2b2d31]" />
                                {myRole === "creator" && member.role !== "admin" && (
                                  <DropdownMenuItem className="hover:bg-[#2b2d31] cursor-pointer">Thăng cấp Phó nhóm</DropdownMenuItem>
                                )}
                                {myRole === "creator" && member.role === "admin" && (
                                  <DropdownMenuItem className="hover:bg-[#2b2d31] cursor-pointer">Giáng chức</DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="hover:bg-red-500 hover:text-white text-red-400 cursor-pointer focus:bg-red-500 focus:text-white">
                                  Xóa khỏi nhóm
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
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
                  {myRole === "creator" && (
                    <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-500 text-red-500 hover:text-white transition-colors">
                      <ShieldAlert className="h-5 w-5" strokeWidth={1.5} />
                      <span className="text-[15px] font-medium">Giải tán nhóm</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

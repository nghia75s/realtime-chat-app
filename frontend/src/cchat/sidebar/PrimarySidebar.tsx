import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MessageCircle, BookUser, CheckSquare, Cloud, Briefcase, Settings, User, Database, Globe, HelpCircle, ShieldCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { chatActions } from "../actions/chatActions"
import { settingActions } from "../actions/settingActions"
import { SettingsModal } from "../settings/SettingsModal"
import { AccountModal } from "../account/AccountModal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/store/useAuthStore"
import { useChatStore } from "@/store/useChatStore"

interface PrimarySidebarProps {
  activeTab: "chat" | "contacts" | "todo" | "cloud" | "tools" | "admin" | "";
}

export function PrimarySidebar({ activeTab }: PrimarySidebarProps) {
  const navigate = useNavigate()
  const { logout, authUser } = useAuthStore()
  const { unreadChats, unreadGroups } = useChatStore()
  const totalUnread = unreadChats.length + unreadGroups.length
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)

  const topNav = [
    { id: "chat", icon: MessageCircle, label: "Tin nhắn" },
    { id: "contacts", icon: BookUser, label: "Danh bạ" },
    { id: "todo", icon: CheckSquare, label: "To-Do" },
    { id: "cloud", icon: Cloud, label: "Cloud của tôi" },
    { id: "tools", icon: Briefcase, label: "Công cụ" },
  ]

  if (authUser?.email === "admin@gmail.com") {
    topNav.push({ id: "admin", icon: ShieldCheck, label: "Quản trị Admin" })
  }

  return (
    <div className="flex h-full w-[64px] shrink-0 flex-col items-center justify-between bg-[#7c3aed] py-4 text-white/80 select-none z-50 relative">
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Avatar User */}
        <Avatar
          className="h-[48px] w-[48px] border border-white/20 shadow-md cursor-pointer hover:border-white/50 transition-colors"
          onClick={() => setIsAccountModalOpen(true)}
        >
          <AvatarImage src={authUser?.profilePicture || "/avatar.png"} />
          <AvatarFallback className="bg-purple-300 text-purple-900 font-bold">
            {authUser?.fullname?.charAt(0)?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>

        {/* Top Navigation */}
        <div className="flex flex-col items-center gap-2 w-full">
          {topNav.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                title={item.label}
                onClick={() => {
                  if (item.id === "admin") navigate("/admin");
                  else chatActions.switchTab(navigate, item.id);
                }}
                className={`group relative flex w-full flex-col items-center justify-center py-4 transition-colors hover:bg-white/10 ${isActive ? "bg-white/15 text-white" : ""
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-white rounded-r-md" />
                )}
                <div className="relative">
                  <item.icon
                    className={`h-[28px] w-[28px] ${isActive ? "fill-white/10 text-white" : "fill-transparent"}`}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  {item.id === "chat" && totalUnread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff4a4a] px-1 text-[11px] font-bold text-white shadow-sm ring-2 ring-[#7c3aed]">
                      {totalUnread > 99 ? "99+" : totalUnread}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 w-full">
        {/* Dropdown Menu for Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              title="Cài đặt"
              className="flex w-full items-center justify-center py-4 transition-colors hover:text-white hover:bg-white/10 outline-none"
            >
              <Settings className="h-[28px] w-[28px]" strokeWidth={1.5} />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="right"
            align="end"
            sideOffset={15}
            className="w-56 shadow-lg rounded-lg border-purple-200 py-2"
          >
            <DropdownMenuItem
              className="py-2.5 px-3 cursor-pointer text-purple-700 hover:text-purple-900 focus:bg-purple-700"
              onClick={() => setIsAccountModalOpen(true)}
            >
              <User className="mr-3 h-[18px] w-[18px]" strokeWidth={1.5} />
              <span className="text-[14px]">Thông tin tài khoản</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="py-2.5 px-3 cursor-pointer text-purple-700 hover:text-purple-900 focus:bg-purple-700"
              onClick={() => setIsSettingsModalOpen(true)}
            >
              <Settings className="mr-3 h-[18px] w-[18px]" strokeWidth={1.5} />
              <span className="text-[14px]">Cài đặt</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 border-zinc-100" />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="py-2.5 px-3 cursor-pointer text-purple-700 hover:text-purple-900 focus:bg-purple-700 data-[state=open]:bg-purple-700">
                <Database className="mr-3 h-[18px] w-[18px]" strokeWidth={1.5} />
                <span className="text-[14px]">Dữ liệu</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="shadow-lg border-zinc-200">
                  <DropdownMenuItem className="py-2.5 px-4 cursor-pointer text-[14px]">Quản lý dữ liệu</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="py-2.5 px-3 cursor-pointer text-purple-700 hover:text-purple-900 focus:bg-purple-700 data-[state=open]:bg-purple-700">
                <Globe className="mr-3 h-[18px] w-[18px]" strokeWidth={1.5} />
                <span className="text-[14px]">Ngôn ngữ</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="shadow-lg border-zinc-200">
                  <DropdownMenuItem onClick={() => settingActions.changeLanguage('vi')} className="py-2 px-4 cursor-pointer text-[14px]">Tiếng Việt</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => settingActions.changeLanguage('en')} className="py-2 px-4 cursor-pointer text-[14px]">English</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="py-2.5 px-3 cursor-pointer text-purple-700 hover:text-purple-900 focus:bg-purple-700 data-[state=open]:bg-purple-700">
                <HelpCircle className="mr-3 h-[18px] w-[18px]" strokeWidth={1.5} />
                <span className="text-[14px]">Hỗ trợ</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="shadow-lg border-zinc-200">
                  <DropdownMenuItem className="py-2.5 px-4 cursor-pointer text-[14px]">Trung tâm trợ giúp</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSeparator className="my-1 border-zinc-100" />

            <DropdownMenuItem
              onClick={logout}
              className="py-2.5 px-3 cursor-pointer text-[#ff4a4a] focus:bg-[#ff4a4a] focus:text-[#ff4a4a] hover:bg-[#ff4a4a]/10 hover:text-[#ff4a4a]"
            >
              <span className="text-[14px] font-medium ml-8">Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <AccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} />
    </div>
  )
}


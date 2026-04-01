import { useNavigate } from "react-router-dom"
import { MessageCircle, BookUser, CheckSquare, Cloud, Briefcase, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { chatActions } from "./actions/chatActions"
import { useAuthStore } from "@/store/useAuthStore";


interface PrimarySidebarProps {
  activeTab: "chat" | "contacts" | "todo" | "cloud" | "tools";
}

export function PrimarySidebar({ activeTab }: PrimarySidebarProps) {
  const navigate = useNavigate()

  const {logout} = useAuthStore();
  const topNav = [
    { id: "chat", icon: MessageCircle, label: "Tin nhắn" },
    { id: "contacts", icon: BookUser, label: "Danh bạ" },
    { id: "todo", icon: CheckSquare, label: "To-Do" },
    { id: "cloud", icon: Cloud, label: "Cloud của tôi" },
    { id: "tools", icon: Briefcase, label: "Công cụ" },
  ]

  return (
    <div className="flex h-full w-[64px] shrink-0 flex-col items-center justify-between bg-[#005AE0] py-4 text-white/80 select-none z-50">
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Avatar User */}
        <Avatar className="h-[48px] w-[48px] border border-white/20 shadow-md cursor-pointer hover:border-white/50 transition-colors">
          <AvatarImage src="/avatars/me.png" />
          <AvatarFallback className="bg-blue-300 text-blue-900 font-bold">Dat</AvatarFallback>
        </Avatar>

        {/* Top Navigation */}
        <div className="flex flex-col items-center gap-2 w-full">
          {topNav.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                title={item.label}
                onClick={() => chatActions.switchTab(navigate, item.id)}
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
                  {item.id === "chat" && (
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff4a4a] px-1 text-[11px] font-bold text-white shadow-sm ring-2 ring-[#005AE0]">
                      5+
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 w-full">
        <button
        onClick={logout}
          title="Cài đặt"
          className="flex w-full items-center justify-center py-4 transition-colors hover:text-white hover:bg-white/10"
        >
          <Settings className="h-[28px] w-[28px]" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

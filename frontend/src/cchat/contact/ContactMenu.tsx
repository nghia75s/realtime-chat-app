import { Search, UserPlus, Users, User, UserCog } from "lucide-react"
import { useChatStore } from "@/store/useChatStore"

export type ActiveMenu = "contacts" | "groups" | "group_invites"

interface ContactMenuProps {
  activeMenu: string;
  onSelectMenu: (menu: any) => void;
}

export function ContactMenu({ activeMenu, onSelectMenu }: ContactMenuProps) {
  const { groupInvitations } = useChatStore()

  const menuItems = [
    { id: "contacts", icon: User, label: "Danh sách bạn bè" },
    { id: "groups", icon: Users, label: "Danh sách nhóm và cộng đồng" },
    { id: "group_invites", icon: UserCog, label: "Lời mời vào nhóm và cộng đồng" },
  ] as const;

  return (
    <div className="flex w-[340px] shrink-0 flex-col border-r border-chat-border bg-chat-sidebar h-full z-10 text-chat-text">
      {/* Search Header */}
      <div className="flex flex-col px-4 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-chat-muted" />
            <input
              placeholder="Tìm kiếm"
              className="w-full rounded-md bg-chat-main py-[6px] pl-[30px] pr-3 text-[14px] text-chat-text outline-none placeholder:text-chat-muted transition-all border border-chat-border focus:border-[#0052cc]"
            />
          </div>
          <button className="flex justify-center items-center h-[32px] w-[32px] shrink-0 rounded-md text-chat-muted hover:bg-chat-hover transition-colors">
            <UserPlus className="h-[18px] w-[18px]" />
          </button>
          <button className="flex justify-center items-center h-[32px] w-[32px] shrink-0 rounded-md text-chat-muted hover:bg-chat-hover transition-colors">
            <Users className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* Menu List */}
      <div className="flex flex-col flex-1 overflow-y-auto min-h-0 pt-2 custom-scrollbar gap-1 px-2">
        {menuItems.map((item) => {
          const isActive = item.id === activeMenu;
          return (
            <button
              onClick={() => onSelectMenu(item.id)}
              key={item.id}
              className={`flex items-center gap-3 px-3 py-3.5 rounded-md transition-colors ${isActive
                ? "bg-chat-active text-chat-text font-medium"
                : "text-chat-text/90 hover:bg-chat-hover font-normal"
                }`}
            >
              <item.icon className={`h-[20px] w-[20px] ${isActive ? "text-[#0052cc]" : "text-[#a1a1a1]"}`} strokeWidth={isActive ? 2 : 1.5} />
              <span className="flex-1 text-left text-[15px]">{item.label}</span>
              {item.id === "group_invites" && groupInvitations.length > 0 && (
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff4a4a] px-1 text-[11px] font-bold text-white shadow-sm">
                  {groupInvitations.length > 99 ? "99+" : groupInvitations.length}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

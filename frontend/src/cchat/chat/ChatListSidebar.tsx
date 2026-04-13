import { useEffect } from "react"
import { Search, UserPlus, MoreHorizontal } from "lucide-react"
import { useChatStore } from "@/store/useChatStore";
import UsersLoadingSkeleton from "@/components/ui/UsersLoadingSkeleton";
import NoChatsFound from "@/components/ui/NoChatsFound";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ChatListSidebar() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser } = useChatStore()

  useEffect(() => {
    getMyChatPartners()
  }, [getMyChatPartners])

  if (isUsersLoading) {
    return <UsersLoadingSkeleton />;
  }
  if (chats.length === 0) {
    return <NoChatsFound />;
  }

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
      </div>

      {/* Chat List */}
      <>
        {chats.map((chat) => (
          <div
            key={chat._id}
            className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
            onClick={() => setSelectedUser(chat)}
          >
            <div className="flex items-center gap-3">
              <div className={`avatar online`}>
                <div className="size-12 rounded-full">
                  <img src={chat.profilePic || "/avatar.png"} alt={chat.fullname} />
                </div>
              </div>
              <h4 className="text-slate-200 font-medium truncate">{chat.fullname}</h4>
            </div>
          </div>
        ))}
      </>
    </div>
  )
}


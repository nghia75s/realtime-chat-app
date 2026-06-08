import { ChevronLeft, Crown, ShieldAlert } from "lucide-react"

interface AdminsPanelProps {
  chat: any;
  onBack: () => void;
}

export function AdminsPanel({ chat, onBack }: AdminsPanelProps) {
  if (!chat || !chat.isGroup) return null;

  const members = chat.members || []
  const creatorId = typeof chat.createdBy === "string" ? chat.createdBy : chat.createdBy?._id
  const adminIds = (chat.admins || []).map((admin: any) => typeof admin === "string" ? admin : admin._id)

  const adminsList = members.filter((m: any) => {
    const mId = typeof m === "string" ? m : m._id
    return mId === creatorId || adminIds.includes(mId)
  })

  // Sắp xếp: Trưởng nhóm lên đầu
  adminsList.sort((a: any, b: any) => {
    const aId = typeof a === "string" ? a : a._id
    const bId = typeof b === "string" ? b : b._id
    if (aId === creatorId) return -1;
    if (bId === creatorId) return 1;
    return 0;
  })

  return (
    <div className="flex w-[340px] shrink-0 flex-col border-l border-chat-border h-full overflow-hidden text-chat-text" style={{ background: 'var(--chat-bg-sidebar)' }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-chat-border px-4 py-[14px] shrink-0 font-medium text-[16px] text-chat-text shadow-sm z-10" style={{ background: 'var(--chat-bg-sidebar)' }}>
        <button
          onClick={onBack}
          className="p-1 -ml-1 hover:bg-chat-hover rounded text-chat-muted transition-colors shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="flex-1 text-center font-bold">Trưởng & phó nhóm</span>
        <div className="w-7"></div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar p-2" style={{ background: 'var(--chat-bg-sidebar)' }}>
        <div className="flex flex-col">
          {adminsList.map((member: any) => {
            const memberId = typeof member === "string" ? member : member._id
            const isCreator = memberId === creatorId
            const memberPic = member.profilePicture || "/avatar.png"
            const memberName = member.fullname || memberId

            return (
              <div key={memberId} className="flex items-center justify-between px-3 py-3 hover:bg-chat-hover transition-colors rounded-md">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative">
                    <img src={memberPic} className="w-10 h-10 rounded-full object-cover border border-chat-border" alt="" />
                    {isCreator ? (
                      <div className="absolute -bottom-1 -right-1 bg-[#ebaa16] text-[#1e1f22] p-0.5 rounded-full border-2 border-chat-sidebar" title="Trưởng nhóm">
                        <Crown className="w-2.5 h-2.5" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="absolute -bottom-1 -right-1 bg-[#1877F2] text-white p-0.5 rounded-full border-2 border-chat-sidebar" title="Phó nhóm">
                        <ShieldAlert className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="text-[14px] font-medium truncate text-chat-text">{memberName}</span>
                    <span className="text-[12px] text-chat-muted">{isCreator ? "Trưởng nhóm" : "Phó nhóm"}</span>
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

import { useChatStore } from "@/store/useChatStore"
import { useEffect, useState } from "react"
import { MailOpen, Check, X, User } from "lucide-react"

export function ContactInvitationsArea() {
  const { getGroupInvitations, groupInvitations, acceptGroupInvitation, declineGroupInvitation } = useChatStore()
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    getGroupInvitations()
  }, [getGroupInvitations])

  const handleAccept = async (groupId: string) => {
    setProcessingId(groupId);
    try {
      await acceptGroupInvitation(groupId);
    } finally {
      setProcessingId(null);
    }
  }

  const handleDecline = async (groupId: string) => {
    setProcessingId(groupId);
    try {
      await declineGroupInvitation(groupId);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden text-chat-text" style={{ background: 'var(--chat-bg-main)' }}>
      {/* Top Bar */}
      <div className="flex items-center px-5 py-4 border-b border-chat-border shrink-0 h-[64px]" style={{ background: 'var(--chat-bg-header)' }}>
        <div className="flex items-center gap-3">
          <MailOpen className="h-[22px] w-[22px] text-chat-text" strokeWidth={2} />
          <h2 className="text-[16px] font-semibold text-chat-text">Lời mời nhóm</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-5 pb-10">
        <h3 className="text-[15px] font-semibold text-chat-text mb-4">
          Đang chờ xử lý ({groupInvitations?.length || 0})
        </h3>
        
        {groupInvitations?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupInvitations.map((group) => (
              <div key={group._id} className="border border-chat-border rounded-lg p-4 flex items-center justify-between hover:border-chat-muted transition-all" style={{ background: 'var(--chat-bg-sidebar)' }}>
                <div className="flex items-center gap-3">
                  <img src={group.groupPicture || "/group-avatar.png"} alt={group.name} className="w-14 h-14 rounded-full object-cover border border-chat-border" />
                  <div>
                    <h4 className="font-semibold text-[15px] text-chat-text">{group.name}</h4>
                    <p className="text-[13px] text-chat-muted flex items-center gap-1 mt-0.5">
                      <User className="h-3 w-3" />
                      Mời bởi {group.createdBy?.fullname || "Quản trị viên"}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button 
                    onClick={() => handleAccept(group._id)}
                    disabled={processingId === group._id}
                    className="flex items-center justify-center h-9 w-9 rounded-md bg-[#0052cc]/10 text-[#0052cc] hover:bg-[#0052cc] hover:text-white transition-all disabled:opacity-50"
                    title="Đồng ý"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDecline(group._id)}
                    disabled={processingId === group._id}
                    className="flex items-center justify-center h-9 w-9 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                    title="Từ chối"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--chat-bg-sidebar)' }}>
              <MailOpen className="h-10 w-10 text-chat-muted" />
            </div>
            <h4 className="text-[15px] font-medium text-chat-text mb-2">Không có lời mời nào</h4>
            <p className="text-[13px] text-chat-muted max-w-sm">
              Khi ai đó mời bạn vào nhóm, lời mời sẽ xuất hiện ở đây.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

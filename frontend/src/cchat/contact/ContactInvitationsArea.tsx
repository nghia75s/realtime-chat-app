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
    <div className="flex flex-col flex-1 bg-[#131416] h-full overflow-hidden text-white">
      {/* Top Bar */}
      <div className="flex items-center px-5 py-4 border-b border-[#2b2d31] shrink-0 bg-[#1e1f22] h-[64px]">
        <div className="flex items-center gap-3">
          <MailOpen className="h-[22px] w-[22px] text-[#e1e1e1]" strokeWidth={2} />
          <h2 className="text-[16px] font-semibold text-white">Lời mời nhóm</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-5 pb-10">
        <h3 className="text-[15px] font-semibold text-white mb-4">
          Đang chờ xử lý ({groupInvitations?.length || 0})
        </h3>
        
        {groupInvitations?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupInvitations.map((group) => (
              <div key={group._id} className="bg-[#1e1f22] border border-[#2b2d31] rounded-lg p-4 flex items-center justify-between hover:border-[#3f4147] transition-all">
                <div className="flex items-center gap-3">
                  <img src={group.groupPicture || "/group-avatar.png"} alt={group.name} className="w-14 h-14 rounded-full object-cover" />
                  <div>
                    <h4 className="font-semibold text-[15px] text-white">{group.name}</h4>
                    <p className="text-[13px] text-[#a1a1a1] flex items-center gap-1 mt-0.5">
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
            <div className="w-20 h-20 bg-[#2b2d31] rounded-full flex items-center justify-center mb-4">
              <MailOpen className="h-10 w-10 text-[#a1a1a1]" />
            </div>
            <h4 className="text-[15px] font-medium text-white mb-2">Không có lời mời nào</h4>
            <p className="text-[13px] text-[#a1a1a1] max-w-sm">
              Khi ai đó mời bạn vào nhóm, lời mời sẽ xuất hiện ở đây.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

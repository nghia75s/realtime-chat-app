import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { useMessageActionStore } from "@/store/useMessageActionStore"
import { useAuthStore } from "@/store/useAuthStore"
import { X } from "lucide-react"

export function MessageDetailsModal() {
  const { isDetailsModalOpen, closeDetailsModal, detailsMessage } = useMessageActionStore()
  const { authUser } = useAuthStore()

  if (!detailsMessage) return null

  const isMe = detailsMessage.senderId === authUser?._id || detailsMessage.senderId?._id === authUser?._id
  const senderName = isMe ? authUser?.fullname : detailsMessage.senderId?.fullname
  const senderAvatar = isMe ? authUser?.profilePicture : detailsMessage.senderId?.profilePicture

  const timeStr = new Date(detailsMessage.createdAt).toLocaleString("vi-VN", {
    hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric"
  })

  return (
    <Dialog open={isDetailsModalOpen} onOpenChange={closeDetailsModal}>
      <DialogContent className="bg-[#1e1f22] border-[#3a3b3e] text-[#d1d1d1] max-w-sm w-full rounded-2xl p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-4 border-b border-[#2b2d31] flex flex-row items-center justify-between">
          <DialogTitle className="text-white text-[16px] font-semibold">Chi tiết tin nhắn</DialogTitle>
          <DialogClose asChild>
            <button className="text-[#a1a1a1] hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="flex flex-col p-5 bg-[#1a1b1e]">
          <div className="flex items-center gap-3 mb-4">
            <img src={senderAvatar || "/avatar.png"} alt={senderName || "User"} className="w-12 h-12 rounded-full object-cover border border-[#2b2d31]" />
            <div>
              <p className="text-white font-medium text-[15px]">{senderName}</p>
              <p className="text-[#818181] text-[12.5px] mt-0.5">{timeStr}</p>
            </div>
          </div>

          <div className="bg-[#2b2d31]/50 rounded-xl p-3.5 border border-[#3a3b3e]/30">
            {detailsMessage.image && (
              <img src={detailsMessage.image} alt="Attached" className="max-w-full rounded-lg mb-2 object-cover border border-[#3a3b3e]/50" />
            )}
            {detailsMessage.text && (
              <p className="text-[14.5px] text-[#e1e1e1] leading-[1.6] whitespace-pre-wrap">{detailsMessage.text}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

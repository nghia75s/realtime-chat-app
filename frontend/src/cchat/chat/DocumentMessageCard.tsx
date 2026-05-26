import { useState } from "react"
import { FileText, CheckCircle2, XCircle, ChevronDown, ChevronUp, Loader2, ZoomIn } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useChatStore } from "@/store/useChatStore"
import type { Message } from "@/store/useMessageBubbleStore"
import { toast } from "react-hot-toast"

interface DocumentMessageCardProps {
  msg: Message
  onViewFull: (htmlContent: string, templateName: string) => void
}

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  moderator: { label: "Quản lý", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  director: { label: "Giám đốc", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
}

export function DocumentMessageCard({ msg, onViewFull }: DocumentMessageCardProps) {
  const { authUser } = useAuthStore()
  const { replyDocumentMessage } = useChatStore()

  const senderId = typeof msg.senderId === "string" ? msg.senderId : msg.senderId?._id
  const isMe = senderId?.toString() === authUser?._id?.toString()

  // Manager = người có thể approveTasks hoặc là director/moderator
  const canApprove =
    !isMe &&
    !msg.documentReplyData &&
    (authUser?.permissions?.approveTasks ||
      authUser?.role === "moderator" ||
      authUser?.role === "director")

  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectNote, setRejectNote] = useState("")
  const [approveNote, setApproveNote] = useState("")
  const [showApproveNote, setShowApproveNote] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const payload = msg.documentPayload
  const reply = msg.documentReplyData

  const timeStr = new Date(msg.createdAt).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })

  const handleApprove = async () => {
    setIsSubmitting(true)
    try {
      await replyDocumentMessage(msg._id, "approved", approveNote.trim() || undefined)
      toast.success("Đã phê duyệt lá đơn!")
      setShowApproveNote(false)
      setApproveNote("")
    } catch {
      // error toast handled in store
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!rejectNote.trim()) {
      toast.error("Vui lòng nhập lý do từ chối")
      return
    }
    setIsSubmitting(true)
    try {
      await replyDocumentMessage(msg._id, "rejected", rejectNote.trim())
      toast.success("Đã gửi phản hồi từ chối!")
      setShowRejectInput(false)
      setRejectNote("")
    } catch {
      // error toast handled in store
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`flex w-full mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          relative w-[320px] rounded-2xl border shadow-lg overflow-hidden
          ${isMe
            ? "bg-[#0d2a5c] border-[#0052cc]/50"
            : "bg-[#1a1c1f] border-[#2b2d31]"
          }
        `}
      >
        {/* Header */}
        <div className={`px-4 py-3 flex items-center gap-2.5 border-b ${isMe ? "border-[#0052cc]/30 bg-[#0a1f48]" : "border-[#2b2d31] bg-[#16181b]"}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isMe ? "bg-[#0052cc]/30" : "bg-[#2b2d31]"}`}>
            <FileText className="w-4 h-4 text-[#0052cc]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">
              {payload?.templateName || "Lá đơn"}
            </p>
            <p className="text-[11px] text-[#a1a1a1]">Văn bản nội bộ</p>
          </div>
          {/* Status badge */}
          {reply && (
            <div className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${reply.status === "approved"
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : "bg-red-500/20 text-red-400 border-red-500/30"
              }`}>
              {reply.status === "approved" ? "✅ Đã duyệt" : "❌ Từ chối"}
            </div>
          )}
        </div>

        {/* Document preview — thu nhỏ, cắt chiều cao */}
        <div
          className="relative overflow-hidden cursor-pointer group m-3 rounded-lg border border-[#2b2d31]"
          style={{ height: "180px" }}
          onClick={() => payload?.htmlContent && onViewFull(payload.htmlContent, payload.templateName || "Lá đơn")}
        >
          <div
            className="bg-white w-full h-full overflow-hidden"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="origin-top-left"
              style={{ transform: "scale(0.55)", width: "580px", height: "330px", padding: "24px 36px" }}
              dangerouslySetInnerHTML={{ __html: payload?.htmlContent || "" }}
            />
          </div>
          {/* Overlay khi hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 rounded-full p-2">
              <ZoomIn className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>


        {/* Manager action buttons */}
        {canApprove && (
          <div className="px-4 py-3 border-t border-[#2b2d31] flex flex-col gap-2">
            {!showRejectInput && !showApproveNote && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowApproveNote(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-500 text-white text-[12px] font-semibold rounded-lg transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Phê duyệt
                </button>
                <button
                  onClick={() => setShowRejectInput(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-600/80 hover:bg-red-600 text-white text-[12px] font-semibold rounded-lg transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Từ chối
                </button>
              </div>
            )}

            {/* Approve with optional note */}
            {showApproveNote && (
              <div className="flex flex-col gap-2">
                <textarea
                  value={approveNote}
                  onChange={(e) => setApproveNote(e.target.value)}
                  placeholder="Ghi chú thêm cho người gửi (không bắt buộc)..."
                  rows={2}
                  className="w-full bg-[#131416] border border-[#3a3b3e] rounded-lg px-3 py-2 text-[12px] text-white outline-none focus:border-green-500 resize-none custom-scrollbar placeholder:text-[#555]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowApproveNote(false); setApproveNote("") }}
                    className="flex-1 py-1.5 bg-[#2b2d31] hover:bg-[#3a3b3e] text-[#a1a1a1] text-[12px] rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-600 hover:bg-green-500 text-white text-[12px] font-semibold rounded-lg transition-colors disabled:opacity-60"
                  >
                    {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                    Xác nhận duyệt
                  </button>
                </div>
              </div>
            )}

            {/* Reject with required reason */}
            {showRejectInput && (
              <div className="flex flex-col gap-2">
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Lý do từ chối (bắt buộc)..."
                  rows={2}
                  className="w-full bg-[#131416] border border-red-500/40 focus:border-red-500 rounded-lg px-3 py-2 text-[12px] text-white outline-none resize-none custom-scrollbar placeholder:text-[#555]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowRejectInput(false); setRejectNote("") }}
                    className="flex-1 py-1.5 bg-[#2b2d31] hover:bg-[#3a3b3e] text-[#a1a1a1] text-[12px] rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isSubmitting || !rejectNote.trim()}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[12px] font-semibold rounded-lg transition-colors disabled:opacity-60"
                  >
                    {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                    Gửi từ chối
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer timestamp */}
        <div className={`px-4 pb-3 pt-1 flex items-center justify-between text-[11px] text-[#6b6b6b] ${canApprove ? "" : "border-t border-[#2b2d31]/50 pt-2"}`}>
          <button
            onClick={() => payload?.htmlContent && onViewFull(payload.htmlContent, payload.templateName || "Lá đơn")}
            className="text-[#0052cc] hover:underline text-[11px]"
          >
            Xem đầy đủ →
          </button>
          <span>{timeStr}</span>
        </div>
      </div>
    </div>
  )
}

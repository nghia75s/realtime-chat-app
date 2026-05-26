import React from "react"
import { ClipboardList, Calendar, AlignLeft, UserCircle2 } from "lucide-react"
import type { Message } from "@/store/useMessageBubbleStore"
import { useAuthStore } from "@/store/useAuthStore"

interface TaskMessageCardProps {
  msg: Message
}

export function TaskMessageCard({ msg }: TaskMessageCardProps) {
  const { authUser } = useAuthStore()

  const senderId = typeof msg.senderId === "string" ? msg.senderId : msg.senderId?._id
  const isMe = senderId?.toString() === authUser?._id?.toString()
  const payload = msg.taskPayload

  const timeStr = new Date(msg.createdAt).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Nếu không có payload, fallback về tin nhắn text thông thường
  if (!payload) {
    return (
      <div className={`flex w-full mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
        <div className={`px-4 py-2 rounded-2xl max-w-[70%] text-[14px] ${isMe ? "bg-[#0052cc] text-white" : "bg-[#2b2d31] text-[#e1e1e1]"}`}>
          {msg.text}
        </div>
      </div>
    )
  }

  const dateStr = new Date(payload.deadline).toLocaleDateString("vi-VN")

  return (
    <div className={`flex w-full mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          relative w-[340px] rounded-2xl border shadow-lg overflow-hidden flex flex-col
          ${isMe
            ? "bg-[#0d2a5c] border-[#0052cc]/50"
            : "bg-[#1a1c1f] border-[#2b2d31]"
          }
        `}
      >
        {/* Header */}
        <div className={`px-4 py-3 flex items-center gap-3 border-b ${isMe ? "border-[#0052cc]/30 bg-[#0a1f48]" : "border-[#2b2d31] bg-[#16181b]"}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isMe ? "bg-[#0052cc]/30" : "bg-[#2b2d31]"}`}>
            <ClipboardList className="w-4 h-4 text-[#0052cc]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-white truncate leading-tight">
              Giao việc mới
            </p>
            <p className="text-[11px] text-[#a1a1a1] mt-0.5">Hệ thống quản lý công việc</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-3 text-[13px]">
          {/* Title */}
          <div>
            <h3 className="font-semibold text-blue-400 text-[14px] leading-snug">{payload.title}</h3>
          </div>

          {/* Deadline */}
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-[#a1a1a1] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-[#a1a1a1] text-[12px] block mb-0.5">Hạn chót</span>
              <span className="text-white font-medium">{dateStr}</span>
            </div>
          </div>

          {/* Description */}
          {payload.description && (
            <div className="flex items-start gap-2">
              <AlignLeft className="w-4 h-4 text-[#a1a1a1] shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-[#a1a1a1] text-[12px] block mb-0.5">Mô tả</span>
                <span className="text-white line-clamp-2">{payload.description}</span>
              </div>
            </div>
          )}

          {/* Note */}
          {payload.note && (
            <div className="flex items-start gap-2">
              <UserCircle2 className="w-4 h-4 text-[#a1a1a1] shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-[#a1a1a1] text-[12px] block mb-0.5">Ghi chú riêng</span>
                <span className="text-white italic">{payload.note}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer timestamp */}
        <div className="px-4 pb-3 flex items-center justify-end text-[10px] text-[#6b6b6b]">
          <span>{timeStr}</span>
        </div>
      </div>
    </div>
  )
}

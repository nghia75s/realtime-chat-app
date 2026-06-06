import React from "react"
import { ClipboardList, Calendar, AlignLeft, UserCircle2, CheckSquare, Square } from "lucide-react"
import type { Message } from "@/store/useMessageBubbleStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useMessageActionStore } from "@/store/useMessageActionStore"

interface TaskMessageCardProps {
  msg: Message
  senderAvatar?: string
  senderName?: string
  isGroupChat?: boolean
  hideHeader?: boolean
}

export function TaskMessageCard({
  msg,
  senderAvatar,
  senderName,
  isGroupChat,
  hideHeader,
}: TaskMessageCardProps) {
  const { authUser } = useAuthStore()
  const { isSelectionMode, toggleMessageSelection, selectedMessageIds } = useMessageActionStore()

  const senderId = typeof msg.senderId === "string" ? msg.senderId : msg.senderId?._id
  const isMe = senderId?.toString() === authUser?._id?.toString()
  const payload = msg.taskPayload
  const isSelected = selectedMessageIds.includes(msg._id)

  const timeStr = new Date(msg.createdAt).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Nếu không có payload, fallback về tin nhắn text thông thường
  if (!payload) {
    return (
      <div
        className={`flex w-full items-start group transition-colors px-4 py-1 mb-1 ${isSelected ? "bg-[#2b2d31]/40" : ""} ${isSelectionMode ? "cursor-pointer hover:bg-[#2b2d31]/20" : ""}`}
        onClick={() => isSelectionMode && toggleMessageSelection(msg._id, msg)}
      >
        {isSelectionMode && (
          <div className="flex items-center justify-center w-8 shrink-0 pt-2 mr-2">
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-[#0052cc]" />
            ) : (
              <Square className="w-5 h-5 text-[#a1a1a1]" />
            )}
          </div>
        )}
        <div className={`flex flex-1 ${isMe ? "justify-end" : "justify-start"}`}>
          {!isMe && !isSelectionMode && (
            <div className="flex items-start mr-2 shrink-0 w-8">
              {!hideHeader && (
                <img
                  src={senderAvatar || "/avatar.png"}
                  alt={senderName || "User"}
                  className="w-8 h-8 rounded-full object-cover border border-chat-border"
                />
              )}
            </div>
          )}
          <div className={`flex flex-col max-w-[75%] min-w-0 gap-1 ${isMe ? "items-end" : "items-start"}`}>
            {!isMe && isGroupChat && senderName && !hideHeader && (
              <span className="text-[12px] font-semibold text-chat-muted ml-1 mb-0.5">{senderName}</span>
            )}
            <div className={`px-4 py-2 rounded-2xl max-w-[70%] text-[14px] ${isMe ? "bg-[#0052cc] text-white" : "bg-zinc-100 dark:bg-[#2b2d31] text-zinc-900 dark:text-[#e1e1e1]"}`}>
              {msg.text}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const dateStr = new Date(payload.deadline).toLocaleDateString("vi-VN")

  return (
    <div
      className={`flex w-full items-start group transition-colors px-4 py-1 mb-1 ${isSelected ? "bg-[#2b2d31]/40" : ""} ${isSelectionMode ? "cursor-pointer hover:bg-[#2b2d31]/20" : ""}`}
      onClick={() => isSelectionMode && toggleMessageSelection(msg._id, msg)}
    >
      {/* Selection Checkbox */}
      {isSelectionMode && (
        <div className="flex items-center justify-center w-8 shrink-0 pt-2 mr-2">
          {isSelected ? (
            <CheckSquare className="w-5 h-5 text-[#0052cc]" />
          ) : (
            <Square className="w-5 h-5 text-[#a1a1a1]" />
          )}
        </div>
      )}

      {/* Container của bóng chat */}
      <div className={`flex flex-1 ${isMe ? "justify-end" : "justify-start"}`}>
        
        {/* Avatar của người gửi (nếu không phải mình) */}
        {!isMe && !isSelectionMode && (
          <div className="flex items-start mr-2 shrink-0 w-8">
            {!hideHeader && (
              <img
                src={senderAvatar || "/avatar.png"}
                alt={senderName || "User"}
                className="w-8 h-8 rounded-full object-cover border border-chat-border"
              />
            )}
          </div>
        )}

        <div className={`flex flex-col max-w-[75%] min-w-0 gap-1 ${isMe ? "items-end" : "items-start"}`}>
          {/* Tên người gửi */}
          {!isMe && isGroupChat && senderName && !hideHeader && (
            <span className="text-[12px] font-semibold text-chat-muted ml-1 mb-0.5">{senderName}</span>
          )}

          {/* Card chính */}
          <div
            className={`
              relative w-[340px] rounded-2xl border shadow-sm overflow-hidden flex flex-col
              ${isMe
                ? "bg-[#0d2a5c] border-[#0052cc]/50"
                : "bg-white dark:bg-[#1a1c1f] border-zinc-200 dark:border-[#2b2d31]"
              }
            `}
          >
            {/* Header */}
            <div className={`px-4 py-3 flex items-center gap-3 border-b ${isMe ? "border-[#0052cc]/30 bg-[#0a1f48]" : "border-zinc-200 dark:border-[#2b2d31] bg-zinc-50 dark:bg-[#16181b]"}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isMe ? "bg-[#0052cc]/30" : "bg-zinc-200 dark:bg-[#2b2d31]"}`}>
                <ClipboardList className="w-4 h-4 text-[#0052cc]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[14px] font-bold truncate leading-tight ${isMe ? "text-white" : "text-zinc-900 dark:text-white"}`}>
                  Giao việc mới
                </p>
                <p className="text-[11px] text-chat-muted mt-0.5">Hệ thống quản lý công việc</p>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-3 text-[13px]">
              {/* Title */}
              <div>
                <h3 className="font-semibold text-[#1877F2] dark:text-blue-400 text-[14px] leading-snug">{payload.title}</h3>
              </div>

              {/* Deadline */}
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-chat-muted shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-chat-muted text-[12px] block mb-0.5">Hạn chót</span>
                  <span className={`font-medium ${isMe ? "text-white" : "text-zinc-800 dark:text-white"}`}>{dateStr}</span>
                </div>
              </div>

              {/* Description */}
              {payload.description && (
                <div className="flex items-start gap-2">
                  <AlignLeft className="w-4 h-4 text-chat-muted shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-chat-muted text-[12px] block mb-0.5">Mô tả</span>
                    <span className={`line-clamp-2 ${isMe ? "text-white" : "text-zinc-800 dark:text-white"}`}>{payload.description}</span>
                  </div>
                </div>
              )}

              {/* Note */}
              {payload.note && (
                <div className="flex items-start gap-2">
                  <UserCircle2 className="w-4 h-4 text-chat-muted shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-chat-muted text-[12px] block mb-0.5">Ghi chú riêng</span>
                    <span className={`italic ${isMe ? "text-white" : "text-zinc-800 dark:text-white"}`}>{payload.note}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer timestamp */}
            <div className="px-4 pb-3 flex items-center justify-end text-[10px] text-chat-muted">
              <span>{timeStr}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


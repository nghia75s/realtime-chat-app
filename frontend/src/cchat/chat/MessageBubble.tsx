import { useState } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { useChatStore } from "@/store/useChatStore"
import { useMessageActionStore } from "@/store/useMessageActionStore"
import { Reply, Forward, Copy, Info, Trash2, RotateCcw, MoreHorizontal, CheckSquare, Square, CornerUpRight, Pin } from "lucide-react"
import { toast } from "react-hot-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { MessageBubbleProps } from "@/store/useMessageBubbleStore.ts"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function MessageBubble(props: MessageBubbleProps & { hideHeader?: boolean }) {
  const { msg, onImageLoad, onImageClick, senderAvatar, senderName, isGroupChat, onReply, onForward, hideHeader, canPin = true, isAdminMsg = false, highlightAdminMessages = false } = props
  const { authUser } = useAuthStore()
  const { recallMessage, deleteMessage, pinMessage } = useChatStore()
  const { 
    isSelectionMode, 
    toggleMessageSelection, 
    selectedMessageIds, 
    toggleSelectionMode,
    openDetailsModal
  } = useMessageActionStore()

  const senderId = typeof msg.senderId === "string" ? msg.senderId : msg.senderId?._id
  const isMe = senderId?.toString() === authUser?._id?.toString()
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [externalLink, setExternalLink] = useState<string | null>(null)

  const isSelected = selectedMessageIds.includes(msg._id)
  const isRecalled = msg.isRecalled === true
  const isForwarded = msg.isForwarded === true

  const timeStr = new Date(msg.createdAt).toLocaleTimeString(undefined, {
    hour: "2-digit", minute: "2-digit",
  })

  const fileExtension = msg.file?.name?.split(".").pop()?.toUpperCase() || "FILE"

  // --- SYSTEM MESSAGE RENDERER ---
  if (msg.messageType === "system") {
    return (
      <div className="flex w-full items-center justify-center my-3">
        <div className="px-4 py-1.5 rounded-full bg-[#2b2d31]/70 text-[#a1a1a1] text-[12px] text-center font-medium shadow-sm max-w-[85%] break-words border border-[#3a3b3e]/30">
          {msg.text}
        </div>
      </div>
    )
  }

  const handleCopy = () => {
    if (msg.text) {
      navigator.clipboard.writeText(msg.text)
      toast.success("Đã sao chép tin nhắn")
    }
  }

  const handleRecall = async () => {
    try {
      await recallMessage(msg._id);
      toast.success("Đã thu hồi tin nhắn");
    } catch (error) {
      // Error handled in store
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMessage(msg._id);
      toast.success("Đã xóa tin nhắn");
    } catch (error) {
      // Error handled in store
    }
  }

  const handlePin = async () => {
    try {
      await pinMessage(msg._id);
      // Success toast can be omitted since system message and real-time update will be obvious
    } catch (error) {
      // Error handled in store
    }
  }

  const toggleSelect = () => {
    toggleMessageSelection(msg._id, msg)
  }

  return (
    <div
      className={`flex w-full items-start group transition-colors px-4 py-1 mb-1 ${isSelected ? "bg-[#2b2d31]/40" : ""} ${isSelectionMode ? "cursor-pointer hover:bg-[#2b2d31]/20" : ""}`}
      onClick={() => isSelectionMode && toggleSelect()}
      onMouseEnter={() => setShowQuickActions(true)}
      onMouseLeave={() => setShowQuickActions(false)}
    >
      {/* Selection Checkbox (luôn nằm lề trái) */}
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
                className="w-8 h-8 rounded-full object-cover border border-[#3a3b3e]"
              />
            )}
          </div>
        )}

        {/* Quick Action Bar (Tin của MÌNH) */}
        {isMe && !isSelectionMode && !isRecalled && (
          <QuickActionBar 
            msg={msg} 
            isMe={isMe} 
            show={showQuickActions || isDropdownOpen}
            onReply={() => onReply?.(msg)}
            onForward={() => onForward?.(msg)}
            onCopy={handleCopy}
            onSelectMany={() => toggleSelectionMode(true)}
            onDetails={() => openDetailsModal(msg)}
            onRecall={handleRecall}
            onDelete={handleDelete}
            onPin={handlePin}
            canPin={canPin}
            onDropdownChange={setIsDropdownOpen}
          />
        )}

        {/* Bubble Chính */}
        <div className={`flex flex-col max-w-[75%] min-w-0 gap-1 ${isMe ? "items-end" : "items-start"}`}>
          {/* Tên người gửi */}
          {!isMe && isGroupChat && senderName && !hideHeader && (
            <div className="flex items-center gap-1.5 ml-1 mb-0.5">
              <span className="text-[12px] font-semibold text-[#a1a1a1]">{senderName}</span>
              {isAdminMsg && highlightAdminMessages && (
                <span className="px-1.5 py-0.5 bg-[#0052cc]/20 text-[#67d7ff] text-[9px] font-bold rounded uppercase tracking-wider border border-[#0052cc]/30">
                  Quản trị viên
                </span>
              )}
            </div>
          )}

          {/* --- Trạng thái THU HỒI --- */}
          {isRecalled ? (
            <div className={`px-4 py-2.5 rounded-xl text-[14px] italic border ${isMe ? "border-[#3a3b3e] bg-[#2b2d31]/50 text-[#a1a1a1]" : "border-[#3a3b3e] bg-[#2b2d31]/50 text-[#a1a1a1]"}`}>
              Tin nhắn đã được thu hồi
              <div className="text-[10px] mt-1 text-right opacity-70">{timeStr}</div>
            </div>
          ) : (
            <>
              {/* Ảnh */}
              {msg.image && (
                <div
                  className="relative overflow-hidden rounded-xl cursor-pointer hover:opacity-90 transition-opacity shadow-sm border border-[#3a3b3e]/30"
                  onClick={() => onImageClick?.(msg)}
                >
                  {isForwarded && !msg.text && !msg.file && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium tracking-wide flex items-center gap-1 z-10">
                      <CornerUpRight className="w-3 h-3" /> Chuyển tiếp
                    </div>
                  )}
                  <img src={msg.image} alt="Message" className="max-h-[300px] max-w-full w-auto object-contain bg-[#1a1b1e]" onLoad={onImageLoad} />
                  {!msg.text && (
                    <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium tracking-wide">
                      {timeStr}
                    </span>
                  )}
                </div>
              )}
 
              {/* File attachment */}
                  {msg.file && (
                    <div className={`px-[16px] py-[12px] rounded-2xl shadow-sm flex flex-col w-full min-w-0 gap-2 cursor-default select-text relative
                      ${isMe ? "bg-[#0052cc] text-white" : "bg-zinc-100 dark:bg-[#2b2d31] text-zinc-900 dark:text-[#e1e1e1]"}
                    `}>
                      {isForwarded && !msg.text && (
                        <div className={`flex items-center gap-1.5 text-[11.5px] font-medium mb-1 ${isMe ? "text-blue-200" : "text-[#a1a1a1]"}`}>
                          <CornerUpRight className="w-3.5 h-3.5" /> Chuyển tiếp
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-black/20 text-[#67d7ff] text-[10px] font-semibold tracking-[0.04em]">
                          {fileExtension}
                        </div>
                        <div className="min-w-0 flex-1">
                          {msg.file?.url ? (
                            <a
                              href={msg.file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate text-sm font-semibold text-blue-100 underline hover:text-white block"
                              onClick={(e) => {
                                e.preventDefault()
                                if (msg.file?.url) {
                                  setExternalLink(msg.file.url)
                                }
                              }}
                            >
                              {msg.file.name}
                            </a>
                          ) : (
                            <div className="truncate text-sm font-semibold">{msg.file.name}</div>
                          )}
                        </div>
                      </div>
                      {!msg.text && (
                        <div className={`flex items-center justify-end gap-1.5 text-[10.5px] mt-0.5 ${isMe ? "text-blue-200" : "text-zinc-500 dark:text-[#818181]"}`}>
                          <span>{timeStr}</span>
                        </div>
                      )}
                    </div>
                  )}
 
      <Dialog open={Boolean(externalLink)} onOpenChange={(open) => !open && setExternalLink(null)}>
        <DialogContent className="max-w-md bg-[#1e1f22] border border-[#2b2d31] text-[#e1e1e1]">
          <DialogHeader>
            <DialogTitle className="text-lg text-white">Xác nhận liên kết</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-sm text-[#cbd5e1]">
            Bạn sắp mở một liên kết bên ngoài. Hãy kiểm tra kỹ tên miền trước khi tiếp tục.
          </DialogDescription>
          <div className="rounded-xl border border-[#2b2d31] bg-[#111215] p-3 my-4 break-all text-sm text-[#e2e8f0]">
            {externalLink}
          </div>
          <DialogFooter className="gap-2">
            <Button onClick={() => setExternalLink(null)}>
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (externalLink) {
                  window.open(externalLink, "_blank", "noopener")
                }
                setExternalLink(null)
              }}
            >
              Mở liên kết
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
 
                  {/* Text */}
              {msg.text && (
                <div className={`px-[16px] py-[12px] rounded-2xl text-[15px] shadow-sm flex flex-col w-full min-w-0 gap-1.5 cursor-text select-text relative
                    ${isMe
                      ? "bg-[#0052cc] text-white"
                      : "bg-zinc-100 dark:bg-[#2b2d31] text-zinc-900 dark:text-[#e1e1e1]"
                    }
                  `}>
                  
                  {/* Dấu hiệu chuyển tiếp */}
                  {isForwarded && (
                    <div className={`flex items-center gap-1.5 text-[11.5px] font-medium mb-1 ${isMe ? "text-blue-200" : "text-zinc-500 dark:text-[#a1a1a1]"}`}>
                      <CornerUpRight className="w-3.5 h-3.5" /> Chuyển tiếp
                    </div>
                  )}
 
                  {/* Khung trích dẫn tin nhắn trả lời */}
                  {msg.replyTo && (
                    <div 
                      className={`pl-2 py-1 mb-1.5 border-l-[3px] rounded-r-md text-[13px] w-full max-w-[280px] sm:max-w-[360px] min-w-0 ${isMe ? "border-l-blue-200 bg-black/10 text-blue-100" : "border-l-[#0052cc] bg-zinc-200/50 dark:bg-[#1e1f22] text-zinc-600 dark:text-[#a1a1a1]"} overflow-hidden`}
                    >
                      <div className="font-semibold truncate text-[12.5px]">{msg.replyTo.senderId?.fullname || "Người dùng"}</div>
                      <div className="truncate opacity-90">
                        {msg.replyTo.messageType === "document"
                          ? `[Đơn] ${msg.replyTo.documentPayload?.templateName || "Tài liệu"}`
                          : msg.replyTo.messageType === "task_assignment"
                          ? `[Task] ${msg.replyTo.taskPayload?.title || "Công việc"}`
                          : msg.replyTo.messageType === "file"
                          ? "[File đính kèm]"
                          : msg.replyTo.image && !msg.replyTo.text
                          ? "[Hình ảnh]"
                          : msg.replyTo.text || "[Tin nhắn]"}
                      </div>
                    </div>
                  )}
 
                  <p className="leading-[1.5] whitespace-pre-wrap break-words">
                    {msg.text.split(/(https?:\/\/[^\s]+|www\.[^\s]+)/g).map((part: string, i: number) => {
                      const isLink = part.match(/^(https?:\/\/[^\s]+|www\.[^\s]+)/i);
                      if (isLink) {
                        const href = part.startsWith("www.") ? `http://${part}` : part;
                        return (
                          <a
                            key={i}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`underline ${isMe ? 'text-blue-200 hover:text-white' : 'text-blue-400 hover:text-blue-300'} transition-colors`}
                            onClick={(e) => {
                              e.preventDefault();
                              setExternalLink(href);
                            }}
                          >
                            {part}
                          </a>
                        );
                      }
                      return part;
                    })}
                  </p>
                  <div className={`flex items-center justify-end gap-1.5 text-[10.5px] mt-0.5 ${isMe ? "text-blue-200" : "text-zinc-500 dark:text-[#818181]"}`}>
                    <span>{timeStr}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Action Bar (Tin của NGƯỜI KHÁC) */}
        {!isMe && !isSelectionMode && !isRecalled && (
          <QuickActionBar 
            msg={msg} 
            isMe={isMe} 
            show={showQuickActions || isDropdownOpen}
            onReply={() => onReply?.(msg)}
            onForward={() => onForward?.(msg)}
            onCopy={handleCopy}
            onSelectMany={() => toggleSelectionMode(true)}
            onDetails={() => openDetailsModal(msg)}
            onRecall={handleRecall}
            onDelete={handleDelete}
            onPin={handlePin}
            canPin={canPin}
            onDropdownChange={setIsDropdownOpen}
          />
        )}
      </div>
    </div>
  )
}

// === Component Thanh Nút Tương Tác ===
function QuickActionBar({ msg, isMe, show, onReply, onForward, onCopy, onSelectMany, onDetails, onRecall, onDelete, onPin, canPin, onDropdownChange }: any) {
  return (
    <div className={`flex items-center gap-0.5 ${isMe ? "mr-1.5" : "ml-1.5"} transition-opacity duration-150 ${show ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onReply} className="p-1.5 rounded-full hover:bg-[#2b2d31] text-[#a1a1a1] hover:text-white transition-colors">
              <Reply className="w-[18px] h-[18px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-[#1e1f22] text-white border-[#3a3b3e] text-[12px] px-2 py-1">
            Trả lời
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onForward} className="p-1.5 rounded-full hover:bg-[#2b2d31] text-[#a1a1a1] hover:text-white transition-colors">
              <Forward className="w-[18px] h-[18px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-[#1e1f22] text-white border-[#3a3b3e] text-[12px] px-2 py-1">
            Chuyển tiếp
          </TooltipContent>
        </Tooltip>

        <DropdownMenu onOpenChange={onDropdownChange}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-full hover:bg-[#2b2d31] text-[#a1a1a1] hover:text-white transition-colors outline-none data-[state=open]:bg-[#2b2d31] data-[state=open]:text-white">
                  <MoreHorizontal className="w-[18px] h-[18px]" />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#1e1f22] text-white border-[#3a3b3e] text-[12px] px-2 py-1">
              Thêm
            </TooltipContent>
          </Tooltip>
          
          <DropdownMenuContent align={isMe ? "end" : "start"} className="w-48 bg-[#1e1f22]/95 backdrop-blur-md border-[#3a3b3e] text-[#d1d1d1] p-1 shadow-2xl rounded-xl z-50">
            <DropdownMenuItem onClick={onReply} className="cursor-pointer hover:bg-[#2b2d31] focus:bg-[#2b2d31] py-2">
              <Reply className="w-4 h-4 mr-2 text-[#a1a1a1]" /> Trả lời
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onForward} className="cursor-pointer hover:bg-[#2b2d31] focus:bg-[#2b2d31] py-2">
              <Forward className="w-4 h-4 mr-2 text-[#a1a1a1]" /> Chuyển tiếp tin nhắn
            </DropdownMenuItem>
            {canPin && (
              <DropdownMenuItem onClick={onPin} className="cursor-pointer hover:bg-[#2b2d31] focus:bg-[#2b2d31] py-2">
                <Pin className="w-4 h-4 mr-2 text-[#a1a1a1]" /> {msg.isPinned ? "Bỏ ghim tin nhắn" : "Ghim tin nhắn"}
              </DropdownMenuItem>
            )}
            {msg.text && (
              <DropdownMenuItem onClick={onCopy} className="cursor-pointer hover:bg-[#2b2d31] focus:bg-[#2b2d31] py-2">
                <Copy className="w-4 h-4 mr-2 text-[#a1a1a1]" /> Sao chép tin nhắn
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onSelectMany} className="cursor-pointer hover:bg-[#2b2d31] focus:bg-[#2b2d31] py-2">
              <CheckSquare className="w-4 h-4 mr-2 text-[#a1a1a1]" /> Chọn nhiều
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDetails} className="cursor-pointer hover:bg-[#2b2d31] focus:bg-[#2b2d31] py-2">
              <Info className="w-4 h-4 mr-2 text-[#a1a1a1]" /> Xem chi tiết
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-[#3a3b3e]" />
            
            {isMe && (
              <DropdownMenuItem onClick={onRecall} className="cursor-pointer text-red-400 hover:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400 py-2">
                <RotateCcw className="w-4 h-4 mr-2" /> Thu hồi
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-red-400 hover:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400 py-2">
              <Trash2 className="w-4 h-4 mr-2" /> {isMe ? "Xóa chỉ ở phía tôi" : "Xóa"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    </div>
  )
}

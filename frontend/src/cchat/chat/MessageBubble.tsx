import { useState } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { Reply, Forward, Copy, Star, Info, Trash2, RotateCcw, MoreHorizontal } from "lucide-react"
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

export function MessageBubble(props: MessageBubbleProps & { hideHeader?: boolean }) {
  const { msg, onImageLoad, senderAvatar, senderName, isGroupChat, onReply, onForward, hideHeader } = props
  const { authUser } = useAuthStore()
  const senderId = typeof msg.senderId === "string" ? msg.senderId : msg.senderId?._id
  const isMe = senderId?.toString() === authUser?._id?.toString()
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const timeStr = new Date(msg.createdAt).toLocaleTimeString(undefined, {
    hour: "2-digit", minute: "2-digit",
  })

  const handleCopy = () => {
    if (msg.text) {
      navigator.clipboard.writeText(msg.text)
      toast.success("Đã sao chép tin nhắn")
    }
  }

  const handleStar = () => toast.success("Đã đánh dấu tin nhắn ⭐")
  const handleRecall = () => toast("Chức năng thu hồi đang phát triển")
  const handleDelete = () => toast("Chức năng xóa đang phát triển")

  return (
    <div
      className={`flex w-full mb-2 group ${isMe ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setShowQuickActions(true)}
      onMouseLeave={() => setShowQuickActions(false)}
    >
      {/* Avatar của người gửi */}
      {!isMe && (
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
      {isMe && (
        <QuickActionBar 
          msg={msg} 
          isMe={isMe} 
          show={showQuickActions || isDropdownOpen}
          onReply={() => onReply?.(msg)}
          onForward={() => onForward?.(msg)}
          onCopy={handleCopy}
          onStar={handleStar}
          onRecall={handleRecall}
          onDelete={handleDelete}
          onDropdownChange={setIsDropdownOpen}
        />
      )}

      {/* Bubble Chính */}
      <div className={`flex flex-col max-w-[70%] gap-1 ${isMe ? "items-end" : "items-start"}`}>
        {/* Tên người gửi (Chỉ hiển thị nếu là Group và là người khác nhắn) */}
        {!isMe && isGroupChat && senderName && !hideHeader && (
          <span className="text-[12px] font-semibold text-[#a1a1a1] ml-1 mb-0.5">{senderName}</span>
        )}

        {/* Ảnh */}
        {msg.image && (
          <div className="relative overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity border border-[#2b2d31]/50 shadow-sm">
            <img src={msg.image} alt="Message" className="max-h-[300px] max-w-full w-auto object-contain" onLoad={onImageLoad} />
            {!msg.text && (
              <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[11px] font-medium tracking-wide">
                {timeStr}
              </span>
            )}
          </div>
        )}

        {/* Text */}
        {msg.text && (
          <div className={`px-[16px] py-[10px] rounded-lg text-[15px] shadow-sm flex flex-col gap-1 cursor-default select-text
              ${isMe
                ? "bg-[#0052cc] text-white rounded-tr-md rounded-tl-md rounded-bl-md rounded-br-sm"
                : "bg-[#202124] text-[#e1e1e1] rounded-tr-md rounded-tl-md rounded-br-md rounded-bl-sm"
              }
            `}>
            <p className="leading-[1.4] whitespace-pre-wrap break-words">{msg.text}</p>
            <div className={`flex items-center justify-end gap-1 text-[11px] mt-0.5 ${isMe ? "text-blue-200" : "text-[#a1a1a1]"}`}>
              <span>{timeStr}</span>
              {isMe && <span>✓</span>}
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Bar (Tin của NGƯỜI KHÁC) */}
      {!isMe && (
        <QuickActionBar 
          msg={msg} 
          isMe={isMe} 
          show={showQuickActions || isDropdownOpen}
          onReply={() => onReply?.(msg)}
          onForward={() => onForward?.(msg)}
          onCopy={handleCopy}
          onStar={handleStar}
          onRecall={handleRecall}
          onDelete={handleDelete}
          onDropdownChange={setIsDropdownOpen}
        />
      )}
    </div>
  )
}

// === Component Thanh Nút Tương Tác ===
function QuickActionBar({ msg, isMe, show, onReply, onForward, onCopy, onStar, onRecall, onDelete, onDropdownChange }: any) {
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
          
          {/* Nghệ thuật: Pop-up menu bóng bẩy */}
          <DropdownMenuContent align={isMe ? "end" : "start"} className="w-48 bg-[#1e1f22]/95 backdrop-blur-md border-[#3a3b3e] text-[#d1d1d1] p-1 shadow-2xl rounded-xl">
            <DropdownMenuItem onClick={onReply} className="cursor-pointer hover:bg-[#2b2d31] focus:bg-[#2b2d31] py-2">
              <Reply className="w-4 h-4 mr-2 text-[#a1a1a1]" /> Trả lời
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onForward} className="cursor-pointer hover:bg-[#2b2d31] focus:bg-[#2b2d31] py-2">
              <Forward className="w-4 h-4 mr-2 text-[#a1a1a1]" /> Chuyển tiếp tin nhắn
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onStar} className="cursor-pointer hover:bg-[#2b2d31] focus:bg-[#2b2d31] py-2">
              <Star className="w-4 h-4 mr-2 text-[#a1a1a1]" /> Đánh dấu tin nhắn
            </DropdownMenuItem>
            {msg.text && (
              <DropdownMenuItem onClick={onCopy} className="cursor-pointer hover:bg-[#2b2d31] focus:bg-[#2b2d31] py-2">
                <Copy className="w-4 h-4 mr-2 text-[#a1a1a1]" /> Sao chép tin nhắn
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="cursor-pointer hover:bg-[#2b2d31] focus:bg-[#2b2d31] py-2">
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

import { useEffect, useRef, useState } from "react"
import { Phone, Video, PanelRightClose, PanelRightOpen, Smile, Send, Paperclip, Image as ImageIcon, FileText, Type, Maximize, Clock, ThumbsUp, X } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useChatStore } from "@/store/useChatStore"
import NoChatHistoryPlaceholder from "@/components/ui/NoChatHistoryPlaceholder"
import MessageLoadingSkeleton from "@/components/ui/MessageLoadingSkeleton"
import { MessageBubble } from "./MessageBubble"
import type { Message } from "./MessageBubble"

interface MainChatAreaProps {
  isRightSidebarOpen: boolean;
  onToggleRightSidebar: () => void;
}

export function MainChatArea({ isRightSidebarOpen, onToggleRightSidebar }: MainChatAreaProps) {
  const { selectedUser, getMessagesByUserId, messages, isMessagesLoading, sendMessage } = useChatStore()
  const { authUser } = useAuthStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    if (selectedUser) {
      setIsScrolled(false);
      getMessagesByUserId(selectedUser._id)
    }
  }, [selectedUser, getMessagesByUserId])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
      setIsScrolled(true)
    }, 100);
  }

  useEffect(() => {
    if (messagesEndRef.current && messages && !isMessagesLoading) {
      scrollToBottom()
    }
  }, [messages, isMessagesLoading])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    try {
      await sendMessage({ text: text.trim(), image: imagePreview });
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (!selectedUser) return null;

  return (
    <div className="flex flex-1 flex-col bg-[#131416] h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1e1f22] border-b border-[#2b2d31] shrink-0">
        <div className="flex items-center gap-3">
          <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullname} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h3 className="font-semibold text-white text-[16px] leading-tight flex items-center justify-start gap-2">
              {selectedUser.fullname}
              <span className="bg-amber-600/20 text-amber-500 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">BẠN BÈ</span>
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md transition-colors" title="Cuộc gọi thoại">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md transition-colors" title="Cuộc gọi video">
            <Video className="w-5 h-5" />
          </button>
          <div className="w-[1px] h-6 bg-[#2b2d31] mx-1"></div>
          <button onClick={onToggleRightSidebar} className="p-2 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md transition-colors" title="Thông tin hội thoại">
            {isRightSidebarOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
        {(isMessagesLoading || !isScrolled) && (
          <div className="absolute inset-0 z-10 bg-[#131416] p-6">
            <MessageLoadingSkeleton />
          </div>
        )}

        <div className={`flex flex-col transition-opacity duration-200 ${isScrolled ? "opacity-100" : "opacity-0"}`}>
          <div className="flex justify-center mb-6">
            <span className="bg-[#2b2d31] text-[#a1a1a1] text-[12px] px-3 py-1 rounded-full">
              11:00 11/04/2026
            </span>
          </div>

          {messages && messages.length > 0 ? (
            messages.map((msg: any) => (
              <MessageBubble key={msg._id} msg={msg} onImageLoad={scrollToBottom} />
            ))
          ) : (
            null
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-[#1e1f22] flex flex-col shrink-0">
        {/* Top Toolbar */}
        <div className="flex items-center px-2 py-2 gap-1 h-[40px]">
          <button className="p-1.5 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md"><Smile className="w-[18px] h-[18px]" /></button>

          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md">
            <ImageIcon className="w-[18px] h-[18px]" />
          </button>

          <button className="p-1.5 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md"><Paperclip className="w-[18px] h-[18px]" /></button>
          <button className="p-1.5 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md"><FileText className="w-[18px] h-[18px]" /></button>
          <button className="p-1.5 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md"><Type className="w-[18px] h-[18px]" /></button>
          <button className="p-1.5 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md"><Maximize className="w-[18px] h-[18px]" /></button>
          <button className="p-1.5 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md"><Clock className="w-[18px] h-[18px]" /></button>
        </div>

        {/* Input Area */}
        <div className="flex flex-col border-t border-[#2b2d31] relative">

          {/* Image Preview */}
          {imagePreview && (
            <div className="px-4 py-3 pb-0">
              <div className="relative inline-block mt-2">
                <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-md border border-[#2b2d31]" />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#2b2d31] flex items-center justify-center text-[#e1e1e1] hover:bg-red-500 hover:text-white transition-colors"
                  type="button"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex flex-row items-end pb-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder={`Nhập @, tin nhắn tới ${selectedUser.fullname}`}
              className="flex-1 bg-transparent text-[15px] text-white px-4 py-3 outline-none resize-none min-h-[44px] max-h-[120px] custom-scrollbar placeholder:text-[#a1a1a1]"
              rows={1}
            />
            <div className="flex items-center gap-1 pr-3 pb-0 shrink-0">
              <button type="button" className="p-1.5 text-[#ebaa16] hover:bg-[#2b2d31] rounded-md transition-colors">
                <ThumbsUp className="w-5 h-5" />
              </button>
              <button type="submit" disabled={!text.trim() && !imagePreview} className="p-1.5 text-[#0052cc] hover:bg-[#2b2d31] rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-transparent">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

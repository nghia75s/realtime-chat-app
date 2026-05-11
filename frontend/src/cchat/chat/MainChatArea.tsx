import { useEffect, useRef, useState } from "react"
import { Phone, Video, PanelRightClose, PanelRightOpen, Smile, Send, Paperclip, Image as ImageIcon, FileText, Type, Maximize, Clock, ThumbsUp, X, Reply } from "lucide-react"
import { useChatStore } from "@/store/useChatStore"
import { useAuthStore } from "@/store/useAuthStore"
import NoChatHistoryPlaceholder from "@/components/ui/NoChatHistoryPlaceholder"
import MessageLoadingSkeleton from "@/components/ui/MessageLoadingSkeleton"
import { MessageBubble } from "./MessageBubble"
import { toast } from "react-hot-toast"
interface MainChatAreaProps {
  isRightSidebarOpen: boolean;
  onToggleRightSidebar: () => void;
}

export function MainChatArea({ isRightSidebarOpen, onToggleRightSidebar }: MainChatAreaProps) {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages
  } = useChatStore()
  const { onlineUsers } = useAuthStore()
  
  // Dữ liệu Mock: Nếu đối tượng có thuộc tính isGroup thì coi như là Nhóm
  const isGroup = selectedUser?.isGroup || false
  const isOnline = selectedUser ? onlineUsers.includes(selectedUser._id) : false
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [replyingTo, setReplyingTo] = useState<any | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (selectedUser) {
      setIsScrolled(false);
      getMessagesByUserId(selectedUser._id);
      subscribeToMessages();
    }

    return () => {
      unsubscribeFromMessages();
    };
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages])

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
    const msgText = text.trim();
    const msgImg = imagePreview;

    setIsSending(true);
    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      await sendMessage({ text: msgText, image: msgImg });
    } catch (error) {
      console.error("Failed to send message:", error);
      setText(msgText);
      setImagePreview(msgImg);
    } finally {
      setIsSending(false);
    }
  }

  const handleReply = (msg: any) => {
    setReplyingTo(msg);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  const handleForward = (msg: any) => {
    if (msg.text) {
      navigator.clipboard.writeText(msg.text);
    }
    toast.success("Đã sao chép để chuyển tiếp!");
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
          <div className="relative">
            <img src={selectedUser.profilePicture || "/avatar.png"} alt={selectedUser.fullname} className="w-10 h-10 rounded-full object-cover" />
            {!isGroup && (
              <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#1e1f22] transition-colors ${
                isOnline ? "bg-green-500" : "bg-[#4e4f52]"
              }`} />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white text-[16px] leading-tight">
              {selectedUser.fullname}
            </h3>
            {isGroup ? (
              <p className="text-[12px] font-medium text-[#a1a1a1]">
                {selectedUser.memberCount || "12"} thành viên
              </p>
            ) : (
              <p className={`text-[12px] font-medium ${isOnline ? "text-green-500" : "text-[#a1a1a1]"}`}>
                {isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
              </p>
            )}
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
          {messages && messages.length > 0 ? (
            messages.map((msg: any) => (
              <MessageBubble
                key={msg._id}
                msg={msg}
                onImageLoad={scrollToBottom}
                senderAvatar={selectedUser?.profilePicture || "/avatar.png"}
                senderName={selectedUser?.fullname}
                isGroupChat={isGroup}
                onReply={handleReply}
                onForward={handleForward}
              />
            ))
          ) : (
            < NoChatHistoryPlaceholder name={selectedUser.fullname} />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-[#1e1f22] flex flex-col shrink-0">
        {/* Top Toolbar */}
        <div className="flex items-center px-2 py-2 gap-1 h-[40px]">
          <button disabled={isSending} className="p-1.5 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md disabled:opacity-50"><Smile className="w-[18px] h-[18px]" /></button>

          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
          <button disabled={isSending} onClick={() => fileInputRef.current?.click()} className="p-1.5 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md disabled:opacity-50">
            <ImageIcon className="w-[18px] h-[18px]" />
          </button>

          <button disabled={isSending} className="p-1.5 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md disabled:opacity-50"><Paperclip className="w-[18px] h-[18px]" /></button>
          <button disabled={isSending} className="p-1.5 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md disabled:opacity-50"><FileText className="w-[18px] h-[18px]" /></button>
          <button disabled={isSending} className="p-1.5 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md disabled:opacity-50"><Type className="w-[18px] h-[18px]" /></button>
          <button disabled={isSending} className="p-1.5 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md disabled:opacity-50"><Maximize className="w-[18px] h-[18px]" /></button>
          <button disabled={isSending} className="p-1.5 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md disabled:opacity-50"><Clock className="w-[18px] h-[18px]" /></button>
        </div>

        {/* Reply Preview Bar */}
        {replyingTo && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1c1e] border-t border-[#2b2d31] border-l-2 border-l-[#0052cc]">
            <Reply className="w-4 h-4 text-[#0052cc] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#0052cc] font-semibold mb-0.5">Trả lời tin nhắn</p>
              <p className="text-[12px] text-[#a1a1a1] truncate">
                {replyingTo.text || "[Hình ảnh]"}
              </p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 rounded-full hover:bg-[#2b2d31] text-[#717171] hover:text-white shrink-0 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
              ref={textareaRef}
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
              <button type="button" disabled={isSending} className="p-1.5 text-[#ebaa16] hover:bg-[#2b2d31] rounded-md transition-colors disabled:opacity-50">
                <ThumbsUp className="w-5 h-5" />
              </button>
              <button name="send" type="submit" disabled={(!text.trim() && !imagePreview) || isSending} className="p-1.5 text-[#0052cc] hover:bg-[#2b2d31] rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-transparent">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

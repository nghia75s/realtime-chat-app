import { useState, useRef } from "react"
import { Phone, Video, PanelRight, Search, Paperclip, Image as ImageIcon, Smile, Mic, FileText, UserPlus, MoreHorizontal, Download, Scissors, Type, AtSign } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { chatActions } from "../actions/chatActions"
import type { ChatItem } from "../data/mockData"
import { useAuthStore } from "@/store/useAuthStore"

export function MainChatArea({ chat, isRightPanelOpen = false, onToggleRightPanel }: { chat?: ChatItem, isRightPanelOpen?: boolean, onToggleRightPanel?: () => void }) {
  const [message, setMessage] = useState("")
  
  //update avatar
  const { authUser, updateProfile } = useAuthStore()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = async () => {
        const base64Image = reader.result as string
        setSelectedImage(base64Image)
        await updateProfile({ profilePicture: base64Image })
      }
    }

  }
  return (
    <div className="flex flex-1 flex-col bg-[#F3F4F6] min-h-0 min-w-0">
      {/* Chat Header */}
      <div className="flex h-[68px] items-center justify-between border-b border-zinc-200 bg-white px-5 shadow-sm z-10 shrink-0">
        {/* Avatar */}
        <div className="flex items-center gap-3">
          <Avatar className="h-[42px] w-[42px] border border-zinc-200">
            <AvatarImage src={chat?.avatar || "/avatars/01.png"} className="object-cover" />
            <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold text-sm">
              {chat?.fallback || "TD"}
            </AvatarFallback>
          </Avatar>
          {/* Name and Online Status */}
          <div className="flex flex-col">
            <h2 className="text-[16px] font-bold text-zinc-900 leading-tight mb-[2px]">{chat?.name || "Team Design"}</h2>
            <div className="flex items-center gap-2">
              {chat?.isOnline ? (
                <>
                  <span className="flex h-2 w-2 rounded-full bg-purple-500"></span>
                  <p className="text-[13px] text-zinc-500 leading-none">Online</p>
                </>
              ) : (
                <>
                <span className="flex h-2 w-2 rounded-full bg-gray-500"></span>
                <p className="text-[13px] text-zinc-500 leading-none">Offline</p>
                </>
              )}
            </div>
          </div>
        </div>
        {/*  */}
        <div className="flex items-center gap-1.5 text-zinc-600">
          <button className="flex h-[36px] w-[36px] items-center justify-center rounded-md hover:bg-zinc-100 transition-colors" title="Thêm bạn vào nhóm">
            <UserPlus className="h-[20px] w-[20px]" />
          </button>
          <button className="flex h-[36px] w-[36px] items-center justify-center rounded-md hover:bg-zinc-100 transition-colors" title="Tìm kiếm tin nhắn">
            <Search className="h-[20px] w-[20px]" />
          </button>
          <button className="flex h-[36px] w-[36px] items-center justify-center rounded-md hover:bg-zinc-100 transition-colors" title="Cuộc gọi thoại">
            <Phone className="h-[20px] w-[20px]" />
          </button>
          <button className="flex h-[36px] w-[36px] items-center justify-center rounded-md hover:bg-zinc-100 transition-colors" title="Cuộc gọi video">
            <Video className="h-[20px] w-[20px]" />
          </button>
          <div className="w-[1px] h-[20px] bg-zinc-200 mx-1"></div>
          <button 
            onClick={onToggleRightPanel}
            className={`flex h-[36px] w-[36px] items-center justify-center rounded-md transition-colors ${isRightPanelOpen ? 'bg-[#ede9fe]' : 'hover:bg-zinc-100'}`} 
            title="Thông tin hội thoại"
          >
            <PanelRight className={`h-[20px] w-[20px] ${isRightPanelOpen ? 'text-[#7c3aed]' : 'text-zinc-600'}`} />
          </button>
        </div>
      </div>

      {/* Main Chat Content */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 custom-scrollbar">
        <div className="mx-auto flex w-full flex-col gap-4">
          
          {/* System Date Message */}
          <div className="flex justify-center my-1">
             <span className="bg-zinc-200/60 text-zinc-500 px-3 py-1 rounded-full text-[12px] font-medium">
                T7 21/03/2026
             </span>
          </div>

          {/* System Pinned Message */}
          <div className="flex justify-center my-1">
             <span className="bg-zinc-200/60 text-zinc-500 px-3 py-1 rounded-full text-[12px] font-medium">
                Jessie Rollins đã ghim 1 tin nhắn
             </span>
          </div>

          {/* Partner Message 1 - Text */}
          <div className="flex gap-3 max-w-[70%]">
            <Avatar className="h-10 w-10 mt-0.5 shrink-0 border border-zinc-200">
              <AvatarImage src="https://i.pravatar.cc/150?u=jasmin" />
              <AvatarFallback>JL</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 items-start min-w-0">
              <span className="text-[13px] text-zinc-500 ml-1">Jasmin Lowery</span>
              <div className="rounded-lg rounded-tl-none bg-white p-3 shadow-sm w-full border border-zinc-100/50 group relative">
                <p className="text-[15px] leading-relaxed text-zinc-800 whitespace-pre-wrap">
                  Mọi người check file thiết kế mới nhé. Mình vừa cập nhật thêm một số components cho phần Chat Area.
                </p>
                <div className="mt-1 flex items-center justify-end gap-2 text-[11px] text-zinc-400">
                  <span>09:20</span>
                </div>
                {/* Message Actions */}
                <div className="absolute top-1/2 -translate-y-1/2 -right-[40px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                   <button className="p-1 rounded-full hover:bg-zinc-200 text-zinc-500"><MoreHorizontal className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Self Message - Text */}
          <div className="flex justify-end mt-2">
            <div className="flex flex-col items-end gap-1 max-w-[70%] min-w-0">
              <div className="rounded-lg rounded-tr-none bg-[#ede9fe] p-3 shadow-sm w-full border border-purple-100 group relative">
                <div className="absolute top-1/2 -translate-y-1/2 -left-[40px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                   <button className="p-1 text-zinc-500 hover:bg-zinc-200 rounded-full"><MoreHorizontal className="h-4 w-4" /></button>
                </div>
                <p className="text-[15px] leading-relaxed text-zinc-900 whitespace-pre-wrap">
                  Ok bồ, file này dung lượng lớn không?
                </p>
                <div className="mt-1 flex items-center justify-end gap-2 text-[11px] text-[#7c3aed]/70">
                  <span>09:24</span>
                </div>
              </div>
            </div>
          </div>

          {/* Partner Message 2 - File attached */}
          <div className="flex gap-3 max-w-[70%] mt-2">
            <Avatar className="h-10 w-10 mt-0.5 shrink-0 border border-zinc-200">
              <AvatarImage src="https://i.pravatar.cc/150?u=jasmin" />
              <AvatarFallback>JL</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 items-start min-w-0">
              <span className="text-[13px] text-zinc-500 ml-1">Jasmin Lowery</span>
              <div className="rounded-lg rounded-tl-none bg-white p-3 shadow-sm w-full border border-zinc-100/50 group relative">
                {/* File Attachment Bubble */}
                <div className="flex items-center gap-4 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                   <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 font-bold text-[12px] uppercase">
                     PDF
                   </div>
                   <div className="flex flex-col min-w-0 flex-1">
                     <span className="truncate text-[15px] font-medium text-zinc-800 leading-tight">Zalo_Web_UI_Design.pdf</span>
                     <span className="text-[12px] text-zinc-500">2.4 MB</span>
                   </div>
                   <button className="flex shrink-0 h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 transition-colors">
                     <Download className="h-4 w-4" />
                   </button>
                </div>

                <div className="mt-1 flex items-center justify-end gap-2 text-[11px] text-zinc-400">
                  <span>09:25</span>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 -right-[40px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                   <button className="p-1 rounded-full hover:bg-zinc-200 text-zinc-500"><MoreHorizontal className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* System Date Message */}
          <div className="flex justify-center my-2">
             <span className="bg-zinc-200/60 text-zinc-500 px-3 py-1 rounded-full text-[12px] font-medium">
                Hôm nay
             </span>
          </div>

          {/* Partner Message 3 - Multiple Images Grid */}
          <div className="flex gap-3 max-w-[70%] mt-2">
            <Avatar className="h-10 w-10 mt-0.5 shrink-0 border border-zinc-200">
              <AvatarImage src="https://i.pravatar.cc/150?u=a" />
              <AvatarFallback>NA</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 items-start min-w-0">
              <span className="text-[13px] text-zinc-500 ml-1">Nguyễn Văn A</span>
              <div className="rounded-lg rounded-tl-none overflow-hidden shadow-sm bg-white border border-zinc-100 p-1 group relative">
                
                {/* 2x2 Grid using CSS Grid */}
                <div className="grid grid-cols-2 gap-1 w-[320px]">
                  <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200" alt="Attachment" className="w-full aspect-square object-cover rounded-tl-md transition-opacity hover:opacity-90 cursor-pointer" />
                  <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=200" alt="Attachment" className="w-full aspect-square object-cover rounded-tr-md transition-opacity hover:opacity-90 cursor-pointer" />
                  <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=200" alt="Attachment" className="w-full aspect-square object-cover rounded-bl-md transition-opacity hover:opacity-90 cursor-pointer" />
                  <div className="relative w-full aspect-square bg-zinc-100 rounded-br-md overflow-hidden cursor-pointer group/img">
                    <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=200" alt="Attachment" className="w-full h-full object-cover transition-opacity group-hover/img:opacity-80" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-lg">
                      +4
                    </div>
                  </div>
                </div>

                <div className="mt-1 flex items-center justify-end px-1 gap-2 text-[11px] text-zinc-400">
                  <span>09:30</span>
                </div>
                
                <div className="absolute top-1/2 -translate-y-1/2 -right-[40px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                   <button className="p-1 rounded-full hover:bg-zinc-200 text-zinc-500"><MoreHorizontal className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Chat Input */}
      <div className="flex flex-col bg-white border-t border-zinc-200 shrink-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-100 overflow-x-auto no-scrollbar">
          <button className="flex p-1.5 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 transition-colors" title="Nhãn dán">
            <Smile className="h-[20px] w-[20px]" strokeWidth={1.5} />
          </button>
          <button className="flex p-1.5 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 transition-colors" title="Gửi hình ảnh">
            <ImageIcon className="h-[20px] w-[20px]" strokeWidth={1.5} />
          </button>
          <button className="flex p-1.5 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 transition-colors" title="Đính kèm file">
            <Paperclip className="h-[20px] w-[20px]" strokeWidth={1.5} />
          </button>
          <button className="flex p-1.5 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 transition-colors" title="Chụp màn hình kèm cửa sổ Zalo">
            <Scissors className="h-[20px] w-[20px]" strokeWidth={1.5} />
          </button>
          
          <div className="w-[1px] h-[16px] bg-zinc-200 mx-1"></div>
          
          <button className="flex p-1.5 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 transition-colors" title="Định dạng văn bản">
            <Type className="h-[20px] w-[20px]" strokeWidth={1.5} />
          </button>
          <button className="flex p-1.5 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 transition-colors" title="Đánh dấu nhắc tên">
            <AtSign className="h-[20px] w-[20px]" strokeWidth={1.5} />
          </button>
          <button className="flex p-1.5 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 transition-colors" title="Giao việc">
             <FileText className="h-[20px] w-[20px]" strokeWidth={1.5} />
          </button>
        </div>
        
        {/* Input Text Area */}
        <div className="flex items-end gap-3 px-4 pt-3 pb-[24px]">
          <div className="flex-1 bg-white border border-zinc-200 rounded-md shadow-sm flex items-center px-1">
             <textarea
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault()
                   chatActions.sendMessage(message, setMessage)
                 }
               }}
               placeholder={`Nhập tin nhắn tới ${chat?.name || "Team Design"}`}
               className="flex-1 max-h-[140px] min-h-[44px] bg-transparent text-[15px] outline-none resize-none overflow-y-auto w-full text-zinc-900 placeholder:text-zinc-400 py-[10px] px-3 border-none custom-scrollbar"
               rows={1}
             />
             <button className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors shrink-0 mx-1 relative group">
               <Mic className="h-5 w-5" />
             </button>
          </div>
          <button 
            onClick={() => chatActions.sendMessage(message, setMessage)}
            className="flex h-[44px] items-center justify-center rounded-md bg-[#ede9fe] text-[#7c3aed] px-5 font-bold text-[15px] transition-colors hover:bg-purple-100 shadow-sm shrink-0 mb-[1px]"
          >
            GỬI
          </button>
        </div>
      </div>
    </div>
  )
}



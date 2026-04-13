import { useAuthStore } from "@/store/useAuthStore"

export interface Message {
  _id: string;
  senderId: string;
  text?: string;
  image?: string;
  createdAt: string;
}

export function MessageBubble({ msg, onImageLoad }: { msg: Message, onImageLoad?: () => void }) {
  const { authUser } = useAuthStore()
  const isMe = msg.senderId === authUser?._id
  
  const timeStr = new Date(msg.createdAt).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className={`flex w-full mb-3 ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`flex flex-col max-w-[70%] gap-1 ${isMe ? "items-end" : "items-start"}`}>
        
        {/* Chỉ hiển thị hình ảnh (không có padding box) */}
        {msg.image && (
          <div className="relative group overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity border border-[#2b2d31]/50 shadow-sm">
            <img src={msg.image} alt="Message" className="max-h-[300px] max-w-full w-auto object-contain" onLoad={onImageLoad} />
            
            {/* Nếu chỉ có ảnh, không có text thì hiện giờ lên góc ảnh */}
            {!msg.text && (
              <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[11px] font-medium tracking-wide">
                {timeStr}
              </span>
            )}
          </div>
        )}

        {/* Khung chat chữ */}
        {msg.text && (
          <div 
            className={`px-[16px] py-[10px] rounded-lg text-[15px] shadow-sm flex flex-col gap-1
              ${isMe 
                ? "bg-[#0052cc] text-white rounded-tr-md rounded-tl-md rounded-bl-md rounded-br-sm" 
                : "bg-[#202124] text-[#e1e1e1] rounded-tr-md rounded-tl-md rounded-br-md rounded-bl-sm"
              }
            `}
          >
            <p className="leading-[1.4] whitespace-pre-wrap">{msg.text}</p>
            <div className={`flex items-center justify-end gap-1 text-[11px] mt-0.5 ${isMe ? "text-blue-200" : "text-[#a1a1a1]"}`}>
               <span>{timeStr}</span>
               {isMe && <span>✓</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from "react";
import { Pin, ChevronDown, ChevronUp } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";

export function PinnedMessageBar() {
  const { pinnedMessages, pinMessage } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!pinnedMessages || pinnedMessages.length === 0) return null;

  const handleUnpin = async (e: React.MouseEvent, msgId: string) => {
    e.stopPropagation();
    try {
      await pinMessage(msgId);
    } catch (error) {
      // handled
    }
  };

  const renderMessageContent = (msg: any) => {
    if (msg.messageType === "document") return `[Đơn] ${msg.documentPayload?.templateName || "Tài liệu"}`;
    if (msg.messageType === "task_assignment") return `[Task] ${msg.taskPayload?.title || "Công việc"}`;
    if (msg.image && !msg.text) return "[Hình ảnh]";
    return msg.text;
  };

  const topMessage = pinnedMessages[0];

  return (
    <div className="relative z-10 w-full bg-[#1e1f22] border-b border-[#2b2d31]">
      <div 
        className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-[#2b2d31]/50 transition-colors"
        onClick={() => pinnedMessages.length > 1 && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          <div className="w-6 h-6 rounded-full bg-[#0052cc]/20 flex items-center justify-center shrink-0">
            <Pin className="w-3.5 h-3.5 text-[#0052cc]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-medium text-[#0052cc]">
              {pinnedMessages.length === 1 ? "Tin nhắn ghim" : `${pinnedMessages.length} tin nhắn ghim`}
            </span>
            <span className="text-[12px] text-[#a1a1a1] truncate">
              <span className="font-medium mr-1">{topMessage.senderId?.fullname}:</span>
              {renderMessageContent(topMessage)}
            </span>
          </div>
        </div>
        
        {pinnedMessages.length === 1 ? (
          <button 
            onClick={(e) => handleUnpin(e, topMessage._id)}
            className="text-[12px] text-[#a1a1a1] hover:text-white px-2 py-1 rounded hover:bg-[#3a3b3e] transition-colors"
          >
            Bỏ ghim
          </button>
        ) : (
          <div className="shrink-0 ml-2">
            {isOpen ? <ChevronUp className="w-4 h-4 text-[#a1a1a1]" /> : <ChevronDown className="w-4 h-4 text-[#a1a1a1]" />}
          </div>
        )}
      </div>

      {isOpen && pinnedMessages.length > 1 && (
        <div className="absolute top-full left-0 w-full bg-[#1e1f22] border-b border-[#2b2d31] shadow-xl max-h-[300px] overflow-y-auto z-50">
          {pinnedMessages.map((msg: any) => (
            <div key={msg._id} className="flex items-center justify-between px-4 py-3 hover:bg-[#2b2d31] border-t border-[#2b2d31]/50 cursor-pointer transition-colors group">
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-medium text-[#e1e1e1]">{msg.senderId?.fullname}</span>
                  <span className="text-[11px] text-[#a1a1a1]">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-[12.5px] text-[#a1a1a1] truncate">
                  {renderMessageContent(msg)}
                </span>
                <span className="text-[10px] text-[#818181] mt-1">
                  Được ghim bởi: {msg.pinnedBy?.fullname || "Người dùng"}
                </span>
              </div>
              <button 
                onClick={(e) => handleUnpin(e, msg._id)}
                className="text-[12px] text-red-400 opacity-0 group-hover:opacity-100 px-2 py-1.5 rounded hover:bg-red-500/10 transition-all ml-4 shrink-0"
              >
                Bỏ ghim
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

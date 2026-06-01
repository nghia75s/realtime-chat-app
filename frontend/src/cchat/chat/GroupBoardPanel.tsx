import { useState, useMemo } from "react";
import { ArrowLeft, Pin, FileText, BarChart2, Plus } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDate } from "@/lib/formatTime";
import { CreateNoteModal } from "./modals/CreateNoteModal";
import { CreatePollModal } from "./modals/CreatePollModal";
import { NoteMessageCard } from "./NoteMessageCard";
import { PollMessageCard } from "./PollMessageCard";

export function GroupBoardPanel({ chat, onBack }: { chat: any; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"all" | "pinned" | "notes" | "polls">("all");
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);

  const { messages, pinnedMessages } = useChatStore();

  // Filter items
  const boardItems = useMemo(() => {
    // Collect all unique messages that are either pinned, note, or poll
    const itemMap = new Map();

    messages.forEach((msg) => {
      if (msg.isPinned || msg.messageType === "note" || msg.messageType === "poll") {
        itemMap.set(msg._id, msg);
      }
    });

    pinnedMessages.forEach((msg) => {
      itemMap.set(msg._id, msg);
    });

    const items = Array.from(itemMap.values());
    // Sort descending by creation date
    items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return items;
  }, [messages, pinnedMessages]);

  const filteredItems = useMemo(() => {
    switch (activeTab) {
      case "pinned":
        return boardItems.filter((msg) => msg.isPinned);
      case "notes":
        return boardItems.filter((msg) => msg.messageType === "note");
      case "polls":
        return boardItems.filter((msg) => msg.messageType === "poll");
      case "all":
      default:
        return boardItems;
    }
  }, [boardItems, activeTab]);

  const { authUser } = useAuthStore();
  const isManager = authUser?._id === (typeof chat.createdBy === "string" ? chat.createdBy : chat.createdBy?._id) || chat.admins?.some((adminId: any) => 
    (typeof adminId === "string" ? adminId : adminId._id) === authUser?._id
  );
  const permissions = chat.settings?.memberPermissions || {};
  const canCreateNote = isManager || permissions.createNotes !== false;
  const canCreatePoll = isManager || permissions.createPolls !== false;

  return (
    <div className="flex w-[340px] shrink-0 flex-col border-l border-chat-border h-full overflow-hidden text-chat-text" style={{ background: 'var(--chat-bg-sidebar)' }}>
      <div className="flex h-[65px] items-center border-b border-chat-border px-4 py-[14px] shrink-0 font-medium text-[16px] text-chat-text" style={{ background: 'var(--chat-bg-sidebar)' }}>
        <button
          onClick={onBack}
          className="mr-3 text-chat-muted hover:text-chat-text transition-colors p-1 -ml-1 rounded-full hover:bg-chat-hover"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        Bảng tin nhóm
      </div>

      <div className="flex border-b border-chat-border px-4 pt-2">
        <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")}>Tất cả</TabButton>
        <TabButton active={activeTab === "pinned"} onClick={() => setActiveTab("pinned")}>Tin ghim</TabButton>
        <TabButton active={activeTab === "notes"} onClick={() => setActiveTab("notes")}>Ghi chú</TabButton>
        <TabButton active={activeTab === "polls"} onClick={() => setActiveTab("polls")}>Bình chọn</TabButton>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar p-4" style={{ background: 'var(--chat-bg-main)' }}>
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-chat-muted">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <p>Chưa có nội dung nào trong mục này.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredItems.map((item) => (
              <div key={item._id} className="rounded-lg p-3 border border-chat-border shadow-sm" style={{ background: 'var(--chat-bg-sidebar)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={item.senderId?.profilePicture || "/avatar.png"}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="font-semibold text-sm text-chat-text">{item.senderId?.fullname || "Người dùng"}</span>
                  <span className="text-xs text-chat-muted">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                
                {/* Render specific component based on type */}
                {item.messageType === "note" ? (
                   <NoteMessageCard message={item} />
                ) : item.messageType === "poll" ? (
                   <PollMessageCard message={item} />
                ) : (
                   <div className="text-sm text-chat-text break-words">
                     {item.isPinned && <Pin className="w-3 h-3 inline mr-1 text-[#1877F2]" />}
                     {item.text || "Tin nhắn đính kèm..."}
                   </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons at the bottom for Notes and Polls */}
      {(activeTab === "notes" || activeTab === "all" || activeTab === "polls") && (canCreateNote || canCreatePoll) && (
        <div className="p-4 border-t border-chat-border flex gap-2 shrink-0" style={{ background: 'var(--chat-bg-sidebar)' }}>
          {(activeTab === "notes" || activeTab === "all") && canCreateNote && (
            <button
              onClick={() => setIsCreateNoteOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-chat-hover hover:bg-chat-active/30 text-chat-text py-2 rounded-md font-medium text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tạo ghi chú
            </button>
          )}
          {(activeTab === "polls" || activeTab === "all") && canCreatePoll && (
            <button
              onClick={() => setIsCreatePollOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white py-2 rounded-md font-medium text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tạo bình chọn
            </button>
          )}
        </div>
      )}

      <CreateNoteModal
        isOpen={isCreateNoteOpen}
        onClose={() => setIsCreateNoteOpen(false)}
        groupId={chat._id}
      />
      
      <CreatePollModal
        isOpen={isCreatePollOpen}
        onClose={() => setIsCreatePollOpen(false)}
        groupId={chat._id}
      />
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`pb-2 px-1 text-[14px] font-medium transition-colors border-b-2 whitespace-nowrap flex-1 text-center ${
        active
          ? "border-[#0052cc] text-[#0052cc]"
          : "border-transparent text-chat-muted hover:text-chat-text"
      }`}
    >
      {children}
    </button>
  );
}

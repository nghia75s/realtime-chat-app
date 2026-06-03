import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { useMessageActionStore } from "@/store/useMessageActionStore"
import { useChatStore } from "@/store/useChatStore"
import { Search, X, MessageSquare } from "lucide-react"

export function ForwardMessageModal() {
  const { isForwardModalOpen, closeForwardModal, forwardMessages, clearSelection } = useMessageActionStore()
  const { selectedUser, chats, groups, allContacts, getAllcontacts, getMyChatPartners, getMyGroups, forwardMessage } = useChatStore()

  const [activeTab, setActiveTab] = useState<"recent" | "groups" | "friends">("recent")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [noteText, setNoteText] = useState("")
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (isForwardModalOpen) {
      setSelectedIds([])
      setSearchQuery("")
      setNoteText("")
      setActiveTab("recent")
      getAllcontacts()
      getMyChatPartners()
      getMyGroups()
    }
  }, [isForwardModalOpen, getAllcontacts, getMyChatPartners, getMyGroups])

  // Get a unified list of all targets across all tabs for metadata lookup
  const currentTargetId = selectedUser?._id

  const allPossibleTargets = useMemo(() => {
    const list: Array<{ id: string; name: string; avatar: string; type: "user" | "group" }> = [];
    const addedIds = new Set<string>();

    chats.forEach(c => {
      if (c._id !== currentTargetId && !addedIds.has(c._id)) {
        addedIds.add(c._id);
        list.push({ id: c._id, name: c.fullname, avatar: c.profilePicture, type: "user" });
      }
    });

    groups.forEach(g => {
      if (g._id !== currentTargetId && !addedIds.has(g._id)) {
        addedIds.add(g._id);
        list.push({ id: g._id, name: g.name, avatar: g.groupPicture, type: "group" });
      }
    });

    allContacts.forEach(c => {
      if (c._id !== currentTargetId && !addedIds.has(c._id)) {
        addedIds.add(c._id);
        list.push({ id: c._id, name: c.fullname, avatar: c.profilePicture, type: "user" });
      }
    });

    return list;
  }, [chats, groups, allContacts, currentTargetId]);

  // Get filtered targets list based on active tab
  const targets = useMemo(() => {
    if (activeTab === "recent") {
      return [
        ...chats
          .filter(c => c._id !== currentTargetId)
          .map(c => ({ id: c._id, name: c.fullname, avatar: c.profilePicture, type: "user" as const })),
        ...groups
          .filter(g => g._id !== currentTargetId)
          .map(g => ({ id: g._id, name: g.name, avatar: g.groupPicture, type: "group" as const }))
      ];
    } else if (activeTab === "groups") {
      return groups
        .filter(g => g._id !== currentTargetId)
        .map(g => ({ id: g._id, name: g.name, avatar: g.groupPicture, type: "group" as const }));
    } else {
      return allContacts
        .filter(c => c._id !== currentTargetId)
        .map(c => ({ id: c._id, name: c.fullname, avatar: c.profilePicture, type: "user" as const }));
    }
  }, [activeTab, chats, groups, allContacts, currentTargetId])

  const filteredTargets = useMemo(() => {
    return targets.filter(t => t.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [targets, searchQuery])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleClearSelected = () => {
    setSelectedIds([])
  }

  const handleForward = async () => {
    if (selectedIds.length === 0 || !forwardMessages || forwardMessages.length === 0) return
    setIsSending(true)
    try {
      for (const msg of forwardMessages) {
        await forwardMessage(msg._id, selectedIds, noteText)
      }
      closeForwardModal()
      clearSelection()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSending(false)
    }
  }

  // Generate sharing message preview texts
  const sharePreviewText = useMemo(() => {
    if (!forwardMessages || forwardMessages.length === 0) return ""
    if (forwardMessages.length === 1) {
      if (forwardMessages[0].file) return `[File] ${forwardMessages[0].file.name || "Đính kèm"}`
      return forwardMessages[0].text || "[Hình ảnh]"
    }
    return `${forwardMessages.length} tin nhắn`
  }, [forwardMessages])

  if (!isForwardModalOpen) return null

  return (
    <Dialog open={isForwardModalOpen} onOpenChange={closeForwardModal}>
      <DialogContent 
        className="bg-chat-sidebar border border-chat-border text-chat-text !w-[500px] !max-w-[600vw] rounded-2xl p-0 overflow-hidden flex flex-col h-[650px] shadow-2xl animate-in zoom-in-95 duration-200"
        showCloseButton={false}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-chat-border flex-shrink-0">
          <h2 className="text-chat-text text-lg font-bold">Chia sẻ</h2>
          <button onClick={closeForwardModal} className="text-chat-muted hover:text-chat-text transition-colors p-1.5 hover:bg-chat-hover rounded-full flex items-center justify-center">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 py-3 bg-chat-main border-b border-chat-border flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-chat-muted" />
            <input
              type="text"
              placeholder="Tìm kiếm hội thoại..."
              className="w-full bg-chat-sidebar border border-chat-border rounded-xl pl-10 pr-4 py-2 text-[14px] text-chat-text focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-transparent transition-all placeholder:text-chat-muted"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-chat-border px-6 bg-chat-sidebar flex-shrink-0">
          <div className="flex gap-6 text-[14px] font-semibold">
            <button
              onClick={() => setActiveTab("recent")}
              className={`py-3 relative transition-all ${activeTab === "recent" ? "text-[#1877F2]" : "text-chat-muted hover:text-chat-text"}`}
            >
              Gần đây
              {activeTab === "recent" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1877F2]" />}
            </button>
            <button
              onClick={() => setActiveTab("groups")}
              className={`py-3 relative transition-all ${activeTab === "groups" ? "text-[#1877F2]" : "text-chat-muted hover:text-chat-text"}`}
            >
              Nhóm trò chuyện
              {activeTab === "groups" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1877F2]" />}
            </button>
            <button
              onClick={() => setActiveTab("friends")}
              className={`py-3 relative transition-all ${activeTab === "friends" ? "text-[#1877F2]" : "text-chat-muted hover:text-chat-text"}`}
            >
              Bạn bè
              {activeTab === "friends" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1877F2]" />}
            </button>
          </div>
        </div>

        {/* Dynamic Two-Column Split Layout */}
        <div className="flex flex-1 min-h-0 bg-chat-main">

          {/* Left Column: All Targets Selection */}
          <div className={`${selectedIds.length > 0 ? "w-[60%]" : "w-full"} flex flex-col ${selectedIds.length > 0 ? "border-r border-chat-border" : ""} h-full overflow-hidden transition-all duration-300`}>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-1">
              {filteredTargets.length > 0 ? (
                filteredTargets.map(target => {
                  const isChecked = selectedIds.includes(target.id);
                  return (
                    <div
                      key={target.id}
                      className="flex items-center gap-3.5 px-3.5 py-3 hover:bg-chat-hover rounded-xl cursor-pointer transition-colors group"
                      onClick={() => toggleSelect(target.id)}
                    >
                      {/* Checkbox (Circular shape) */}
                      <div className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isChecked ? "bg-[#1877F2] border-[#1877F2]" : "border-chat-border group-hover:border-chat-muted"
                        }`}>
                        {isChecked && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3.5 h-3.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>

                      <img
                        src={target.avatar || (target.type === "group" ? "/group.png" : "/avatar.png")}
                        alt={target.name}
                        className="w-10 h-10 rounded-full object-cover border border-chat-border shrink-0"
                      />

                      <span className="text-chat-text text-[15px] font-medium truncate flex-1">{target.name}</span>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-chat-muted text-[14px]">Không tìm thấy kết quả nào</div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Targets (Slides in when selectedCount > 0) */}
          {selectedIds.length > 0 && (
            <div className="w-[40%] flex flex-col bg-chat-sidebar h-full overflow-hidden animate-in slide-in-from-right-5 duration-200">
              {/* Header: Selected Count + Clear All */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-chat-border flex-shrink-0">
                <span className="text-[13.5px] font-bold text-chat-text">
                  Đã chọn: <span className="text-[#1877F2]">{selectedIds.length}/100</span>
                </span>
                <button
                  onClick={handleClearSelected}
                  className="text-[13px] font-bold text-[#EF4444] hover:text-[#DC2626] transition-colors"
                >
                  Xóa tất cả
                </button>
              </div>

              {/* Selected Targets List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2.5 flex flex-col gap-1 bg-chat-sidebar">
                {selectedIds.map(id => {
                  const target = allPossibleTargets.find(t => t.id === id);
                  if (!target) return null;
                  const name = target.name || id;
                  const avatar = target.avatar || (target.type === "group" ? "/group.png" : "/avatar.png");

                  return (
                    <div
                      key={id}
                      className="flex items-center gap-3 px-3.5 py-2.5 bg-chat-main hover:bg-chat-hover rounded-xl group transition-colors justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={avatar || "/avatar.png"}
                          alt={name}
                          className="w-8 h-8 rounded-full object-cover border border-chat-border shrink-0"
                        />
                        <span className="text-chat-text text-[14.5px] font-medium truncate">{name}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelect(id); }}
                        className="text-chat-muted hover:text-chat-text p-1 rounded-full hover:bg-chat-main transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Area with Preview Box & Message Input */}
        <div className="flex-shrink-0 bg-chat-sidebar border-t border-chat-border p-5 flex flex-col gap-4">

          {/* Messages count preview box */}
          {forwardMessages && forwardMessages.length > 0 && (
            <div className="bg-chat-main border border-chat-border rounded-xl p-3.5 flex flex-col gap-1.5 text-[14px]">
              <div className="flex items-center gap-2 text-chat-muted text-[12px] font-bold uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-[#1877F2]" />
                <span>Chia sẻ tin nhắn</span>
              </div>
              <p className="text-chat-text font-semibold line-clamp-1 truncate opacity-90">{sharePreviewText}</p>
            </div>
          )}

          {/* Accompanying Message Input */}
          <input
            type="text"
            placeholder="Nhập lời nhắn..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="w-full bg-chat-main border border-chat-border rounded-xl px-4 py-2.5 text-[14px] text-chat-text focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-transparent transition-all placeholder:text-chat-muted"
          />

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-1">
            <DialogClose asChild>
              <button className="px-5 py-2.5 bg-chat-hover hover:bg-chat-hover/80 text-chat-text rounded-xl transition-all text-[14px] font-bold">
                Hủy
              </button>
            </DialogClose>

            <button
              onClick={handleForward}
              disabled={selectedIds.length === 0 || isSending}
              className="flex items-center justify-center min-w-[110px] px-6 py-2.5 bg-[#1877F2] hover:bg-[#166FE5] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all text-[14px] font-bold shadow-md shadow-[#1877F2]/10"
            >
              {isSending ? "Đang gửi..." : "Chia sẻ"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

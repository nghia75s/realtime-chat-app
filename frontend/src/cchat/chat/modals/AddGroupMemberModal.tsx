import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useChatStore } from "@/store/useChatStore"
import { Search, X, Users } from "lucide-react"
import { toast } from "react-hot-toast"

interface AddGroupMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  currentMembers: string[];
}

export function AddGroupMemberModal({ isOpen, onClose, groupId, currentMembers }: AddGroupMemberModalProps) {
  const { allContacts, getAllcontacts, addGroupMember, setSelectedUser, selectedUser } = useChatStore()

  const [activeTab, setActiveTab] = useState<"friends" | "recent">("friends")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSelectedIds([])
      setSearchQuery("")
      setActiveTab("friends")
      // Luôn gọi lấy danh sách khi mở modal để đảm bảo data mới nhất
      getAllcontacts()
    }
  }, [isOpen, getAllcontacts])

  // Get a unified list of all targets 
  const allPossibleTargets = useMemo(() => {
    const list: Array<{ id: string; name: string; avatar: string }> = [];
    const addedIds = new Set<string>();
    
    // Đảm bảo so sánh chính xác ID dạng chuỗi
    const currentMemberSet = new Set(currentMembers.map(id => id?.toString()));

    allContacts.forEach(c => {
      const contactId = c._id?.toString();
      // Bỏ qua những người đã ở trong nhóm
      if (contactId && !addedIds.has(contactId) && !currentMemberSet.has(contactId)) {
        addedIds.add(contactId);
        list.push({ id: contactId, name: c.fullname, avatar: c.profilePicture });
      }
    });

    console.log("=== THÊM THÀNH VIÊN DEBUG ===");
    console.log("Danh sách All Contacts:", allContacts);
    console.log("Thành viên hiện tại (currentMembers):", Array.from(currentMemberSet));
    console.log("Danh sách có thể thêm (list):", list);
    console.log("===============================");

    return list;
  }, [allContacts, currentMembers]);

  const filteredTargets = useMemo(() => {
    return allPossibleTargets.filter(t => t.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [allPossibleTargets, searchQuery])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleClearSelected = () => {
    setSelectedIds([])
  }

  const handleAddMembers = async () => {
    if (selectedIds.length === 0) return
    setIsSending(true)
    try {
      let updatedGroup = null;
      for (const id of selectedIds) {
        updatedGroup = await addGroupMember(groupId, id)
      }
      if (updatedGroup && selectedUser?._id === groupId) {
        setSelectedUser({ ...updatedGroup, isGroup: true })
      }
      toast.success(`Đã thêm ${selectedIds.length} thành viên vào nhóm`);
      onClose()
    } catch (error) {
      console.error(error)
      toast.error("Có lỗi xảy ra khi thêm thành viên")
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="[&>button]:hidden bg-white border border-[#E5E7EB] text-[#111827] !w-[500px] !max-w-[600vw] rounded-2xl p-0 overflow-hidden flex flex-col h-[650px] shadow-2xl !bg-white !text-[#111827] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <h2 className="text-[#111827] text-lg font-bold">Thêm thành viên</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors p-1.5 hover:bg-[#F3F4F6] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB] flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Tìm kiếm bạn bè..."
              className="w-full bg-white border border-[#D1D5DB] rounded-xl pl-10 pr-4 py-2 text-[14px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-transparent transition-all placeholder:text-[#9CA3AF]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[#E5E7EB] px-6 bg-white flex-shrink-0">
          <div className="flex gap-6 text-[14px] font-semibold">
            <button
              onClick={() => setActiveTab("friends")}
              className={`py-3 relative transition-all ${activeTab === "friends" ? "text-[#1877F2]" : "text-[#6B7280] hover:text-[#111827]"}`}
            >
              Bạn bè
              {activeTab === "friends" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1877F2]" />}
            </button>
            {/* Can add 'recent' tab later if needed, keeping it simple for members */}
          </div>
        </div>

        {/* Dynamic Two-Column Split Layout */}
        <div className="flex flex-1 min-h-0 bg-[#F9FAFB]">

          {/* Left Column: All Targets Selection */}
          <div className={`${selectedIds.length > 0 ? "w-[60%]" : "w-full"} flex flex-col ${selectedIds.length > 0 ? "border-r border-[#E5E7EB]" : ""} h-full overflow-hidden transition-all duration-300`}>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-1">
              {filteredTargets.length > 0 ? (
                filteredTargets.map(target => {
                  const isChecked = selectedIds.includes(target.id);
                  return (
                    <div
                      key={target.id}
                      className="flex items-center gap-3.5 px-3.5 py-3 hover:bg-[#F3F4F6] rounded-xl cursor-pointer transition-colors group"
                      onClick={() => toggleSelect(target.id)}
                    >
                      {/* Checkbox (Circular shape) */}
                      <div className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isChecked ? "bg-[#1877F2] border-[#1877F2]" : "border-[#D1D5DB] group-hover:border-[#9CA3AF]"
                        }`}>
                        {isChecked && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3.5 h-3.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>

                      <img
                        src={target.avatar || "/avatar.png"}
                        alt={target.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#E5E7EB] shrink-0"
                      />

                      <span className="text-[#111827] text-[15px] font-medium truncate flex-1">{target.name}</span>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-[#6B7280] text-[14px]">Không tìm thấy kết quả nào</div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Targets (Slides in when selectedCount > 0) */}
          {selectedIds.length > 0 && (
            <div className="w-[40%] flex flex-col bg-white h-full overflow-hidden animate-in slide-in-from-right-5 duration-200">
              {/* Header: Selected Count + Clear All */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#F3F4F6] flex-shrink-0">
                <span className="text-[13.5px] font-bold text-[#374151]">
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
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2.5 flex flex-col gap-1 bg-white">
                {selectedIds.map(id => {
                  const target = allPossibleTargets.find(t => t.id === id);
                  if (!target) return null;
                  const name = target.name || id;
                  const avatar = target.avatar || "/avatar.png";

                  return (
                    <div
                      key={id}
                      className="flex items-center gap-3 px-3.5 py-2.5 bg-[#F9FAFB] hover:bg-[#F3F4F6] rounded-xl group transition-colors justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={avatar || "/avatar.png"}
                          alt={name}
                          className="w-8 h-8 rounded-full object-cover border border-[#E5E7EB] shrink-0"
                        />
                        <span className="text-[#374151] text-[14.5px] font-medium truncate">{name}</span>
                      </div>
                      <button
                         onClick={(e) => { e.stopPropagation(); toggleSelect(id); }}
                        className="text-[#9CA3AF] hover:text-[#4B5563] p-1 rounded-full hover:bg-white transition-colors shrink-0"
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

        {/* Footer Area with Action Buttons */}
        <div className="flex-shrink-0 bg-[#F9FAFB] border-t border-[#E5E7EB] p-4 flex flex-row items-center justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151] rounded-xl transition-all text-[14px] font-bold">
              Hủy
            </button>

            <button
              onClick={handleAddMembers}
              disabled={selectedIds.length === 0 || isSending}
              className="flex items-center justify-center min-w-[110px] px-6 py-2.5 bg-[#1877F2] hover:bg-[#166FE5] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all text-[14px] font-bold shadow-md shadow-[#1877F2]/10"
            >
              {isSending ? "Đang thêm..." : "Xác nhận"}
            </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

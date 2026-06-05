import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, X, Camera, Check, Users } from "lucide-react"
import { useChatStore } from "@/store/useChatStore"
import { toast } from "react-hot-toast"

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const { allContacts, getAllcontacts, createGroup, getMyGroups } = useChatStore()
  const [groupName, setGroupName] = useState("")
  const [groupAvatar, setGroupAvatar] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      getAllcontacts()
    }
  }, [isOpen, getAllcontacts])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return

    const reader = new FileReader()
    reader.onloadend = () => setGroupAvatar(reader.result as string)
    reader.readAsDataURL(file)
  }

  const toggleUser = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Vui lòng nhập tên nhóm")
      return
    }
    if (selectedUserIds.length < 2) {
      toast.error("Nhóm phải có ít nhất 3 thành viên")
      return
    }

    setIsCreating(true)
    try {
      await createGroup({
        name: groupName,
        members: selectedUserIds,
        groupPicture: groupAvatar,
      })
      toast.success(`Đã tạo nhóm "${groupName}" thành công!`)
      onClose()
      setGroupName("")
      setGroupAvatar(null)
      setSelectedUserIds([])
      setSearchQuery("")
    } catch (error) {
      console.error("Failed to create group:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const filteredContacts = allContacts.filter(contact => 
    contact.fullname.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedContacts = allContacts.filter(c => selectedUserIds.includes(c._id))

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[420px] p-0 overflow-hidden border shadow-2xl rounded-xl" style={{ background: 'var(--chat-bg-sidebar)', borderColor: 'var(--chat-border)', color: 'var(--chat-text)' }}>
        <DialogHeader className="px-5 py-4 border-b" style={{ borderColor: 'var(--chat-border)', background: 'var(--chat-bg-header)' }}>
          <DialogTitle className="text-[16px] font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0052cc]" />
            Tạo nhóm mới
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          {/* Avatar & Name Input Area */}
          <div className="flex items-center gap-4 px-5 py-4" style={{ background: 'var(--chat-bg-sidebar)' }}>
            <div 
              className="relative w-14 h-14 rounded-full border flex items-center justify-center cursor-pointer group overflow-hidden shrink-0 shadow-sm"
              onClick={() => fileInputRef.current?.click()}
              style={{ background: 'var(--chat-bg-main)', borderColor: 'var(--chat-border)' }}
            >
              {groupAvatar ? (
                <img src={groupAvatar} alt="Group Avatar" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-5 h-5 text-chat-muted" />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
            </div>

            <div className="flex-1">
              <input
                type="text"
                placeholder="Nhập tên nhóm..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full bg-transparent border-b-2 px-1 py-2 text-[15px] font-medium text-chat-text outline-none focus:border-[#0052cc] transition-colors placeholder:text-chat-muted placeholder:font-normal"
                style={{ borderColor: 'var(--chat-border)' }}
              />
            </div>
          </div>

          {/* Search Box */}
          <div className="px-5 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-chat-muted" />
              <input
                type="text"
                placeholder="Nhập tên hoặc số điện thoại"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full py-2 pl-[38px] pr-4 text-[14px] outline-none border focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all text-chat-text placeholder:text-chat-muted"
                style={{ background: 'var(--chat-bg-main)', borderColor: 'var(--chat-border)' }}
              />
            </div>
          </div>

          {/* Horizontal Selected Users Chips (Chỉ hiện khi có người được chọn) */}
          {selectedUserIds.length > 0 && (
            <div className="px-5 pb-3 flex items-center gap-3 overflow-x-auto custom-scrollbar-horizontal scroll-smooth">
              {selectedContacts.map(contact => (
                <div key={`chip-${contact._id}`} className="relative flex flex-col items-center gap-1 shrink-0 group">
                  <div className="relative">
                    <img src={contact.profilePicture || "/avatar.png"} alt={contact.fullname} className="w-11 h-11 rounded-full object-cover border-2" style={{ borderColor: 'var(--chat-bg-sidebar)' }} />
                    <button 
                      onClick={() => toggleUser(contact._id)}
                      className="absolute -top-1 -right-1 rounded-full p-0.5 border text-chat-muted hover:text-white hover:bg-red-500 hover:border-red-500 transition-all z-10"
                      style={{ background: 'var(--chat-bg-sidebar)', borderColor: 'var(--chat-border)' }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-[11px] text-chat-muted max-w-[50px] truncate">{contact.fullname.split(' ').pop()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Contacts List */}
          <div className="px-3 pb-3">
            <h4 className="text-[13px] font-semibold text-chat-muted mb-2 px-2 uppercase tracking-wide">
              Danh bạ
            </h4>
            <div className="overflow-y-auto h-[240px] custom-scrollbar flex flex-col pr-1">
              {filteredContacts.map(contact => {
                const isSelected = selectedUserIds.includes(contact._id);
                return (
                  <label 
                    key={contact._id} 
                    onClick={(e) => {
                      e.preventDefault();
                      toggleUser(contact._id);
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-chat-hover cursor-pointer transition-colors"
                  >
                    {/* Checkbox tròn */}
                    <div 
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${isSelected ? "bg-[#0052cc] border-[#0052cc]" : ""}`}
                      style={isSelected ? {} : { borderColor: 'var(--chat-border)' }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </div>
                    <img src={contact.profilePicture || "/avatar.png"} alt={contact.fullname} className="w-10 h-10 rounded-full object-cover" />
                    <span className="text-[15px] font-medium text-chat-text flex-1 truncate">{contact.fullname}</span>
                  </label>
                )
              })}
              {filteredContacts.length === 0 && (
                <div className="flex items-center justify-center h-full text-chat-muted text-[14px]">
                  Không tìm thấy kết quả phù hợp
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--chat-border)', background: 'var(--chat-bg-header)' }}>
          <button 
            onClick={onClose}
            className="px-5 py-2 text-[14px] font-medium text-chat-text bg-chat-hover hover:bg-chat-active rounded-md transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUserIds.length < 2 || isCreating}
            className="px-6 py-2 text-[14px] font-semibold bg-[#0052cc] text-white rounded-md hover:bg-[#0047b3] transition-colors disabled:opacity-50 disabled:bg-[#0052cc]/50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating ? "Đang tạo..." : "Tạo nhóm"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

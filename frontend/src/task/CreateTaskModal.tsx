import { useEffect, useState } from "react"
import { X, Search, UserPlus, Users, ChevronDown, ChevronUp, StickyNote } from "lucide-react"
import { useTaskStore } from "@/store/useTaskStore"
import { useChatStore } from "@/store/useChatStore"
import { useAuthStore } from "@/store/useAuthStore"
import toast from "react-hot-toast"

interface CreateTaskModalProps {
  onClose: () => void;
}

type PickerTab = "individual" | "group";

const MAX_DEADLINE_YEARS = 100;

export function CreateTaskModal({ onClose }: CreateTaskModalProps) {
  const { createTask, isCreating } = useTaskStore()
  const { allContacts, getAllcontacts, groups, getMyGroups } = useChatStore()
  const { authUser } = useAuthStore()

  useEffect(() => {
    if (allContacts.length === 0) getAllcontacts()
    if (groups.length === 0) getMyGroups()
  }, [])

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignees, setAssignees] = useState<string[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [assigneeNotes, setAssigneeNotes] = useState<Record<string, string>>({})
  const [deadline, setDeadline] = useState("")
  const [deadlineError, setDeadlineError] = useState("")

  const [isSelectingAssignee, setIsSelectingAssignee] = useState(false)
  const [pickerTab, setPickerTab] = useState<PickerTab>("individual")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())

  const validateDeadline = (val: string): string => {
    if (!val) return ""
    const taskDeadline = new Date(val)
    const now = new Date()
    const maxDeadline = new Date()
    maxDeadline.setFullYear(maxDeadline.getFullYear() + MAX_DEADLINE_YEARS)
    if (taskDeadline <= now) return "Deadline phải là thời điểm trong tương lai"
    if (taskDeadline > maxDeadline) return `Deadline không được vượt quá ${MAX_DEADLINE_YEARS} năm kể từ hôm nay`
    return ""
  }

  const handleDeadlineChange = (val: string) => {
    setDeadline(val)
    setDeadlineError(validateDeadline(val))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validateDeadline(deadline)
    if (err) { setDeadlineError(err); return }
    if (!title || !description || !deadline) return
    if (assignees.length === 0 && selectedGroups.length === 0) {
      toast.error("Phải chọn ít nhất một người hoặc nhóm nhận việc")
      return
    }
    await createTask({ title, description, assignees, groups: selectedGroups, assigneeNotes, deadline })
    onClose()
  }

  const toggleAssignee = (id: string) => {
    setAssignees(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleGroup = (id: string) => {
    setSelectedGroups(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleNoteExpanded = (id: string) => {
    setExpandedNotes(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filteredContacts = allContacts.filter(c =>
    c.fullname.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredGroups = groups.filter((g: any) =>
    g.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Resolved assignee display items (individual + group members preview)
  const assigneeItems = assignees.map(id => ({ id, label: allContacts.find(c => c._id === id)?.fullname || id, avatar: allContacts.find(c => c._id === id)?.profilePicture, type: "user" as const }))
  const groupItems = selectedGroups.map(id => ({ id, label: groups.find((g: any) => g._id === id)?.name || id, avatar: groups.find((g: any) => g._id === id)?.groupPicture, type: "group" as const }))
  const allSelected = [...assigneeItems, ...groupItems]

  const hasSelection = assignees.length > 0 || selectedGroups.length > 0

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-[540px] max-h-[90vh] bg-[#1e1f22] rounded-xl border border-[#2b2d31] shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2b2d31] shrink-0">
            <h2 className="text-[18px] font-semibold text-white">Giao việc mới</h2>
            <button onClick={onClose} className="text-[#a1a1a1] hover:text-white p-1 rounded-md hover:bg-[#2b2d31] transition-colors"><X className="w-5 h-5" /></button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex flex-col p-6 gap-5 overflow-y-auto custom-scrollbar">

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#e1e1e1]">Tên công việc <span className="text-red-500">*</span></label>
              <input
                required value={title} onChange={e => setTitle(e.target.value)}
                className="w-full bg-[#131416] border border-[#2b2d31] rounded-md px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#0052cc] transition-colors"
                placeholder="Ví dụ: Lên kế hoạch Marketing"
              />
            </div>

            {/* Người giao + Deadline */}
            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[13px] font-medium text-[#e1e1e1]">Người giao</label>
                <input disabled value={authUser?.fullname || "Quản lý"} className="w-full bg-[#1e1f22] border border-[#2b2d31] rounded-md px-3 py-2.5 text-[14px] text-[#a1a1a1] cursor-not-allowed" />
              </div>
              <div className="flex flex-col gap-1.5 flex-1 relative">
                <label className="text-[13px] font-medium text-[#e1e1e1]">Deadline <span className="text-red-500">*</span></label>
                <input
                  required type="datetime-local" value={deadline}
                  onChange={e => handleDeadlineChange(e.target.value)}
                  className={`w-full bg-[#131416] border ${deadlineError ? 'border-red-500' : 'border-[#2b2d31] focus:border-[#0052cc]'} rounded-md px-3 py-2.5 text-[14px] text-white outline-none transition-colors`}
                />
                {deadlineError && <span className="text-[11px] text-red-500 absolute -bottom-5">{deadlineError}</span>}
              </div>
            </div>

            {/* Người nhận việc */}
            <div className="flex flex-col gap-1.5" style={{ marginTop: deadlineError ? "12px" : undefined }}>
              <label className="text-[13px] font-medium text-[#e1e1e1]">Giao cho <span className="text-red-500">*</span></label>
              <div
                onClick={() => setIsSelectingAssignee(true)}
                className="w-full min-h-[42px] bg-[#131416] border border-[#2b2d31] hover:border-[#0052cc] rounded-md p-2 cursor-pointer flex flex-wrap gap-2 items-center transition-colors"
              >
                {allSelected.map(item => (
                  <div key={item.id} className="flex items-center gap-1.5 bg-[#1e1f22] border border-[#2b2d31] rounded-full px-2 py-1" onClick={e => e.stopPropagation()}>
                    {item.type === "group" ? (
                      <Users className="w-4 h-4 text-[#0052cc]" />
                    ) : (
                      <img src={item.avatar || "/avatar.png"} className="w-5 h-5 rounded-full object-cover" />
                    )}
                    <span className="text-[12px] text-[#e1e1e1]">{item.label}</span>
                    <X className="w-3 h-3 text-[#a1a1a1] hover:text-white cursor-pointer ml-1"
                      onClick={() => item.type === "group" ? toggleGroup(item.id) : toggleAssignee(item.id)} />
                  </div>
                ))}
                <div className="text-[13px] text-[#a1a1a1] flex items-center gap-2 px-2 hover:text-white transition-colors">
                  <UserPlus className="w-4 h-4" /> Thêm người / nhóm
                </div>
              </div>
            </div>

            {/* Per-assignee Notes */}
            {assignees.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#e1e1e1] flex items-center gap-1.5">
                  <StickyNote className="w-4 h-4 text-[#0052cc]" /> Ghi chú riêng cho từng người <span className="text-[#a1a1a1] font-normal">(tùy chọn)</span>
                </label>
                <div className="flex flex-col gap-2">
                  {assignees.map(id => {
                    const contact = allContacts.find(c => c._id === id)
                    if (!contact) return null
                    const isOpen = expandedNotes.has(id)
                    return (
                      <div key={id} className="bg-[#131416] border border-[#2b2d31] rounded-lg overflow-hidden">
                        <button type="button" onClick={() => toggleNoteExpanded(id)} className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#1e1f22] transition-colors">
                          <div className="flex items-center gap-2">
                            <img src={contact.profilePicture || "/avatar.png"} className="w-6 h-6 rounded-full object-cover" />
                            <span className="text-[13px] text-[#e1e1e1]">{contact.fullname}</span>
                            {assigneeNotes[id] && <span className="text-[11px] text-[#0052cc] bg-[#0052cc]/10 px-1.5 py-0.5 rounded">Có ghi chú</span>}
                          </div>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-[#a1a1a1]" /> : <ChevronDown className="w-4 h-4 text-[#a1a1a1]" />}
                        </button>
                        {isOpen && (
                          <div className="px-3 pb-3">
                            <textarea
                              value={assigneeNotes[id] || ""}
                              onChange={e => setAssigneeNotes(prev => ({ ...prev, [id]: e.target.value }))}
                              placeholder={`Ghi chú riêng cho ${contact.fullname}...`}
                              rows={2}
                              className="w-full bg-[#1e1f22] border border-[#2b2d31] rounded-md px-3 py-2 text-[13px] text-white outline-none focus:border-[#0052cc] resize-none transition-colors placeholder:text-[#a1a1a1]"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Mô tả */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#e1e1e1]">Mô tả công việc <span className="text-red-500">*</span></label>
              <textarea
                required value={description} onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-[#131416] border border-[#2b2d31] rounded-md px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#0052cc] transition-colors resize-none custom-scrollbar"
                placeholder="Nhập chi tiết yêu cầu..."
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-[#2b2d31] pt-5">
              <button type="button" onClick={onClose} className="px-4 py-2 text-[14px] font-medium text-[#a1a1a1] hover:text-white hover:bg-[#2b2d31] rounded-md transition-colors">Hủy</button>
              <button
                type="submit"
                disabled={!title || !description || !deadline || !hasSelection || isCreating || !!deadlineError}
                className="px-5 py-2 text-[14px] font-medium bg-[#0052cc] hover:bg-[#0052cc]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors shadow-sm"
              >
                {isCreating ? "Đang giao..." : "Giao việc"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Nested Modal: Bảng Chọn Người / Nhóm */}
      {isSelectingAssignee && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[680px] bg-[#1e1f22] rounded-xl border border-[#2b2d31] shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-200">

            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2b2d31]">
              <h2 className="text-[16px] font-semibold text-white">Chọn người / nhóm nhận việc</h2>
              <button onClick={() => setIsSelectingAssignee(false)} className="text-[#a1a1a1] hover:text-white p-1 rounded-md hover:bg-[#2b2d31] transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#2b2d31]">
              {([["individual", "Cá nhân", UserPlus], ["group", "Nhóm", Users]] as const).map(([tab, label, Icon]) => (
                <button
                  key={tab}
                  onClick={() => { setPickerTab(tab); setSearchQuery("") }}
                  className={`flex items-center gap-2 px-5 py-2.5 text-[14px] font-medium transition-colors border-b-2 ${pickerTab === tab ? 'border-[#0052cc] text-white' : 'border-transparent text-[#a1a1a1] hover:text-white'}`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>

            <div className="flex h-[300px] bg-[#131416]">
              {/* Left: Search list */}
              <div className="flex-1 flex flex-col border-r border-[#2b2d31]">
                <div className="p-3 border-b border-[#2b2d31] relative">
                  <Search className="w-4 h-4 text-[#a1a1a1] absolute left-5 top-1/2 -translate-y-1/2" />
                  <input
                    placeholder={pickerTab === "individual" ? "Tìm nhân viên..." : "Tìm nhóm..."}
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none text-[13px] text-[#e1e1e1] pl-8 pr-2 py-1"
                  />
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
                  {pickerTab === "individual" ? (
                    filteredContacts.map((c: any) => {
                      const isSelected = assignees.includes(c._id)
                      return (
                        <div key={c._id} onClick={() => toggleAssignee(c._id)} className="flex items-center gap-3 p-2 hover:bg-[#1e1f22] rounded-md cursor-pointer transition-colors group">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#0052cc] border-[#0052cc]' : 'border-[#a1a1a1] group-hover:border-white'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                          </div>
                          <img src={c.profilePicture || "/avatar.png"} className="w-8 h-8 rounded-full bg-[#2b2d31] object-cover" />
                          <span className="text-[14px] text-[#e1e1e1] group-hover:text-white transition-colors">{c.fullname}</span>
                        </div>
                      )
                    })
                  ) : (
                    filteredGroups.map((g: any) => {
                      const isSelected = selectedGroups.includes(g._id)
                      return (
                        <div key={g._id} onClick={() => toggleGroup(g._id)} className="flex items-center gap-3 p-2 hover:bg-[#1e1f22] rounded-md cursor-pointer transition-colors group">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#0052cc] border-[#0052cc]' : 'border-[#a1a1a1] group-hover:border-white'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-[#2b2d31] flex items-center justify-center shrink-0 overflow-hidden">
                            {g.groupPicture ? <img src={g.groupPicture} className="w-full h-full object-cover" /> : <Users className="w-4 h-4 text-[#a1a1a1]" />}
                          </div>
                          <div>
                            <p className="text-[14px] text-[#e1e1e1] group-hover:text-white transition-colors">{g.name}</p>
                            <p className="text-[11px] text-[#a1a1a1]">{g.members?.length || 0} thành viên</p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  {pickerTab === "individual" && filteredContacts.length === 0 && (
                    <div className="text-center text-[13px] text-[#a1a1a1] mt-6">Không tìm thấy nhân viên</div>
                  )}
                  {pickerTab === "group" && filteredGroups.length === 0 && (
                    <div className="text-center text-[13px] text-[#a1a1a1] mt-6">Không có nhóm nào</div>
                  )}
                </div>
              </div>

              {/* Right: Selected */}
              <div className="w-[45%] flex flex-col bg-[#1e1f22]/30">
                <div className="p-4 text-[13px] font-medium text-[#e1e1e1] border-b border-[#2b2d31]">
                  Đã chọn: <span className="text-[#0052cc]">{assignees.length + selectedGroups.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-wrap gap-2 content-start">
                  {allSelected.map(item => (
                    <div key={item.id} className="flex items-center gap-1.5 bg-[#1e1f22] hover:bg-[#2b2d31] border border-[#2b2d31] rounded-full pl-2 pr-1.5 py-1.5 transition-colors">
                      {item.type === "group" ? <Users className="w-4 h-4 text-[#0052cc]" /> : <img src={item.avatar || "/avatar.png"} className="w-5 h-5 rounded-full object-cover" />}
                      <span className="text-[12px] text-[#e1e1e1] truncate max-w-[90px]">{item.label}</span>
                      <div onClick={() => item.type === "group" ? toggleGroup(item.id) : toggleAssignee(item.id)} className="p-0.5 hover:bg-black/30 rounded-full cursor-pointer ml-1">
                        <X className="w-3 h-3 text-[#a1a1a1] hover:text-red-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end px-5 py-3 border-t border-[#2b2d31] bg-[#1e1f22]">
              <button onClick={() => setIsSelectingAssignee(false)} className="px-5 py-2 text-[14px] font-medium bg-[#0052cc] hover:bg-[#0052cc]/90 text-white rounded-md transition-colors shadow-sm">Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

import { useEffect, useState } from "react"
import { X, Users, ChevronDown, ChevronUp, StickyNote } from "lucide-react"
import { useTaskStore } from "@/store/useTaskStore"
import { useChatStore } from "@/store/useChatStore"
import { useAuthStore } from "@/store/useAuthStore"
import toast from "react-hot-toast"
import { AssigneePickerModal } from "./AssigneePickerModal"

interface CreateTaskModalProps {
  onClose: () => void;
}

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
                  <Users className="w-4 h-4" /> Thêm người / nhóm
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

      {isSelectingAssignee && (
        <AssigneePickerModal
          assignees={assignees}
          selectedGroups={selectedGroups}
          toggleAssignee={toggleAssignee}
          toggleGroup={toggleGroup}
          allSelected={allSelected}
          onClose={() => setIsSelectingAssignee(false)}
        />
      )}
    </>
  )
}

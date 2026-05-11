import { useState } from "react"
import { X, Search, UserPlus } from "lucide-react"

interface CreateTaskModalProps {
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

const mockContacts = [
  { id: "Nguyễn Văn A", name: "Nguyễn Văn A", avatar: "/avatar.png" },
  { id: "Nguyễn Văn B", name: "Nguyễn Văn B", avatar: "/avatar.png" },
  { id: "Lê Thị C", name: "Lê Thị C", avatar: "/avatar.png" },
  { id: "Trần Văn D", name: "Trần Văn D", avatar: "/avatar.png" },
  { id: "Phạm Hùng E", name: "Phạm Hùng E", avatar: "/avatar.png" },
];

export function CreateTaskModal({ onClose, onSubmit }: CreateTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignees, setAssignees] = useState<string[]>(["Nguyễn Văn A"])
  const [deadline, setDeadline] = useState("")

  const [isSelectingAssignee, setIsSelectingAssignee] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline || assignees.length === 0) return;
    onSubmit({ title, description, assignees, deadline });
  }

  const toggleAssignee = (id: string) => {
    setAssignees(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const filteredContacts = mockContacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-[500px] bg-[#1e1f22] rounded-xl border border-[#2b2d31] shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2b2d31] shrink-0">
            <h2 className="text-[18px] font-semibold text-white">Giao việc mới</h2>
            <button onClick={onClose} className="text-[#a1a1a1] hover:text-white p-1 rounded-md hover:bg-[#2b2d31] transition-colors"><X className="w-5 h-5" /></button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex flex-col p-6 gap-5">

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#e1e1e1]">Tên công việc <span className="text-red-500">*</span></label>
              <input
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-[#131416] border border-[#2b2d31] rounded-md px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#0052cc] transition-colors"
                placeholder="Ví dụ: Lên kế hoạch Marketing"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[13px] font-medium text-[#e1e1e1]">Người giao</label>
                <input
                  disabled
                  value="Manager Tiến Đạt"
                  className="w-full bg-[#1e1f22] border border-[#2b2d31] rounded-md px-3 py-2.5 text-[14px] text-[#a1a1a1] cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[13px] font-medium text-[#e1e1e1]">Deadline <span className="text-red-500">*</span></label>
                <input
                  required
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full bg-[#131416] border border-[#2b2d31] rounded-md px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#0052cc] transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#e1e1e1]">Giao cho nhân viên <span className="text-red-500">*</span></label>
              <div
                onClick={() => setIsSelectingAssignee(true)}
                className="w-full min-h-[42px] bg-[#131416] border border-[#2b2d31] hover:border-[#0052cc] rounded-md p-2 cursor-pointer flex flex-wrap gap-2 items-center transition-colors"
              >
                {assignees.map(id => {
                  const c = mockContacts.find(x => x.id === id);
                  if (!c) return null;
                  return (
                    <div key={id} className="flex items-center gap-1.5 bg-[#1e1f22] border border-[#2b2d31] rounded-full px-2 py-1" onClick={e => e.stopPropagation()}>
                      <img src={c.avatar} className="w-5 h-5 rounded-full" />
                      <span className="text-[12px] text-[#e1e1e1]">{c.name}</span>
                      <X className="w-3 h-3 text-[#a1a1a1] hover:text-white cursor-pointer ml-1" onClick={() => toggleAssignee(id)} />
                    </div>
                  )
                })}
                <div className="text-[13px] text-[#a1a1a1] flex items-center gap-2 px-2 hover:text-white transition-colors">
                  <UserPlus className="w-4 h-4" /> Thêm người
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#e1e1e1]">Mô tả công việc</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-[#131416] border border-[#2b2d31] rounded-md px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#0052cc] transition-colors resize-none custom-scrollbar"
                placeholder="Nhập chi tiết yêu cầu..."
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 mt-4 border-t border-[#2b2d31] pt-5">
              <button type="button" onClick={onClose} className="px-4 py-2 text-[14px] font-medium text-[#a1a1a1] hover:text-white hover:bg-[#2b2d31] rounded-md transition-colors">Hủy</button>
              <button type="submit" disabled={!title || !deadline || assignees.length === 0} className="px-5 py-2 text-[14px] font-medium bg-[#0052cc] hover:bg-[#0052cc]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors shadow-sm">Giao việc</button>
            </div>
          </form>
        </div>
      </div>

      {/* Nested Modal: Bảng Chọn Nhân Viên */}
      {isSelectingAssignee && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[650px] bg-[#1e1f22] rounded-xl border border-[#2b2d31] shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-200">

            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2b2d31]">
              <h2 className="text-[16px] font-semibold text-white">Chọn người nhận việc</h2>
              <button onClick={() => setIsSelectingAssignee(false)} className="text-[#a1a1a1] hover:text-white p-1 rounded-md hover:bg-[#2b2d31] transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex h-[300px] bg-[#131416]">
              {/* Bên trái: Danh sách chọn */}
              <div className="flex-1 flex flex-col border-r border-[#2b2d31]">
                <div className="p-3 border-b border-[#2b2d31] relative">
                  <Search className="w-4 h-4 text-[#a1a1a1] absolute left-5 top-1/2 -translate-y-1/2" />
                  <input
                    placeholder="Tìm nhân viên..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none text-[13px] text-[#e1e1e1] pl-8 pr-2 py-1"
                  />
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
                  {filteredContacts.map(c => {
                    const isSelected = assignees.includes(c.id);
                    return (
                      <div key={c.id} onClick={() => toggleAssignee(c.id)} className="flex items-center gap-3 p-2 hover:bg-[#1e1f22] rounded-md cursor-pointer transition-colors group">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#0052cc] border-[#0052cc]' : 'border-[#a1a1a1] group-hover:border-white'}`}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                        </div>
                        <img src={c.avatar} className="w-8 h-8 rounded-full bg-[#2b2d31]" />
                        <span className="text-[14px] text-[#e1e1e1] group-hover:text-white transition-colors">{c.name}</span>
                      </div>
                    )
                  })}
                  {filteredContacts.length === 0 && (
                    <div className="text-center text-[13px] text-[#a1a1a1] mt-6">Không tìm thấy nhân viên</div>
                  )}
                </div>
              </div>

              {/* Bên phải: Danh sách đã chọn */}
              <div className="w-[45%] flex flex-col bg-[#1e1f22]/30">
                <div className="p-4 text-[13px] font-medium text-[#e1e1e1] border-b border-[#2b2d31]">
                  Đã chọn: <span className="text-[#0052cc]">{assignees.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-wrap gap-2 content-start">
                  {assignees.map(id => {
                    const c = mockContacts.find(x => x.id === id);
                    if (!c) return null;
                    return (
                      <div key={id} className="flex items-center gap-1.5 bg-[#1e1f22] hover:bg-[#2b2d31] border border-[#2b2d31] rounded-full pl-2 pr-1.5 py-1.5 transition-colors">
                        <img src={c.avatar} className="w-5 h-5 rounded-full" />
                        <span className="text-[12px] text-[#e1e1e1] truncate max-w-[90px]">{c.name}</span>
                        <div onClick={() => toggleAssignee(id)} className="p-0.5 hover:bg-black/30 rounded-full cursor-pointer ml-1">
                          <X className="w-3 h-3 text-[#a1a1a1] hover:text-red-400" />
                        </div>
                      </div>
                    )
                  })}
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


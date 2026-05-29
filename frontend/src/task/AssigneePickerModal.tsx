import { useState, useEffect } from "react"
import { X, Search, UserPlus, Users } from "lucide-react"
import { useChatStore } from "@/store/useChatStore"

type PickerTab = "individual" | "group";

interface AssigneePickerModalProps {
  assignees: string[];
  selectedGroups: string[];
  toggleAssignee: (id: string) => void;
  toggleGroup: (id: string) => void;
  allSelected: {
    id: string;
    label: string;
    avatar: string | undefined;
    type: "user" | "group";
  }[];
  onClose: () => void;
}

export function AssigneePickerModal({
  assignees,
  selectedGroups,
  toggleAssignee,
  toggleGroup,
  allSelected,
  onClose,
}: AssigneePickerModalProps) {
  const { allContacts, getAllcontacts, groups, getMyGroups } = useChatStore()
  const [pickerTab, setPickerTab] = useState<PickerTab>("individual")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (allContacts.length === 0) getAllcontacts()
    if (groups.length === 0) getMyGroups()
  }, [])

  const filteredContacts = allContacts.filter(c =>
    c.fullname.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredGroups = groups.filter((g: any) =>
    g.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[680px] bg-[#1e1f22] rounded-xl border border-[#2b2d31] shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2b2d31]">
          <h2 className="text-[16px] font-semibold text-white">Chọn người / nhóm nhận việc</h2>
          <button
            onClick={onClose}
            className="text-[#a1a1a1] hover:text-white p-1 rounded-md hover:bg-[#2b2d31] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2b2d31]">
          {([["individual", "Cá nhân", UserPlus], ["group", "Nhóm", Users]] as const).map(([tab, label, Icon]) => (
            <button
              key={tab}
              onClick={() => {
                setPickerTab(tab);
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-5 py-2.5 text-[14px] font-medium transition-colors border-b-2 ${
                pickerTab === tab ? "border-[#0052cc] text-white" : "border-transparent text-[#a1a1a1] hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Picker Body */}
        <div className="flex h-[300px] bg-[#131416]">
          {/* Left: Search list */}
          <div className="flex-1 flex flex-col border-r border-[#2b2d31]">
            <div className="p-3 border-b border-[#2b2d31] relative">
              <Search className="w-4 h-4 text-[#a1a1a1] absolute left-5 top-1/2 -translate-y-1/2" />
              <input
                placeholder={pickerTab === "individual" ? "Tìm nhân viên..." : "Tìm nhóm..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-[13px] text-[#e1e1e1] pl-8 pr-2 py-1"
              />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
              {pickerTab === "individual" ? (
                filteredContacts.map((c: any) => {
                  const isSelected = assignees.includes(c._id);
                  return (
                    <div
                      key={c._id}
                      onClick={() => toggleAssignee(c._id)}
                      className="flex items-center gap-3 p-2 hover:bg-[#1e1f22] rounded-md cursor-pointer transition-colors group"
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-[#0052cc] border-[#0052cc]" : "border-[#a1a1a1] group-hover:border-white"
                        }`}
                      >
                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                      </div>
                      <img
                        src={c.profilePicture || "/avatar.png"}
                        className="w-8 h-8 rounded-full bg-[#2b2d31] object-cover"
                      />
                      <span className="text-[14px] text-[#e1e1e1] group-hover:text-white transition-colors">
                        {c.fullname}
                      </span>
                    </div>
                  );
                })
              ) : (
                filteredGroups.map((g: any) => {
                  const isSelected = selectedGroups.includes(g._id);
                  return (
                    <div
                      key={g._id}
                      onClick={() => toggleGroup(g._id)}
                      className="flex items-center gap-3 p-2 hover:bg-[#1e1f22] rounded-md cursor-pointer transition-colors group"
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-[#0052cc] border-[#0052cc]" : "border-[#a1a1a1] group-hover:border-white"
                        }`}
                      >
                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#2b2d31] flex items-center justify-center shrink-0 overflow-hidden">
                        {g.groupPicture ? (
                          <img src={g.groupPicture} className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-4 h-4 text-[#a1a1a1]" />
                        )}
                      </div>
                      <div>
                        <p className="text-[14px] text-[#e1e1e1] group-hover:text-white transition-colors">{g.name}</p>
                        <p className="text-[11px] text-[#a1a1a1]">{g.members?.length || 0} thành viên</p>
                      </div>
                    </div>
                  );
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

          {/* Right: Selected list */}
          <div className="w-[45%] flex flex-col bg-[#1e1f22]/30">
            <div className="p-4 text-[13px] font-medium text-[#e1e1e1] border-b border-[#2b2d31]">
              Đã chọn: <span className="text-[#0052cc]">{assignees.length + selectedGroups.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-wrap gap-2 content-start">
              {allSelected.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-1.5 bg-[#1e1f22] hover:bg-[#2b2d31] border border-[#2b2d31] rounded-full pl-2 pr-1.5 py-1.5 transition-colors"
                >
                  {item.type === "group" ? (
                    <Users className="w-4 h-4 text-[#0052cc]" />
                  ) : (
                    <img src={item.avatar || "/avatar.png"} className="w-5 h-5 rounded-full object-cover" />
                  )}
                  <span className="text-[12px] text-[#e1e1e1] truncate max-w-[90px]">{item.label}</span>
                  <div
                    onClick={() => (item.type === "group" ? toggleGroup(item.id) : toggleAssignee(item.id))}
                    className="p-0.5 hover:bg-black/30 rounded-full cursor-pointer ml-1"
                  >
                    <X className="w-3 h-3 text-[#a1a1a1] hover:text-red-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-[#2b2d31] bg-[#1e1f22]">
          <button
            onClick={onClose}
            className="px-5 py-2 text-[14px] font-medium bg-[#0052cc] hover:bg-[#0052cc]/90 text-white rounded-md transition-colors shadow-sm"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

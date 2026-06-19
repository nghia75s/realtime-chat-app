import { useState, useEffect } from "react"
import { X, Search, UserPlus, Users } from "lucide-react"
import { useChatStore } from "@/store/useChatStore"
import { useAuthStore } from "@/store/useAuthStore"

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
  const { allContacts, getAllcontacts } = useChatStore()
  const { authUser } = useAuthStore()
  const [pickerTab, setPickerTab] = useState<PickerTab>("individual")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [allGroups, setAllGroups] = useState<any[]>([])

  const toggleExpandGroup = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }

  useEffect(() => {
    if (allContacts.length === 0) getAllcontacts()
    
    // Fetch ALL groups for task assignment, not just the ones the user is in
    import("@/services/chatService").then(({ chatService }) => {
      chatService.getAllGroups().then(data => {
        setAllGroups(data);
      }).catch(err => console.error("Failed to fetch all groups", err));
    });
  }, [])

  // 1. Role-based filtering
  let availableContacts = allContacts;
  let availableGroups = allGroups;

  if (authUser?.role === "moderator") {
    availableContacts = allContacts.filter(c => c.department === authUser.department);
    availableGroups = allGroups.filter((g: any) => {
      const members = g.members || [];
      if (members.length === 0) return false;
      return members.every((mId: any) => {
        const id = typeof mId === "string" ? mId : mId._id;
        if (id === authUser._id) return true; // authUser is in their own department
        const contact = allContacts.find(c => c._id === id);
        return contact && contact.department === authUser.department;
      });
    });
  } else if (authUser?.role === "admin") {
    availableContacts = allContacts.filter(c => c.role === "admin");
    availableGroups = allGroups.filter((g: any) => {
      const members = g.members || [];
      if (members.length === 0) return false;
      return members.every((mId: any) => {
        const id = typeof mId === "string" ? mId : mId._id;
        if (id === authUser._id) return true; // authUser is an admin
        const contact = allContacts.find(c => c._id === id);
        return contact && contact.role === "admin";
      });
    });
  }

  // 2. Search query filtering
  const filteredContacts = availableContacts.filter(c =>
    c.fullname.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredGroups = availableGroups.filter((g: any) =>
    g.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[680px] bg-chat-sidebar rounded-xl border border-chat-border shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-chat-border">
          <h2 className="text-[16px] font-semibold text-chat-text">Chọn người / nhóm nhận việc</h2>
          <button
            onClick={onClose}
            className="text-chat-muted hover:text-chat-text p-1 rounded-md hover:bg-chat-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-chat-border">
          {([["individual", "Cá nhân", UserPlus], ["group", "Nhóm", Users]] as const).map(([tab, label, Icon]) => (
            <button
              key={tab}
              onClick={() => {
                setPickerTab(tab);
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-5 py-2.5 text-[14px] font-medium transition-colors border-b-2 ${pickerTab === tab ? "border-[#0052cc] text-chat-text" : "border-transparent text-chat-muted hover:text-chat-text"
                }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Picker Body */}
        <div className="flex h-[300px] bg-chat-main">
          {/* Left: Search list */}
          <div className="flex-1 flex flex-col border-r border-chat-border">
            <div className="p-3 border-b border-chat-border relative">
              <Search className="w-4 h-4 text-chat-muted absolute left-5 top-1/2 -translate-y-1/2" />
              <input
                placeholder={pickerTab === "individual" ? "Tìm nhân viên..." : "Tìm nhóm..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-[13px] text-chat-text pl-8 pr-2 py-1 placeholder:text-chat-muted"
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
                      className="flex items-center gap-3 p-2 hover:bg-chat-hover rounded-md cursor-pointer transition-colors group"
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? "bg-[#0052cc] border-[#0052cc]" : "border-chat-border group-hover:border-[#0052cc]"
                          }`}
                      >
                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                      </div>
                      <img
                        src={c.profilePicture || "/avatar.png"}
                        className="w-8 h-8 rounded-full bg-chat-hover object-cover"
                      />
                      <span className="text-[14px] text-chat-text/90 group-hover:text-chat-text transition-colors">
                        {c.fullname}
                      </span>
                    </div>
                  );
                })
              ) : (
                filteredGroups.map((g: any) => {
                  const isSelected = selectedGroups.includes(g._id);
                  const isExpanded = expandedGroups.has(g._id);

                  // Get members info
                  const memberIds = g.members || [];
                  // Members can be objects with _id or just string IDs
                  const mappedMembers = memberIds.map((m: any) => {
                    const id = typeof m === "string" ? m : m._id;
                    return allContacts.find(c => c._id === id) || { _id: id, fullname: "You", profilePicture: "/avatar.png" };
                  });

                  return (
                    <div key={g._id} className="flex flex-col gap-1">
                      <div
                        onClick={() => toggleGroup(g._id)}
                        className="flex items-center gap-3 p-2 hover:bg-chat-hover rounded-md cursor-pointer transition-colors group"
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? "bg-[#0052cc] border-[#0052cc]" : "border-chat-border group-hover:border-[#0052cc]"
                            }`}
                        >
                          {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-chat-hover flex items-center justify-center shrink-0 overflow-hidden">
                          {g.groupPicture ? (
                            <img src={g.groupPicture} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-4 h-4 text-chat-muted" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-[14px] text-chat-text/90 group-hover:text-chat-text transition-colors">{g.name}</p>
                          <p className="text-[11px] text-chat-muted">{g.members?.length || 0} thành viên</p>
                        </div>
                        <div
                          onClick={(e) => toggleExpandGroup(g._id, e)}
                          className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-chat-muted transition-colors"
                        >
                          {isExpanded ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                          )}
                        </div>
                      </div>

                      {isExpanded && mappedMembers.length > 0 && (
                        <div className="flex flex-col gap-1 pl-10 pr-2 pb-2">
                          {mappedMembers.map((member: any) => (
                            <div key={member._id} className="flex items-center gap-2 p-1.5 rounded-md text-chat-muted text-[13px]">
                              <img
                                src={member.profilePicture || "/avatar.png"}
                                className="w-5 h-5 rounded-full bg-chat-hover object-cover"
                              />
                              <span>{member.fullname}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              {pickerTab === "individual" && filteredContacts.length === 0 && (
                <div className="text-center text-[13px] text-chat-muted mt-6">Không tìm thấy nhân viên</div>
              )}
              {pickerTab === "group" && filteredGroups.length === 0 && (
                <div className="text-center text-[13px] text-chat-muted mt-6">Không có nhóm nào</div>
              )}
            </div>
          </div>

          {/* Right: Selected list */}
          <div className="w-[45%] flex flex-col bg-chat-sidebar">
            <div className="p-4 text-[13px] font-medium text-chat-text/90 border-b border-chat-border">
              Đã chọn: <span className="text-[#0052cc]">{assignees.length + selectedGroups.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-wrap gap-2 content-start">
              {allSelected.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-1.5 bg-chat-main hover:bg-chat-hover border border-chat-border rounded-full pl-2 pr-1.5 py-1.5 transition-colors"
                >
                  {item.type === "group" ? (
                    <Users className="w-4 h-4 text-[#0052cc]" />
                  ) : (
                    <img src={item.avatar || "/avatar.png"} className="w-5 h-5 rounded-full object-cover" />
                  )}
                  <span className="text-[12px] text-chat-text/90 truncate max-w-[90px]">{item.label}</span>
                  <div
                    onClick={() => (item.type === "group" ? toggleGroup(item.id) : toggleAssignee(item.id))}
                    className="p-0.5 hover:bg-black/10 dark:hover:bg-black/30 rounded-full cursor-pointer ml-1 transition-colors"
                  >
                    <X className="w-3 h-3 text-chat-muted hover:text-red-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-chat-border bg-chat-sidebar">
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

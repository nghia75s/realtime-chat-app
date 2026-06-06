import { useChatStore } from "@/store/useChatStore"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from 'react-router-dom'
import { Users, Search, Filter, ArrowDownUp, MoreHorizontal, ChevronDown } from "lucide-react"

export function ContactGroupsArea() {
  const { getMyGroups, groups, setSelectedUser, isGroupsLoading } = useChatStore()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    getMyGroups()
  }, [getMyGroups])

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groups;
    return groups.filter(g => g.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [groups, searchQuery])

  // Group groups alphabetically by 'name'
  const groupedGroups = useMemo(() => {
    const groupDict: Record<string, any[]> = {};
    if (!Array.isArray(filteredGroups)) return groupDict;
    
    // Sort all groups first
    const sorted = [...filteredGroups].sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });

    sorted.forEach((group) => {
      const name = group.name || "?";
      // Get first letter, capitalized. If not a letter, use '#'
      let firstLetter = name.charAt(0).toUpperCase();
      if (!/[A-Z]/.test(firstLetter)) firstLetter = "#";

      if (!groupDict[firstLetter]) {
        groupDict[firstLetter] = [];
      }
      groupDict[firstLetter].push(group);
    });

    return groupDict;
  }, [filteredGroups]);

  const sortedLetters = Object.keys(groupedGroups).sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden text-chat-text" style={{ background: 'var(--chat-bg-main)' }}>
      {/* Top Bar */}
      <div className="flex items-center px-5 py-4 border-b border-chat-border shrink-0 h-[64px]" style={{ background: 'var(--chat-bg-header)' }}>
        <div className="flex items-center gap-3">
          <Users className="h-[22px] w-[22px] text-chat-text" strokeWidth={2} />
          <h2 className="text-[16px] font-semibold text-chat-text">Danh sách nhóm</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Main Header / Filters Container */}
        <div className="px-6 pt-5 pb-2">
          <h3 className="text-[15px] font-semibold text-chat-text mb-4">Nhóm ({filteredGroups?.length || 0})</h3>
          
          {/* Filters Row */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-[300px]">
              <Search className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-chat-muted" />
              <input
                placeholder="Tìm nhóm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md py-1.5 pl-[32px] pr-3 text-[14px] text-chat-text outline-none placeholder:text-chat-muted transition-all border border-chat-border focus:border-[#0052cc]"
                style={{ background: 'var(--chat-bg-input)' }}
              />
            </div>
            
            <button className="flex items-center gap-6 px-3 py-1.5 rounded-md border border-chat-border text-[13px] text-chat-text hover:bg-chat-hover transition-colors" style={{ background: 'var(--chat-bg-sidebar)' }}>
              <span className="flex items-center gap-2"><ArrowDownUp className="h-4 w-4 text-chat-muted" /> Tên (A - Z)</span>
              <ChevronDown className="h-4 w-4 text-chat-muted" />
            </button>
            <button className="flex items-center gap-6 px-3 py-1.5 rounded-md border border-chat-border text-[13px] text-chat-text hover:bg-chat-hover transition-colors" style={{ background: 'var(--chat-bg-sidebar)' }}>
               <span className="flex items-center gap-2"><Filter className="h-4 w-4 text-chat-muted" /> Tất cả</span>
               <ChevronDown className="h-4 w-4 text-chat-muted" />
            </button>
          </div>
        </div>

        {/* Groups List */}
        <div className="px-6 pb-10">
          {isGroupsLoading ? (
             <div className="text-center py-10 text-chat-muted text-[14px]">Đang tải danh sách nhóm...</div>
          ) : sortedLetters.length > 0 ? (
            sortedLetters.map((letter) => (
              <div key={letter} className="mb-4">
                <div className="text-[14px] font-bold text-chat-text mb-2 ml-2">{letter}</div>
                <div className="flex flex-col">
                  {groupedGroups[letter].map((group) => (
                    <div
                      key={group._id} 
                      className="group flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-chat-hover transition-colors" 
                      onClick={() => { setSelectedUser(group); navigate('/chat'); }}
                    >
                      <div className="flex items-center gap-3">
                        <img src={group.groupPicture || "/group-avatar.png"} alt={group.name} className="w-12 h-12 rounded-full object-cover border border-chat-border" />
                        <div>
                          <h4 className="font-medium text-[15px] text-chat-text group-hover:text-chat-text transition-colors">{group.name}</h4>
                          <p className="text-[13px] text-chat-muted">{group.members?.length || 0} thành viên</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); }} 
                        className="p-1.5 text-chat-muted hover:bg-chat-hover hover:text-chat-text rounded-md opacity-0 group-hover:opacity-100 transition-all mr-2"
                        title="Tùy chọn"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-chat-muted text-[14px]">
              {searchQuery ? "Không tìm thấy nhóm phù hợp." : "Bạn chưa tham gia nhóm nào."}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

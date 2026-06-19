import { useMemo, useState } from "react";
import { Search, Loader, ChevronDown, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";

interface CloudSidebarProps {
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function CloudSidebar({ selectedUserId, onSelectUser, searchQuery, setSearchQuery }: CloudSidebarProps) {
  const { authUser } = useAuthStore();
  const { allContacts, isContactsLoading } = useChatStore();

  const [expandedSections, setExpandedSections] = useState({
    admins: true,
    managers: true,
    sameDept: true,
    otherDept: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const filteredContacts = useMemo(() => {
    return allContacts.filter(contact =>
      contact.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allContacts, searchQuery]);

  const { visibleAdmins, visibleManagers, sameDeptEmployees, otherDeptEmployees } = useMemo(() => {
    if (!authUser) return { visibleAdmins: [], visibleManagers: [], sameDeptEmployees: [], otherDeptEmployees: [] };

    const admins = filteredContacts.filter(c => c.role === 'admin');
    const managers = filteredContacts.filter(c => c.role === 'manager');
    const employees = filteredContacts.filter(c => c.role === 'user');

    let visibleAdmins = admins;
    let visibleManagers = [];
    
    if (authUser.role === 'user') {
      // Employee sees only their department managers
      visibleManagers = managers.filter(m => m.department === authUser.department);
    } else {
      // Manager/Admin sees all managers
      visibleManagers = managers;
    }

    const sameDeptEmployees = employees.filter(e => e.department === authUser.department);
    const otherDeptEmployees = employees.filter(e => e.department !== authUser.department);

    return { visibleAdmins, visibleManagers, sameDeptEmployees, otherDeptEmployees };
  }, [filteredContacts, authUser]);

  const renderContactItem = (contact: any) => (
    <button
      key={contact._id}
      onClick={() => onSelectUser(contact._id)}
      className={`w-full flex items-center gap-3 p-3 rounded-md transition-colors ${
        selectedUserId === contact._id ? "bg-chat-active text-chat-text font-semibold" : "hover:bg-chat-hover text-chat-text/90"
      }`}
    >
      <img src={contact.profilePicture || "/avatar.png"} alt={contact.fullname} className="w-10 h-10 rounded-full object-cover shrink-0" />
      <div className="text-left flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{contact.fullname}</p>
        <p className="text-[12px] text-chat-muted truncate">{contact.email}</p>
      </div>
    </button>
  );

  return (
    <div className="w-[300px] bg-chat-sidebar border-r border-chat-border flex flex-col shrink-0 z-10">
      <div className="p-4 border-b border-chat-border shrink-0">
        <h2 className="text-lg font-bold text-chat-text">Tài liệu Trao đổi</h2>
        <p className="text-[13px] text-chat-muted mt-0.5">Tin nhắn & File</p>
      </div>

      <div className="p-3 border-b border-chat-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-chat-muted" />
          <input
            type="text"
            placeholder="Tìm liên hệ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-chat-main border border-chat-border rounded-md pl-9 pr-3 py-1.5 text-sm text-chat-text focus:outline-none focus:border-[#0052cc]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
        {isContactsLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader className="w-4 h-4 animate-spin text-chat-muted" />
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-4 text-chat-muted text-sm">
            Không có liên hệ
          </div>
        ) : (
          <>
            {/* Section: Admins */}
            <div>
              <button 
                onClick={() => toggleSection('admins')}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-chat-muted hover:text-chat-text uppercase tracking-wider mb-1"
              >
                <span>Quản trị viên (Admin)</span>
                {expandedSections.admins !== false ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {expandedSections.admins !== false && (
                <div className="space-y-1 pl-2">
                  {visibleAdmins.length === 0 ? (
                    <div className="px-2 py-2 text-xs text-chat-muted">Trống</div>
                  ) : (
                    visibleAdmins.map(renderContactItem)
                  )}
                </div>
              )}
            </div>

            {/* Section: Managers */}
            <div>
              <button 
                onClick={() => toggleSection('managers')}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-chat-muted hover:text-chat-text uppercase tracking-wider mb-1"
              >
                <span>Quản lý phòng ban</span>
                {expandedSections.managers ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {expandedSections.managers && (
                <div className="space-y-1 pl-2">
                  {visibleManagers.length === 0 ? (
                    <div className="px-2 py-2 text-xs text-chat-muted">Trống</div>
                  ) : (
                    visibleManagers.map(renderContactItem)
                  )}
                </div>
              )}
            </div>

            {/* Section: Same Dept */}
            <div>
              <button 
                onClick={() => toggleSection('sameDept')}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-chat-muted hover:text-chat-text uppercase tracking-wider mb-1"
              >
                <span>Cùng phòng ban</span>
                {expandedSections.sameDept ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {expandedSections.sameDept && (
                <div className="space-y-1 pl-2">
                  {sameDeptEmployees.length === 0 ? (
                    <div className="px-2 py-2 text-xs text-chat-muted">Trống</div>
                  ) : (
                    sameDeptEmployees.map(renderContactItem)
                  )}
                </div>
              )}
            </div>

            {/* Section: Other Dept */}
            <div>
              <button 
                onClick={() => toggleSection('otherDept')}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-chat-muted hover:text-chat-text uppercase tracking-wider mb-1"
              >
                <span>Khác phòng ban</span>
                {expandedSections.otherDept ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {expandedSections.otherDept && (
                <div className="space-y-1 pl-2">
                  {otherDeptEmployees.length === 0 ? (
                    <div className="px-2 py-2 text-xs text-chat-muted">Trống</div>
                  ) : (
                    otherDeptEmployees.map(renderContactItem)
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

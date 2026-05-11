import { useState } from "react";
import { mockDepartments, mockUsers, mockRoles } from "./data";
import { Button } from "@/components/ui/button";
import { Users as UsersIcon, Edit2, Trash2, Building, Crown, ChevronDown, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function DepartmentManagement() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedDeptId, setExpandedDeptId] = useState<string | null>(null);

  const toggleDept = (id: string) => {
    setExpandedDeptId(expandedDeptId === id ? null : id);
  };

  // Lấy danh sách lãnh đạo (Admin) và trưởng phòng
  const leaders = mockUsers.filter(u => u.roleId === 'r1' || mockDepartments.some(d => d.managerId === u.id));
  const uniqueLeaders = Array.from(new Set(leaders.map(u => u.id))).map(id => leaders.find(u => u.id === id)!);

  return (
    <div className="flex flex-col h-full bg-[#131416]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#2b2d31] flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white">Phòng Ban</h2>
          <p className="text-sm text-[#a1a1a1]">Quản lý cơ cấu tổ chức và nhân sự theo phòng ban</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-[#0052cc] hover:bg-[#0052cc]/90 text-white">
          Thêm Phòng Ban Mới
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Ban Lãnh Đạo & Trưởng Phòng */}
          <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#2b2d31] flex items-center gap-2 bg-[#2b2d31]/20">
              <Crown className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-bold text-white">Ban Lãnh Đạo & Trưởng Phòng</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uniqueLeaders.map(leader => {
                const isManager = mockDepartments.some(d => d.managerId === leader.id);
                return (
                  <div key={`leader-${leader.id}`} className="flex items-center gap-4 p-3 bg-[#131416] border border-[#2b2d31] rounded-lg">
                    <img src={leader.avatar} alt={leader.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 className="font-medium text-white text-[15px]">{leader.name}</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {leader.roleId === 'r1' && <span className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded uppercase font-bold">Lãnh Đạo</span>}
                        {isManager && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded uppercase font-bold">Trưởng Phòng</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Danh sách phòng ban */}
          {mockDepartments.map(dept => {
            const isExpanded = expandedDeptId === dept.id;
            const deptMembers = mockUsers.filter(u => u.departmentId === dept.id);
            const manager = mockUsers.find(u => u.id === dept.managerId);

            return (
              <div key={dept.id} className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl overflow-hidden shadow-sm transition-all duration-200">
                {/* Accordion Header */}
                <div 
                  className="p-5 flex items-center justify-between bg-[#2b2d31]/10 border-b border-[#2b2d31] cursor-pointer hover:bg-[#2b2d31]/30 select-none group"
                  onClick={() => toggleDept(dept.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#2b2d31] flex items-center justify-center shrink-0">
                      <Building className="w-6 h-6 text-[#0052cc]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{dept.name}</h3>
                      <p className="text-sm text-[#a1a1a1] mt-0.5">{dept.description} • {deptMembers.length} nhân sự</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Manager Info (Mini) */}
                    <div className="hidden md:flex items-center gap-3 text-right">
                      <div>
                        <p className="text-[11px] text-[#a1a1a1] font-medium uppercase tracking-wider">Trưởng Phòng</p>
                        <p className="text-sm text-[#e1e1e1] font-medium">{manager?.name || "Trống"}</p>
                      </div>
                      <img src={manager?.avatar || "/avatar.png"} alt={manager?.name} className="w-8 h-8 rounded-full object-cover border border-[#2b2d31]" />
                    </div>

                    <div className="w-[1px] h-8 bg-[#2b2d31] hidden md:block"></div>

                    <div className="flex items-center gap-2">
                      <button className="p-2 text-[#a1a1a1] hover:text-[#0052cc] hover:bg-[#2b2d31] rounded-md transition-colors" title="Chỉnh sửa" onClick={(e) => e.stopPropagation()}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-[#a1a1a1] hover:text-red-500 hover:bg-[#2b2d31] rounded-md transition-colors" title="Xóa" onClick={(e) => e.stopPropagation()}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="p-1 ml-2 text-[#a1a1a1]">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="bg-[#131416]/50 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-[#2b2d31] flex items-center justify-between">
                    <h4 className="font-semibold text-white flex items-center gap-2 text-sm ml-2">
                      <UsersIcon className="w-4 h-4 text-[#a1a1a1]" /> Danh sách nhân sự
                    </h4>
                    <Button variant="outline" size="sm" className="h-8 border-[#2b2d31] text-[#e1e1e1] hover:bg-[#2b2d31]">
                      Thêm nhân sự
                    </Button>
                  </div>
                  
                  <div className="divide-y divide-[#2b2d31]">
                    {deptMembers.map((member) => {
                      const role = mockRoles.find(r => r.id === member.roleId);
                      return (
                        <div key={member.id} className="flex items-center justify-between p-4 hover:bg-[#2b2d31]/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <p className="font-medium text-[#e1e1e1] text-[15px]">
                                {member.name} 
                                {member.id === dept.managerId && (
                                  <span className="ml-2 text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Trưởng phòng</span>
                                )}
                              </p>
                              <p className="text-sm text-[#a1a1a1]">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="px-2.5 py-1 bg-[#2b2d31] text-[#e1e1e1] text-xs font-medium rounded">
                              {role?.name || "N/A"}
                            </span>
                            <button className="text-[#a1a1a1] hover:text-[#0052cc] text-sm font-medium">Chuyển</button>
                          </div>
                        </div>
                      );
                    })}
                    {deptMembers.length === 0 && (
                      <div className="p-8 text-center text-[#a1a1a1] text-sm">
                        Phòng ban này hiện chưa có nhân sự nào.
                      </div>
                    )}
                  </div>
                </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Department Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-[#1e1f22] border-[#2b2d31] text-[#e1e1e1] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Thêm Phòng Ban Mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium text-[#a1a1a1]">Tên phòng ban</label>
              <input 
                id="name" 
                className="bg-[#131416] border border-[#2b2d31] rounded-md p-2 text-white focus:outline-none focus:border-[#0052cc]"
                placeholder="VD: Phòng Marketing"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="desc" className="text-sm font-medium text-[#a1a1a1]">Mô tả</label>
              <textarea 
                id="desc" 
                className="bg-[#131416] border border-[#2b2d31] rounded-md p-2 text-white focus:outline-none focus:border-[#0052cc] h-20 resize-none"
                placeholder="Mô tả chức năng của phòng ban..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="border-[#2b2d31] text-[#e1e1e1] hover:bg-[#2b2d31]">
              Hủy
            </Button>
            <Button onClick={() => setIsAddModalOpen(false)} className="bg-[#0052cc] hover:bg-[#0052cc]/90 text-white">
              Tạo mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

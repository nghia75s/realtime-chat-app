import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Users as UsersIcon, Edit2, Trash2, Building, Crown, ChevronDown, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAdminStore, DEPARTMENTS, ROLE_LABELS } from "@/store/useAdminStore";
import type { AdminUser } from "@/store/useAdminStore";
export default function DepartmentManagement() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedDeptId, setExpandedDeptId] = useState<string | null>(null);

  const { users, fetchUsers } = useAdminStore();

  useEffect(() => {
    // Nếu chưa có users, load trang 1 (có thể truyền limit lớn hơn để lấy full nếu cần)
    if (users.length === 0) {
      fetchUsers(1, 100);
    }
  }, [users.length, fetchUsers]);

  const toggleDept = (deptName: string) => {
    setExpandedDeptId(expandedDeptId === deptName ? null : deptName);
  };

  // Lấy danh sách lãnh đạo (Admin hoặc Giám đốc)
  const leaders = users.filter(u => u.role === 'director');

  // Helper tìm trưởng phòng (người có role cao nhất trong phòng, ưu tiên director > moderator > admin (admin thường là hệ thống))
  const getManager = (deptMembers: AdminUser[]) => {
    if (deptMembers.length === 0) return null;
    const directors = deptMembers.filter(u => u.role === 'director');
    if (directors.length > 0) return directors[0];
    const moderators = deptMembers.filter(u => u.role === 'moderator');
    if (moderators.length > 0) return moderators[0];
    const admins = deptMembers.filter(u => u.role === 'admin');
    if (admins.length > 0) return admins[0];
    return null; // Nếu chỉ có user thường thì ko ai làm trưởng phòng
  };

  return (
    <div className="flex flex-col h-full bg-chat-main">
      {/* Header */}
      <div className="px-6 py-4 border-b border-chat-border flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-chat-text">Phòng Ban</h2>
          <p className="text-sm text-chat-muted">Quản lý cơ cấu tổ chức và nhân sự theo phòng ban</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-[#0052cc] hover:bg-[#0052cc]/90 text-white">
          Thêm Phòng Ban Mới
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Ban Lãnh Đạo & Trưởng Phòng */}
          <div className="bg-chat-sidebar border border-chat-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-chat-border flex items-center gap-2 bg-chat-hover/20">
              <Crown className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-bold text-chat-text">Ban Lãnh Đạo</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaders.length === 0 ? (
                <div className="text-sm text-chat-muted col-span-full">Chưa có lãnh đạo nào.</div>
              ) : (
                leaders.map(leader => (
                  <div key={`leader-${leader._id}`} className="flex items-center gap-4 p-3 bg-chat-main border border-chat-border rounded-lg">
                    <img src={leader.profilePicture || "/avatar.png"} alt={leader.fullname} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 className="font-medium text-chat-text text-[15px]">{leader.fullname}</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded uppercase font-bold">
                          {ROLE_LABELS[leader.role]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Danh sách 7 phòng ban */}
          {DEPARTMENTS.map(deptName => {
            const isExpanded = expandedDeptId === deptName;
            // Những người có department === deptName. Hoặc null/"" sẽ vào "Chưa phân phòng ban"
            const deptMembers = users.filter(u => {
              if (deptName === "Chưa phân phòng ban") {
                return !u.department || u.department === "" || u.department === "Chưa xếp phòng";
              }
              return u.department === deptName;
            });
            const manager = getManager(deptMembers);

            return (
              <div key={deptName} className="bg-chat-sidebar border border-chat-border rounded-xl overflow-hidden shadow-sm transition-all duration-200">
                {/* Accordion Header */}
                <div
                  className="p-5 flex items-center justify-between bg-chat-hover/10 border-b border-chat-border cursor-pointer hover:bg-chat-hover/30 select-none group"
                  onClick={() => toggleDept(deptName)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-chat-hover flex items-center justify-center shrink-0">
                      <Building className="w-6 h-6 text-[#0052cc]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-chat-text">{deptName}</h3>
                      <p className="text-sm text-chat-muted mt-0.5">{deptMembers.length} nhân sự</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Manager Info (Mini) */}
                    <div className="hidden md:flex items-center gap-3 text-right">
                      <div>
                        <p className="text-[11px] text-chat-muted font-medium uppercase tracking-wider">Trưởng Phòng</p>
                        <p className="text-sm text-chat-text font-medium">{manager?.fullname || "Trống"}</p>
                      </div>
                      <img src={manager?.profilePicture || "/avatar.png"} alt={manager?.fullname || "Trống"} className="w-8 h-8 rounded-full object-cover border border-chat-border" />
                    </div>

                    <div className="w-[1px] h-8 bg-chat-border hidden md:block"></div>

                    <div className="flex items-center gap-2">
                      <button className="p-2 text-chat-muted hover:text-[#0052cc] hover:bg-chat-hover rounded-md transition-colors" title="Chỉnh sửa" onClick={(e) => e.stopPropagation()}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-chat-muted hover:text-red-500 hover:bg-chat-hover rounded-md transition-colors" title="Xóa" onClick={(e) => e.stopPropagation()}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="p-1 ml-2 text-chat-muted">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="bg-chat-main/50 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-chat-border flex items-center justify-between">
                      <h4 className="font-semibold text-chat-text flex items-center gap-2 text-sm ml-2">
                        <UsersIcon className="w-4 h-4 text-chat-muted" /> Danh sách nhân sự
                      </h4>
                      <Button variant="outline" size="sm" className="h-8 border-chat-border text-chat-text hover:bg-chat-hover">
                        Thêm nhân sự
                      </Button>
                    </div>

                    <div className="divide-y divide-chat-border">
                      {deptMembers.map((member) => (
                        <div key={member._id} className="flex items-center justify-between p-4 hover:bg-chat-hover/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <img src={member.profilePicture || "/avatar.png"} alt={member.fullname} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <p className="font-medium text-chat-text text-[15px]">
                                {member.fullname}
                                {manager?._id === member._id && (
                                  <span className="ml-2 text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Trưởng phòng</span>
                                )}
                              </p>
                              <p className="text-sm text-chat-muted">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="px-2.5 py-1 bg-chat-hover text-chat-text text-xs font-medium rounded">
                              {ROLE_LABELS[member.role] || "N/A"}
                            </span>
                            <button className="text-chat-muted hover:text-[#0052cc] text-sm font-medium">Chuyển</button>
                          </div>
                        </div>
                      ))}
                      {deptMembers.length === 0 && (
                        <div className="p-8 text-center text-chat-muted text-sm">
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
        <DialogContent className="bg-chat-sidebar border-chat-border text-chat-text sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-chat-text">Thêm Phòng Ban Mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium text-chat-muted">Tên phòng ban</label>
              <input
                id="name"
                className="bg-chat-main border border-chat-border rounded-md p-2 text-chat-text focus:outline-none focus:border-[#0052cc]"
                placeholder="VD: Phòng Marketing"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="desc" className="text-sm font-medium text-chat-muted">Mô tả</label>
              <textarea
                id="desc"
                className="bg-chat-main border border-chat-border rounded-md p-2 text-chat-text focus:outline-none focus:border-[#0052cc] h-20 resize-none"
                placeholder="Mô tả chức năng của phòng ban..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="border-chat-border text-chat-text hover:bg-chat-hover">
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

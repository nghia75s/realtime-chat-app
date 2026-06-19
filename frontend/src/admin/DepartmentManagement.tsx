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
import { useAdminStore, ROLE_LABELS } from "@/store/useAdminStore";
import type { AdminUser, Department } from "@/store/useAdminStore";
import { toast } from "react-hot-toast";

export default function DepartmentManagement() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [expandedDeptId, setExpandedDeptId] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  // Form states
  const [deptName, setDeptName] = useState("");
  const [deptDesc, setDeptDesc] = useState("");
  const [deptManagerId, setDeptManagerId] = useState("");

  const { users, departments, fetchUsers, fetchDepartments, createDepartment, updateDepartmentData, deleteDepartment } = useAdminStore();

  useEffect(() => {
    if (users.length === 0) {
      fetchUsers(1, 100);
    }
    if (departments.length === 0) {
      fetchDepartments();
    }
  }, [users.length, departments.length, fetchUsers, fetchDepartments]);

  const toggleDept = (deptId: string) => {
    setExpandedDeptId(expandedDeptId === deptId ? null : deptId);
  };

  const leaders = users.filter(u => u.role === 'director');

  const getManager = (dept: Department | null, deptMembers: AdminUser[]) => {
    if (dept && dept.managerId) {
      const explicitManager = deptMembers.find(u => u._id === dept.managerId);
      if (explicitManager) return explicitManager;
    }
    if (deptMembers.length === 0) return null;
    const directors = deptMembers.filter(u => u.role === 'director');
    if (directors.length > 0) return directors[0];
    const moderators = deptMembers.filter(u => u.role === 'moderator');
    if (moderators.length > 0) return moderators[0];
    const admins = deptMembers.filter(u => u.role === 'admin');
    if (admins.length > 0) return admins[0];
    return null;
  };

  const handleAddSubmit = async () => {
    if (!deptName.trim()) return toast.error("Vui lòng nhập tên phòng ban");
    try {
      await createDepartment(deptName, deptDesc);
      setIsAddModalOpen(false);
      setDeptName("");
      setDeptDesc("");
    } catch (error) {
      // Error handled in store
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedDept) return;
    if (!deptName.trim()) return toast.error("Vui lòng nhập tên phòng ban");
    try {
      await updateDepartmentData(selectedDept._id, deptName, deptDesc, deptManagerId || null);
      setIsEditModalOpen(false);
      setSelectedDept(null);
    } catch (error) {}
  };

  const handleDeleteSubmit = async () => {
    if (!selectedDept) return;
    try {
      await deleteDepartment(selectedDept._id);
      setIsDeleteModalOpen(false);
      setSelectedDept(null);
    } catch (error) {}
  };

  const openEditModal = (dept: Department, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDept(dept);
    setDeptName(dept.name);
    setDeptDesc(dept.description);
    setDeptManagerId(dept.managerId || "");
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (dept: Department, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDept(dept);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-chat-main">
      <div className="px-6 py-4 border-b border-chat-border flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-chat-text">Phòng Ban</h2>
          <p className="text-sm text-chat-muted">Quản lý cơ cấu tổ chức và nhân sự theo phòng ban</p>
        </div>
        <Button onClick={() => {
          setDeptName(""); setDeptDesc(""); setIsAddModalOpen(true);
        }} className="bg-[#0052cc] hover:bg-[#0052cc]/90 text-white">
          Thêm Phòng Ban Mới
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Ban Lãnh Đạo */}
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

          {/* Danh sách phòng ban */}
          {departments.map(dept => {
            const isExpanded = expandedDeptId === dept._id;
            const deptMembers = users.filter(u => u.department === dept.name);
            const manager = getManager(dept, deptMembers);

            return (
              <div key={dept._id} className="bg-chat-sidebar border border-chat-border rounded-xl overflow-hidden shadow-sm transition-all duration-200">
                <div
                  className="p-5 flex items-center justify-between bg-chat-hover/10 border-b border-chat-border cursor-pointer hover:bg-chat-hover/30 select-none group"
                  onClick={() => toggleDept(dept._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-chat-hover flex items-center justify-center shrink-0">
                      <Building className="w-6 h-6 text-[#0052cc]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-chat-text">{dept.name}</h3>
                      <p className="text-sm text-chat-muted mt-0.5">{deptMembers.length} nhân sự</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-3 text-right">
                      <div>
                        <p className="text-[11px] text-chat-muted font-medium uppercase tracking-wider">Trưởng Phòng</p>
                        <p className="text-sm text-chat-text font-medium">{manager?.fullname || "Trống"}</p>
                      </div>
                      <img src={manager?.profilePicture || "/avatar.png"} alt={manager?.fullname || "Trống"} className="w-8 h-8 rounded-full object-cover border border-chat-border" />
                    </div>

                    <div className="w-[1px] h-8 bg-chat-border hidden md:block"></div>

                    <div className="flex items-center gap-2">
                      <button className="p-2 text-chat-muted hover:text-[#0052cc] hover:bg-chat-hover rounded-md transition-colors" title="Chỉnh sửa" onClick={(e) => openEditModal(dept, e)}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-chat-muted hover:text-red-500 hover:bg-chat-hover rounded-md transition-colors" title="Xóa" onClick={(e) => openDeleteModal(dept, e)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="p-1 ml-2 text-chat-muted">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-chat-main/50 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-chat-border flex items-center justify-between">
                      <h4 className="font-semibold text-chat-text flex items-center gap-2 text-sm ml-2">
                        <UsersIcon className="w-4 h-4 text-chat-muted" /> Danh sách nhân sự
                      </h4>
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
          
          {/* Chưa phân phòng ban */}
          {(() => {
            const unassigned = users.filter(u => !u.department || u.department === "" || u.department === "Chưa xếp phòng" || u.department === "Chưa phân phòng ban");
            if (unassigned.length === 0) return null;
            const isExpanded = expandedDeptId === "unassigned";

            return (
              <div className="bg-chat-sidebar border border-chat-border rounded-xl overflow-hidden shadow-sm transition-all duration-200 opacity-70 mt-6">
                <div
                  className="p-5 flex items-center justify-between bg-chat-hover/10 border-b border-chat-border cursor-pointer hover:bg-chat-hover/30 select-none group"
                  onClick={() => toggleDept("unassigned")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-chat-hover flex items-center justify-center shrink-0">
                      <Building className="w-6 h-6 text-chat-muted" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-chat-text">Chưa phân phòng ban</h3>
                      <p className="text-sm text-chat-muted mt-0.5">{unassigned.length} nhân sự</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1 ml-2 text-chat-muted">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-chat-main/50 animate-in slide-in-from-top-2 duration-200">
                    <div className="divide-y divide-chat-border">
                      {unassigned.map((member) => (
                        <div key={member._id} className="flex items-center justify-between p-4 hover:bg-chat-hover/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <img src={member.profilePicture || "/avatar.png"} alt={member.fullname} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <p className="font-medium text-chat-text text-[15px]">{member.fullname}</p>
                              <p className="text-sm text-chat-muted">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="px-2.5 py-1 bg-chat-hover text-chat-text text-xs font-medium rounded">
                              {ROLE_LABELS[member.role] || "N/A"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

        </div>
      </div>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-chat-sidebar border-chat-border text-chat-text sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-chat-text">Thêm Phòng Ban Mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-chat-muted">Tên phòng ban</label>
              <input
                value={deptName}
                onChange={e => setDeptName(e.target.value)}
                className="bg-chat-main border border-chat-border rounded-md p-2 text-chat-text focus:outline-none focus:border-[#0052cc]"
                placeholder="VD: Phòng Marketing"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-chat-muted">Mô tả</label>
              <textarea
                value={deptDesc}
                onChange={e => setDeptDesc(e.target.value)}
                className="bg-chat-main border border-chat-border rounded-md p-2 text-chat-text focus:outline-none focus:border-[#0052cc] h-20 resize-none"
                placeholder="Mô tả chức năng của phòng ban..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="border-chat-border text-chat-text hover:bg-chat-hover">
              Hủy
            </Button>
            <Button onClick={handleAddSubmit} className="bg-[#0052cc] hover:bg-[#0052cc]/90 text-white">
              Tạo mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-chat-sidebar border-chat-border text-chat-text sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-chat-text">Chỉnh Sửa Phòng Ban</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-chat-muted">Tên phòng ban</label>
              <input
                value={deptName}
                onChange={e => setDeptName(e.target.value)}
                className="bg-chat-main border border-chat-border rounded-md p-2 text-chat-text focus:outline-none focus:border-[#0052cc]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-chat-muted">Mô tả</label>
              <textarea
                value={deptDesc}
                onChange={e => setDeptDesc(e.target.value)}
                className="bg-chat-main border border-chat-border rounded-md p-2 text-chat-text focus:outline-none focus:border-[#0052cc] h-20 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-chat-muted">Trưởng phòng</label>
              <select
                value={deptManagerId}
                onChange={e => setDeptManagerId(e.target.value)}
                className="bg-chat-main border border-chat-border rounded-md p-2 text-chat-text focus:outline-none focus:border-[#0052cc] cursor-pointer"
              >
                <option value="">Chọn tự động (hoặc không có)</option>
                {users.filter(u => u.department === selectedDept?.name).map(u => (
                  <option key={u._id} value={u._id}>{u.fullname}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="border-chat-border text-chat-text hover:bg-chat-hover">
              Hủy
            </Button>
            <Button onClick={handleEditSubmit} className="bg-[#0052cc] hover:bg-[#0052cc]/90 text-white">
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-chat-sidebar border-chat-border text-chat-text sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-chat-text">Xóa Phòng Ban</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-chat-muted">
            Bạn có chắc chắn muốn xóa phòng ban <strong>{selectedDept?.name}</strong> không? Các nhân sự trong phòng ban này sẽ được chuyển thành trạng thái "Chưa phân phòng ban". Hành động này không thể hoàn tác.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="border-chat-border text-chat-text hover:bg-chat-hover">
              Hủy
            </Button>
            <Button onClick={handleDeleteSubmit} className="bg-red-600 hover:bg-red-700 text-white">
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

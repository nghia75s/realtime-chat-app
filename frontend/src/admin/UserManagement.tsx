import { useState, useEffect } from "react"
import { Search, Eye, Users, UserCheck, UserX, ShieldCheck } from "lucide-react"
import { ROLE_COLORS, DEPARTMENTS, useAdminStore } from "@/store/useAdminStore"
import type { AdminUser } from "@/store/useAdminStore"
import UserDetailPanel from "./UserDetailPanel"
import { useAuthStore } from "@/store/useAuthStore"

export default function UserManagement() {
  const { users, stats, pagination, isLoading, fetchUsers, updateUserRole, updateUserDepartment } = useAdminStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null)
  const [updatingDeptId, setUpdatingDeptId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const { onlineUsers } = useAuthStore()

  useEffect(() => {
    fetchUsers(1)
  }, [fetchUsers])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUsers(newPage)
    }
  }

  const handleRoleChange = async (userId: string, newRole: AdminUser["role"]) => {
    setUpdatingRoleId(userId)
    await updateUserRole(userId, newRole)
    if (selectedUser?._id === userId) setSelectedUser(prev => prev ? { ...prev, role: newRole } : null)
    setUpdatingRoleId(null)
  }

  const handleDeptChange = async (userId: string, newDept: string) => {
    setUpdatingDeptId(userId)
    await updateUserDepartment(userId, newDept)
    if (selectedUser?._id === userId) setSelectedUser(prev => prev ? { ...prev, department: newDept } : null)
    setUpdatingDeptId(null)
  }

  const handleUserUpdated = (updated: AdminUser) => {
    // Không cần cập nhật mảng users vì store đã xử lý. Chỉ cần cập nhật selectedUser nếu cần thiết.
    setSelectedUser(updated)
  }

  const filtered = users.filter(u =>
    u.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statCards = stats ? [
    { label: "Tổng người dùng", value: stats.total, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Online", value: onlineUsers.length, icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Bị khoá", value: stats.locked, icon: UserX, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Quản trị viên", value: stats.admins, icon: ShieldCheck, color: "text-purple-400", bg: "bg-purple-500/10" },
  ] : []

  return (
    <div className="flex flex-col h-full bg-chat-main">
      {/* Header */}
      <div className="px-6 py-4 border-b border-chat-border flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-chat-text">Người Dùng</h2>
          <p className="text-sm text-chat-muted">Quản lý danh sách tài khoản trong hệ thống</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-6 custom-scrollbar flex flex-col gap-5 pt-5">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-3 shrink-0">
            {statCards.map((card) => (
              <div key={card.label} className="bg-chat-sidebar border border-chat-border rounded-xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <p className={`text-[22px] font-bold ${card.color}`}>{card.value}</p>
                  <p className="text-[11px] text-chat-muted leading-tight">{card.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search & Pagination */}
        <div className="flex items-center justify-between shrink-0">
          {/* Search */}
          <div className="relative w-[360px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-chat-muted" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-chat-sidebar border border-chat-border rounded-md pl-10 pr-4 py-2 text-sm text-chat-text placeholder:text-chat-muted focus:outline-none focus:border-[#0052cc] transition-colors"
            />
          </div>

          {/* Pagination */}
          {!isLoading && pagination.totalPages > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-xs text-chat-muted">
                Trang {pagination.currentPage} / {pagination.totalPages} ({pagination.totalItems} kết quả)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1.5 text-xs font-medium bg-chat-hover text-chat-text rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-chat-hover/80 transition-colors"
                >
                  Trước
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1.5 text-xs font-medium bg-chat-hover text-chat-text rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-chat-hover/80 transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="border border-chat-border rounded-xl overflow-hidden bg-chat-sidebar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-chat-hover/50 border-b border-chat-border">
                <th className="px-4 py-3 text-xs font-semibold text-chat-muted uppercase tracking-wide">Người Dùng</th>
                <th className="px-4 py-3 text-xs font-semibold text-chat-muted uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-xs font-semibold text-chat-muted uppercase tracking-wide">Phòng Ban</th>
                <th className="px-4 py-3 text-xs font-semibold text-chat-muted uppercase tracking-wide">Vai Trò</th>
                <th className="px-4 py-3 text-xs font-semibold text-chat-muted uppercase tracking-wide">Trạng Thái</th>
                <th className="px-4 py-3 text-xs font-semibold text-chat-muted uppercase tracking-wide w-[60px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-chat-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-chat-hover" /><div className="h-3 w-28 bg-chat-hover rounded" /></div></td>
                    <td className="px-4 py-3"><div className="h-3 w-36 bg-chat-hover rounded" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-24 bg-chat-hover rounded" /></td>
                    <td className="px-4 py-3"><div className="h-6 w-20 bg-chat-hover rounded-full" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-24 bg-chat-hover rounded" /></td>
                    <td className="px-4 py-3"><div className="h-6 w-6 bg-chat-hover rounded" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-chat-muted text-sm">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-chat-hover/30 transition-colors group">
                    {/* Avatar + Tên */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={user.profilePicture || "/avatar.png"} alt={user.fullname} className="w-8 h-8 rounded-full object-cover" />
                          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-chat-sidebar ${onlineUsers.includes(user._id) ? "bg-emerald-500" : "bg-[#4e4f52]"}`} />
                        </div>
                        <span className="font-medium text-chat-text text-sm">{user.fullname}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-sm text-chat-muted">{user.email}</td>

                    {/* Department Select */}
                    <td className="px-4 py-3">
                      <select
                        value={user.department || ""}
                        disabled={updatingDeptId === user._id}
                        onChange={(e) => handleDeptChange(user._id, e.target.value)}
                        className="w-[120px] bg-transparent text-xs font-semibold text-chat-text border cursor-pointer outline-none transition-colors py-1.5 px-2 rounded-full hover:border-chat-border border-transparent focus:border-[#0052cc] disabled:opacity-50"
                      >
                        <option value="" className="bg-chat-sidebar text-chat-text">Chưa xếp phòng</option>
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept} className="bg-chat-sidebar text-chat-text">
                            {dept}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Role Dropdown */}
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        disabled={updatingRoleId === user._id}
                        onChange={(e) => handleRoleChange(user._id, e.target.value as AdminUser["role"])}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border cursor-pointer outline-none transition-opacity disabled:opacity-50 ${ROLE_COLORS[user.role]} bg-transparent`}
                      >
                        <option value="admin" className="bg-chat-sidebar text-chat-text">Admin</option>
                        <option value="director" className="bg-chat-sidebar text-chat-text">Giám Đốc</option>
                        <option value="moderator" className="bg-chat-sidebar text-chat-text">Quản Lý</option>
                        <option value="user" className="bg-chat-sidebar text-chat-text">Nhân Viên</option>
                      </select>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-4 py-3 text-sm">
                      {user.isActive ? (
                        onlineUsers.includes(user._id) ? (
                          <span className="flex items-center gap-1.5 text-emerald-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-chat-muted">
                            <span className="w-1.5 h-1.5 rounded-full bg-chat-muted" /> Ngoại tuyến
                          </span>
                        )
                      ) : (
                        <span className="flex items-center gap-1.5 text-red-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Bị khoá
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedUser(user)}
                        title="Xem chi tiết"
                        className="p-1.5 text-chat-muted hover:text-[#0052cc] hover:bg-[#0052cc]/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedUser && (
        <UserDetailPanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  )
}

import { useState, useEffect } from "react"
import { Search, Eye, Users, UserCheck, UserX, ShieldCheck } from "lucide-react"
import { ROLE_LABELS, ROLE_COLORS, DEPARTMENTS, useAdminStore } from "@/store/useAdminStore"
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
    <div className="flex flex-col h-full bg-[#131416]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#2b2d31] flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white">Người Dùng</h2>
          <p className="text-sm text-[#a1a1a1]">Quản lý danh sách tài khoản trong hệ thống</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-6 custom-scrollbar flex flex-col gap-5 pt-5">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-3 shrink-0">
            {statCards.map((card) => (
              <div key={card.label} className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <p className={`text-[22px] font-bold ${card.color}`}>{card.value}</p>
                  <p className="text-[11px] text-[#717171] leading-tight">{card.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search & Pagination */}
        <div className="flex items-center justify-between shrink-0">
          {/* Search */}
          <div className="relative w-[360px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1a1]" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e1f22] border border-[#2b2d31] rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder:text-[#a1a1a1] focus:outline-none focus:border-[#0052cc] transition-colors"
            />
          </div>

          {/* Pagination */}
          {!isLoading && pagination.totalPages > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#a1a1a1]">
                Trang {pagination.currentPage} / {pagination.totalPages} ({pagination.totalItems} kết quả)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1.5 text-xs font-medium bg-[#2b2d31] text-[#e1e1e1] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a3b3e] transition-colors"
                >
                  Trước
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1.5 text-xs font-medium bg-[#2b2d31] text-[#e1e1e1] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a3b3e] transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="border border-[#2b2d31] rounded-xl overflow-hidden bg-[#1e1f22]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#2b2d31]/50 border-b border-[#2b2d31]">
                <th className="px-4 py-3 text-xs font-semibold text-[#717171] uppercase tracking-wide">Người Dùng</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#717171] uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#717171] uppercase tracking-wide">Phòng Ban</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#717171] uppercase tracking-wide">Vai Trò</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#717171] uppercase tracking-wide">Trạng Thái</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#717171] uppercase tracking-wide w-[60px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b2d31]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-[#2b2d31]" /><div className="h-3 w-28 bg-[#2b2d31] rounded" /></div></td>
                    <td className="px-4 py-3"><div className="h-3 w-36 bg-[#2b2d31] rounded" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-24 bg-[#2b2d31] rounded" /></td>
                    <td className="px-4 py-3"><div className="h-6 w-20 bg-[#2b2d31] rounded-full" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-24 bg-[#2b2d31] rounded" /></td>
                    <td className="px-4 py-3"><div className="h-6 w-6 bg-[#2b2d31] rounded" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[#717171] text-sm">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-[#2b2d31]/30 transition-colors group">
                    {/* Avatar + Tên */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={user.profilePicture || "/avatar.png"} alt={user.fullname} className="w-8 h-8 rounded-full object-cover" />
                          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#1e1f22] ${onlineUsers.includes(user._id) ? "bg-emerald-500" : "bg-[#4e4f52]"}`} />
                        </div>
                        <span className="font-medium text-[#e1e1e1] text-sm">{user.fullname}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-sm text-[#a1a1a1]">{user.email}</td>

                    {/* Department Select */}
                    <td className="px-4 py-3">
                      <select
                        value={user.department || ""}
                        disabled={updatingDeptId === user._id}
                        onChange={(e) => handleDeptChange(user._id, e.target.value)}
                        className="w-[120px] bg-transparent text-xs font-semibold text-[#e1e1e1] border cursor-pointer outline-none transition-colors py-1.5 px-2 rounded-full hover:border-[#2b2d31] border-transparent focus:border-[#0052cc] disabled:opacity-50"
                      >
                        <option value="" className="bg-[#1e1f22] text-white">Chưa xếp phòng</option>
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept} className="bg-[#1e1f22] text-white">
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
                        <option value="admin" className="bg-[#1e1f22] text-white">Admin</option>
                        <option value="director" className="bg-[#1e1f22] text-white">Giám Đốc</option>
                        <option value="moderator" className="bg-[#1e1f22] text-white">Quản Lý</option>
                        <option value="user" className="bg-[#1e1f22] text-white">Nhân Viên</option>
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
                          <span className="flex items-center gap-1.5 text-[#a1a1a1]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#a1a1a1]" /> Ngoại tuyến
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
                        className="p-1.5 text-[#a1a1a1] hover:text-[#0052cc] hover:bg-[#0052cc]/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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

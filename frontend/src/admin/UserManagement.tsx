import { useState } from "react";
import { mockUsers, mockRoles, mockDepartments } from "./data";
import type { User } from "./data";
import { Search, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UserManagement() {
  const [users] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#131416]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#2b2d31] flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white">Người Dùng</h2>
          <p className="text-sm text-[#a1a1a1]">Quản lý danh sách tài khoản trong hệ thống</p>
        </div>
        <Button className="bg-[#0052cc] hover:bg-[#0052cc]/90 text-white">
          Thêm người dùng
        </Button>
      </div>

      {/* Toolbar */}
      <div className="p-6 shrink-0 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1a1]" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1e1f22] border border-[#2b2d31] rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder:text-[#a1a1a1] focus:outline-none focus:border-[#0052cc] transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 pb-6 custom-scrollbar">
        <div className="border border-[#2b2d31] rounded-lg overflow-hidden bg-[#1e1f22]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#2b2d31]/50 border-b border-[#2b2d31]">
                <th className="px-4 py-3 text-sm font-semibold text-[#a1a1a1]">Người Dùng</th>
                <th className="px-4 py-3 text-sm font-semibold text-[#a1a1a1]">Email</th>
                <th className="px-4 py-3 text-sm font-semibold text-[#a1a1a1]">Vai Trò</th>
                <th className="px-4 py-3 text-sm font-semibold text-[#a1a1a1]">Phòng Ban</th>
                <th className="px-4 py-3 text-sm font-semibold text-[#a1a1a1]">Trạng Thái</th>
                <th className="px-4 py-3 text-sm font-semibold text-[#a1a1a1] w-[80px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b2d31]">
              {filteredUsers.map((user) => {
                const role = mockRoles.find((r) => r.id === user.roleId);
                const dept = mockDepartments.find((d) => d.id === user.departmentId);

                return (
                  <tr key={user.id} className="hover:bg-[#2b2d31]/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                        <span className="font-medium text-[#e1e1e1]">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#a1a1a1]">{user.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-[#2b2d31] rounded text-[#e1e1e1] text-xs font-medium">
                        {role?.name || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#a1a1a1]">{dept?.name || "N/A"}</td>
                    <td className="px-4 py-3 text-sm">
                      {user.isActive ? (
                        <span className="flex items-center gap-1.5 text-emerald-500">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Đang hoạt động
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[#a1a1a1]">
                          <span className="w-2 h-2 rounded-full bg-[#a1a1a1]"></span> Bị khóa
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-[#a1a1a1] hover:text-[#0052cc] transition-colors rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-[#a1a1a1] hover:text-red-500 transition-colors rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-[#a1a1a1]">
              Không tìm thấy người dùng nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

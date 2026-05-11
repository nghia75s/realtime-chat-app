import { useState } from "react";
import { mockRoles } from "./data";
import type { Role } from "./data";
import { Button } from "@/components/ui/button";

const PERMISSION_LABELS: Record<keyof Role['permissions'], string> = {
  viewUsers: "Xem danh sách người dùng",
  editUsers: "Sửa/Xóa người dùng",
  viewTasks: "Xem Task hệ thống",
  editTasks: "Chỉnh sửa Task",
  approveTasks: "Duyệt/Từ chối Task",
  viewChat: "Sử dụng tính năng Chat",
};

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);

  const handleTogglePermission = (roleId: string, permKey: keyof Role['permissions']) => {
    setRoles(roles.map(role => {
      if (role.id === roleId) {
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [permKey]: !role.permissions[permKey]
          }
        };
      }
      return role;
    }));
  };

  return (
    <div className="flex flex-col h-full bg-[#131416]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#2b2d31] flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white">Phân Quyền (RBAC)</h2>
          <p className="text-sm text-[#a1a1a1]">Cấu hình quyền hạn sâu cho từng vai trò trong hệ thống</p>
        </div>
        <Button className="bg-[#0052cc] hover:bg-[#0052cc]/90 text-white">
          Thêm Vai Trò Mới
        </Button>
      </div>

      {/* Matrix Table */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        <div className="border border-[#2b2d31] rounded-lg overflow-hidden bg-[#1e1f22]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#2b2d31]/50 border-b border-[#2b2d31]">
                <th className="px-4 py-3 text-sm font-semibold text-[#a1a1a1] w-[250px]">Quyền Hạn \ Vai Trò</th>
                {roles.map(role => (
                  <th key={role.id} className="px-4 py-3 text-sm font-semibold text-white text-center border-l border-[#2b2d31]/50">
                    <div className="flex flex-col items-center gap-1">
                      <span>{role.name}</span>
                      <span className="text-xs text-[#a1a1a1] font-normal">{role.description}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b2d31]">
              {(Object.keys(PERMISSION_LABELS) as Array<keyof Role['permissions']>).map((permKey) => (
                <tr key={permKey} className="hover:bg-[#2b2d31]/30 transition-colors">
                  <td className="px-4 py-4 text-sm text-[#e1e1e1] font-medium">
                    {PERMISSION_LABELS[permKey]}
                  </td>
                  {roles.map(role => (
                    <td key={`${role.id}-${permKey}`} className="px-4 py-4 text-center border-l border-[#2b2d31]/50">
                      <button
                        onClick={() => handleTogglePermission(role.id, permKey)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                          role.permissions[permKey] ? "bg-[#0052cc]" : "bg-[#2b2d31]"
                        }`}
                      >
                        <span
                          className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                            role.permissions[permKey] ? "translate-x-2" : "-translate-x-2"
                          }`}
                        />
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

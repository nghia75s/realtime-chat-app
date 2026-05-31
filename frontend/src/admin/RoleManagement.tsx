import { useEffect } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import type { Role } from "@/store/useAdminStore";
import { Button } from "@/components/ui/button";

const PERMISSION_LABELS: Record<keyof Role['permissions'], string> = {
  viewChat: "Sử dụng tính năng Chat",
  viewContacts: "Xem danh sách người dùng",
  viewTasks: "Xem Task hệ thống",
  editTasks: "Chỉnh sửa Task",
  approveTasks: "Duyệt/Từ chối Task",
  viewCloud: "Sử dụng Cloud của tôi",
  viewTools: "Sử dụng Công cụ",
  viewAdmin: "Truy cập Quản trị Admin",
};

export default function RoleManagement() {
  const { roles, fetchRoles, updateRolePermissions } = useAdminStore();

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleTogglePermission = async (roleId: string, permKey: keyof Role['permissions']) => {
    const role = roles.find(r => r.id === roleId);
    if (role) {
      const newValue = !role.permissions[permKey];
      await updateRolePermissions(roleId, { [permKey]: newValue });
    }
  };

  return (
    <div className="flex flex-col h-full bg-chat-main">
      {/* Header */}
      <div className="px-6 py-4 border-b border-chat-border flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-chat-text">Phân Quyền (RBAC)</h2>
          <p className="text-sm text-chat-muted">Cấu hình quyền hạn sâu cho từng vai trò trong hệ thống</p>
        </div>
        <Button className="bg-[#0052cc] hover:bg-[#0052cc]/90 text-white">
          Thêm Vai Trò Mới
        </Button>
      </div>

      {/* Matrix Table */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        <div className="border border-chat-border rounded-lg overflow-hidden bg-chat-sidebar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-chat-hover/50 border-b border-chat-border">
                <th className="px-4 py-3 text-sm font-semibold text-chat-muted w-[250px]">Quyền Hạn \ Vai Trò</th>
                {roles.map(role => (
                  <th key={role.id} className="px-4 py-3 text-sm font-semibold text-chat-text text-center border-l border-chat-border/50">
                    <div className="flex flex-col items-center gap-1">
                      <span>{role.name}</span>
                      <span className="text-xs text-chat-muted font-normal">{role.description}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-chat-border">
              {(Object.keys(PERMISSION_LABELS) as Array<keyof Role['permissions']>).map((permKey) => (
                <tr key={permKey} className="hover:bg-chat-hover/30 transition-colors">
                  <td className="px-4 py-4 text-sm text-chat-text font-medium">
                    {PERMISSION_LABELS[permKey]}
                  </td>
                  {roles.map(role => (
                    <td key={`${role.id}-${permKey}`} className="px-4 py-4 text-center border-l border-chat-border/50">
                      <button
                        onClick={() => handleTogglePermission(role.id, permKey)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${role.permissions[permKey] ? "bg-[#0052cc]" : "bg-chat-hover"
                          }`}
                      >
                        <span
                          className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${role.permissions[permKey] ? "translate-x-2" : "-translate-x-2"
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

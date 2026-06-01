import { useState } from "react";
import { PrimarySidebar } from "../cchat/sidebar/PrimarySidebar";
import UserManagement from "./UserManagement";
import RoleManagement from "./RoleManagement";
import DepartmentManagement from "./DepartmentManagement";
import { Users, Shield, Building2 } from "lucide-react";

type AdminTab = "users" | "roles" | "departments";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("users");

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <UserManagement />;
      case "roles":
        return <RoleManagement />;
      case "departments":
        return <DepartmentManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-chat-main text-chat-text font-sans">
      <PrimarySidebar activeTab="admin" />

      {/* Admin Sidebar */}
      <div className="w-[280px] bg-chat-sidebar border-r border-chat-border flex flex-col shrink-0">
        <div className="p-4 border-b border-chat-border shrink-0">
          <h2 className="text-xl font-bold text-chat-text">Quản Trị Hệ Thống</h2>
          <p className="text-xs text-chat-muted mt-1">Quản lý tài khoản, phân quyền & phòng ban</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activeTab === "users" ? "bg-chat-hover text-chat-text font-medium" : "text-chat-muted hover:bg-chat-hover/50 hover:text-chat-text"
              }`}
          >
            <Users className="w-5 h-5" />
            <span>Người dùng</span>
          </button>

          <button
            onClick={() => setActiveTab("roles")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activeTab === "roles" ? "bg-chat-hover text-chat-text font-medium" : "text-chat-muted hover:bg-chat-hover/50 hover:text-chat-text"
              }`}
          >
            <Shield className="w-5 h-5" />
            <span>Phân quyền (RBAC)</span>
          </button>

          <button
            onClick={() => setActiveTab("departments")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activeTab === "departments" ? "bg-chat-hover text-chat-text font-medium" : "text-chat-muted hover:bg-chat-hover/50 hover:text-chat-text"
              }`}
          >
            <Building2 className="w-5 h-5" />
            <span>Phòng ban</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
}

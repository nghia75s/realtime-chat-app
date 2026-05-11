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
    <div className="flex h-screen w-screen overflow-hidden bg-[#131416] text-[#e1e1e1] font-sans">
      <PrimarySidebar activeTab="admin" />

      {/* Admin Sidebar */}
      <div className="w-[280px] bg-[#1e1f22] border-r border-[#2b2d31] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#2b2d31] shrink-0">
          <h2 className="text-xl font-bold text-white">Quản Trị Hệ Thống</h2>
          <p className="text-xs text-[#a1a1a1] mt-1">Quản lý tài khoản, phân quyền & phòng ban</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activeTab === "users" ? "bg-[#2b2d31] text-white font-medium" : "text-[#a1a1a1] hover:bg-[#2b2d31]/50 hover:text-[#e1e1e1]"
              }`}
          >
            <Users className="w-5 h-5" />
            <span>Người dùng</span>
          </button>

          <button
            onClick={() => setActiveTab("roles")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activeTab === "roles" ? "bg-[#2b2d31] text-white font-medium" : "text-[#a1a1a1] hover:bg-[#2b2d31]/50 hover:text-[#e1e1e1]"
              }`}
          >
            <Shield className="w-5 h-5" />
            <span>Phân quyền (RBAC)</span>
          </button>

          <button
            onClick={() => setActiveTab("departments")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activeTab === "departments" ? "bg-[#2b2d31] text-white font-medium" : "text-[#a1a1a1] hover:bg-[#2b2d31]/50 hover:text-[#e1e1e1]"
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

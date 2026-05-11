import { Bell } from "lucide-react"
import type { Role } from "./data"

interface TaskHeaderProps {
  role: Role;
  setRole: (role: Role) => void;
}

export function TaskHeader({ role, setRole }: TaskHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[#1e1f22] border-b border-[#2b2d31] shrink-0 h-[64px]">
      <h2 className="text-[17px] font-semibold text-white">Quản lý công việc</h2>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setRole(null)} 
          className="text-[13px] text-[#a1a1a1] hover:text-white underline mr-2"
        >
            [{role === 'manager' ? "Quản lý" : "Nhân viên"}] Đổi Role
        </button>
        <button className="relative p-2 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[#1e1f22]"></span>
        </button>
        <img 
          src={role === 'manager' ? "/avatars/me.png" : "/avatar.png"} 
          alt="Avatar" 
          className="w-9 h-9 rounded-full object-cover border border-[#2b2d31]" 
        />
      </div>
    </div>
  )
}

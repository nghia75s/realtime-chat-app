import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { X, Pencil, Camera } from "lucide-react"

export const ProfileView = ({ onViewChange, onClose }: any) => {
  return (
    <div className="flex flex-col w-full min-h-[500px] h-full relative animate-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 shrink-0 z-10 bg-white">
        <h2 className="text-[16px] font-semibold text-zinc-900">Thông tin tài khoản</h2>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors"><X className="w-5 h-5 text-zinc-500" /></button>
      </div>

      {/* Cover Profile */}
      <div className="relative w-full h-[160px] bg-zinc-200 shrink-0 group">
        <img src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Cover" />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* Avatar Section */}
      <div className="px-4 relative flex flex-col -mt-10 mb-4 shrink-0">
        <div className="flex items-end gap-3">
          <div className="relative group/avatar cursor-pointer" onClick={() => onViewChange("edit-avatar")}>
            <Avatar className="w-[76px] h-[76px] border-4 border-white shadow-sm ring-1 ring-zinc-200">
              <AvatarImage src="/avatars/me.png" />
              <AvatarFallback>Dat</AvatarFallback>
            </Avatar>
            {/* Camera icon button */}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#f5f6f8] rounded-full border-[1.5px] border-white flex items-center justify-center hover:bg-zinc-200 transition-colors shadow-sm">
              <Camera className="w-[15px] h-[15px] text-zinc-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2 group/name cursor-pointer" onClick={() => onViewChange("edit-profile")}>
            <h3 className="text-[18px] font-semibold text-zinc-900 pb-0.5">Nguyễn Tiến Đạt</h3>
            <Pencil className="w-[14px] h-[14px] text-zinc-400 group-hover/name:text-[#005AE0] transition-colors" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Scrollable Details */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
        <div className="bg-white border border-zinc-200 rounded-lg p-3 px-4 shadow-sm">
          <h4 className="text-[15px] font-bold text-zinc-800 mb-3 border-b border-zinc-100 pb-2">Thông tin cá nhân</h4>
          <div className="flex flex-col gap-3.5 text-[14px] pt-1">
            <div className="grid grid-cols-[100px_1fr] items-start">
              <span className="text-zinc-500 font-medium">Giới tính</span>
              <span className="text-zinc-900 font-medium">Nam</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-start">
              <span className="text-zinc-500 font-medium">Ngày sinh</span>
              <span className="text-zinc-900 font-medium">23 tháng 10, 2005</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-start">
              <span className="text-zinc-500 font-medium">Điện thoại</span>
              <span className="text-zinc-900 font-medium">+84 586 724 620</span>
            </div>
            <div className="border-t border-zinc-100 my-0 pt-3 grid grid-cols-[100px_1fr] items-start">
              <span className="text-zinc-500 font-medium">Phòng ban</span>
              <span className="text-[#005AE0] font-semibold bg-[#e5efff] w-max px-2 py-0.5 rounded text-[13px]">Phòng ban IT</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-start">
              <span className="text-zinc-500 font-medium">Chức vụ</span>
              <span className="text-zinc-900 font-medium">Nhân viên</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Update Button */}
      <div className="px-4 py-3 border-t border-zinc-200 bg-white shrink-0">
        <Button variant="outline" className="w-full h-10 flex items-center justify-center gap-2 border-zinc-300 font-bold hover:bg-zinc-50 text-[14px] hover:text-[#005AE0]" onClick={() => onViewChange("edit-profile")}>
          <Pencil className="w-[14px] h-[14px]" /> Cập nhật
        </Button>
      </div>

    </div>
  )
}

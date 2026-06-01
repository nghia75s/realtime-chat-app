import { Mail, Calendar, Shield, Lock, Phone, User as UserIcon, Building } from "lucide-react"
import type { AdminUser } from "@/store/useAdminStore"
import { ROLE_LABELS } from "@/store/useAdminStore"

interface UserDetailViewProps {
  user: AdminUser;
  formatDate: (dateStr: string) => string;
}

export function UserDetailView({ user, formatDate }: UserDetailViewProps) {
  return (
    <div className="px-5 py-5 flex flex-col gap-4 animate-in fade-in duration-200">
      {/* Email */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-chat-hover flex items-center justify-center shrink-0">
          <Mail className="w-4 h-4 text-chat-muted" />
        </div>
        <div>
          <p className="text-[11px] text-chat-muted mb-0.5">Email</p>
          <p className="text-[14px] text-chat-text">{user.email}</p>
        </div>
      </div>

      {/* Vai trò */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-chat-hover flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-chat-muted" />
        </div>
        <div>
          <p className="text-[11px] text-chat-muted mb-0.5">Vai trò</p>
          <p className="text-[14px] text-chat-text">{ROLE_LABELS[user.role]}</p>
        </div>
      </div>

      {/* Số điện thoại */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-chat-hover flex items-center justify-center shrink-0">
          <Phone className="w-4 h-4 text-chat-muted" />
        </div>
        <div>
          <p className="text-[11px] text-chat-muted mb-0.5">Số điện thoại</p>
          <p className="text-[14px] text-chat-text">{user.phoneNumber || "Chưa cập nhật"}</p>
        </div>
      </div>

      {/* Tuổi */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-chat-hover flex items-center justify-center shrink-0">
          <Calendar className="w-4 h-4 text-chat-muted" />
        </div>
        <div>
          <p className="text-[11px] text-chat-muted mb-0.5">Tuổi</p>
          <p className="text-[14px] text-chat-text">{user.age || "Chưa cập nhật"}</p>
        </div>
      </div>

      {/* Giới tính */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-chat-hover flex items-center justify-center shrink-0">
          <UserIcon className="w-4 h-4 text-chat-muted" />
        </div>
        <div>
          <p className="text-[11px] text-chat-muted mb-0.5">Giới tính</p>
          <p className="text-[14px] text-chat-text">{user.gender || "Chưa cập nhật"}</p>
        </div>
      </div>

      {/* Ngày sinh */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-chat-hover flex items-center justify-center shrink-0">
          <Calendar className="w-4 h-4 text-chat-muted" />
        </div>
        <div>
          <p className="text-[11px] text-chat-muted mb-0.5">Ngày sinh</p>
          <p className="text-[14px] text-chat-text">{user.dateOfBirth || "Chưa cập nhật"}</p>
        </div>
      </div>

      {/* Phòng ban */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-chat-hover flex items-center justify-center shrink-0">
          <Building className="w-4 h-4 text-chat-muted" />
        </div>
        <div>
          <p className="text-[11px] text-chat-muted mb-0.5">Phòng ban</p>
          <p className="text-[14px] text-chat-text">{user.department || "Chưa xếp phòng"}</p>
        </div>
      </div>

      {/* Ngày tham gia */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-chat-hover flex items-center justify-center shrink-0">
          <Calendar className="w-4 h-4 text-chat-muted" />
        </div>
        <div>
          <p className="text-[11px] text-chat-muted mb-0.5">Ngày tham gia</p>
          <p className="text-[14px] text-chat-text">{formatDate(user.createdAt)}</p>
        </div>
      </div>

      {/* Trạng thái */}
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${user.isActive ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
          <Lock className="w-4 h-4 text-chat-muted" />
        </div>
        <div>
          <p className="text-[11px] text-chat-muted mb-0.5">Trạng thái</p>
          <p className={`text-[14px] font-medium ${user.isActive ? "text-emerald-400" : "text-red-400"}`}>
            {user.isActive ? "Đang hoạt động" : "Bị khoá"}
          </p>
        </div>
      </div>
    </div>
  );
}

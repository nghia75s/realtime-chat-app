import React, { useState, useRef } from "react"
import { Mail, Calendar, Phone, User as UserIcon, Camera, Save, Building } from "lucide-react"
import { toast } from "react-hot-toast"
import type { AdminUser } from "@/store/useAdminStore"
import { DEPARTMENTS } from "@/store/useAdminStore"

export interface EditUserFields {
  fullname: string;
  email: string;
  age?: number;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  department?: string;
  profilePicture?: string;
}

interface UserDetailEditProps {
  user: AdminUser;
  onSave: (fields: EditUserFields) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function UserDetailEdit({ user, onSave, onCancel, isLoading }: UserDetailEditProps) {
  const [fullname, setFullname] = useState(user.fullname)
  const [email, setEmail] = useState(user.email)
  const [age, setAge] = useState(user.age ? String(user.age) : "")
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "")
  const [gender, setGender] = useState(user.gender || "")
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || "")
  const [department, setDepartment] = useState(user.department || "")
  const [profilePicture, setProfilePicture] = useState("") // base64 preview

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không quá 5MB");
      return;
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePicture(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveClick = async () => {
    if (!fullname.trim()) {
      toast.error("Họ tên không được để trống")
      return
    }
    if (!email.trim()) {
      toast.error("Email không được để trống")
      return
    }

    await onSave({
      fullname,
      email,
      age: age ? Number(age) : undefined,
      phoneNumber,
      gender,
      dateOfBirth,
      department,
      profilePicture: profilePicture || undefined
    })
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden animate-in fade-in duration-200">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Avatar Section */}
        <div className="flex flex-col items-center pt-8 pb-6 px-5 border-b border-[#2b2d31]">
          <div className="relative mb-4 group cursor-pointer">
            <div 
              onClick={() => fileInputRef.current?.click()}
              title="Đổi ảnh đại diện"
              className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#2b2d31] hover:border-indigo-500 transition-all shadow-lg active:scale-95"
            >
              <img
                src={profilePicture || user.profilePicture || "/avatar.png"}
                alt={fullname}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-indigo-400 mb-1" />
                <span className="text-[8px] text-[#e1e1e1] font-semibold">Đổi ảnh</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <h2 className="text-[18px] font-bold text-white mb-1">{fullname || user.fullname}</h2>
        </div>

        {/* Inputs */}
        <div className="px-5 py-5 flex flex-col gap-4">
          {/* Họ và tên */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium text-[#717171] uppercase tracking-wider">Họ và tên</label>
            <div className="flex items-center gap-2.5 bg-[#131416] border border-[#2b2d31] rounded-lg px-3 py-2 focus-within:border-indigo-500 transition-colors">
              <UserIcon className="w-4 h-4 text-[#717171]" />
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-white w-full focus:ring-0"
                placeholder="Nhập họ và tên..."
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium text-[#717171] uppercase tracking-wider">Email</label>
            <div className="flex items-center gap-2.5 bg-[#131416] border border-[#2b2d31] rounded-lg px-3 py-2 focus-within:border-indigo-500 transition-colors">
              <Mail className="w-4 h-4 text-[#717171]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-white w-full focus:ring-0"
                placeholder="Nhập email..."
              />
            </div>
          </div>

          {/* Số điện thoại */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium text-[#717171] uppercase tracking-wider">Số điện thoại</label>
            <div className="flex items-center gap-2.5 bg-[#131416] border border-[#2b2d31] rounded-lg px-3 py-2 focus-within:border-indigo-500 transition-colors">
              <Phone className="w-4 h-4 text-[#717171]" />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-white w-full focus:ring-0"
                placeholder="Nhập số điện thoại..."
              />
            </div>
          </div>

          {/* Tuổi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium text-[#717171] uppercase tracking-wider">Tuổi</label>
            <div className="flex items-center gap-2.5 bg-[#131416] border border-[#2b2d31] rounded-lg px-3 py-2 focus-within:border-indigo-500 transition-colors">
              <Calendar className="w-4 h-4 text-[#717171]" />
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-white w-full focus:ring-0"
                placeholder="Nhập tuổi..."
              />
            </div>
          </div>

          {/* Giới tính */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium text-[#717171] uppercase tracking-wider">Giới tính</label>
            <div className="flex items-center gap-2.5 bg-[#131416] border border-[#2b2d31] rounded-lg px-3 py-2 focus-within:border-indigo-500 transition-colors">
              <UserIcon className="w-4 h-4 text-[#717171]" />
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="bg-[#131416] border-none outline-none text-sm text-white w-full cursor-pointer focus:ring-0"
              >
                <option value="" className="bg-[#1e1f22]">Chưa chọn</option>
                <option value="Nam" className="bg-[#1e1f22]">Nam</option>
                <option value="Nữ" className="bg-[#1e1f22]">Nữ</option>
                <option value="Khác" className="bg-[#1e1f22]">Khác</option>
              </select>
            </div>
          </div>

          {/* Ngày sinh */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium text-[#717171] uppercase tracking-wider">Ngày sinh</label>
            <div className="flex items-center gap-2.5 bg-[#131416] border border-[#2b2d31] rounded-lg px-3 py-2 focus-within:border-indigo-500 transition-colors">
              <Calendar className="w-4 h-4 text-[#717171]" />
              <input
                type="text"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-white w-full focus:ring-0"
                placeholder="Ví dụ: 23 tháng 10, 2005"
              />
            </div>
          </div>

          {/* Phòng ban */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium text-[#717171] uppercase tracking-wider">Phòng ban</label>
            <div className="flex items-center gap-2.5 bg-[#131416] border border-[#2b2d31] rounded-lg px-3 py-2 focus-within:border-indigo-500 transition-colors">
              <Building className="w-4 h-4 text-[#717171]" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="bg-[#131416] border-none outline-none text-sm text-white w-full cursor-pointer focus:ring-0"
              >
                <option value="" className="bg-[#1e1f22]">Chưa xếp phòng</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-[#1e1f22]">{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="p-5 border-t border-[#2b2d31] shrink-0 flex gap-2">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-[#2b2d31] hover:bg-[#3a3b3e] text-[#a1a1a1] hover:text-white font-semibold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Huỷ
        </button>
        <button
          onClick={handleSaveClick}
          disabled={isLoading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}

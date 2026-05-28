import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, X, Users, Loader2 } from "lucide-react"
import { useChatStore } from "@/store/useChatStore"
import { toast } from "react-hot-toast"

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: any;
}

export function EditGroupModal({ isOpen, onClose, chat }: EditGroupModalProps) {
  const { updateGroupSettings, setSelectedUser } = useChatStore()
  
  const [name, setName] = useState(chat?.name || "")
  const [selectedImg, setSelectedImg] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) { // 2MB
      toast.error("Vui lòng chọn ảnh có dung lượng nhỏ hơn 2MB")
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const base64Image = reader.result as string
      setSelectedImg(base64Image)
    }
  }

  const handleUpdate = async () => {
    if (!name.trim()) {
      toast.error("Tên nhóm không được để trống")
      return
    }

    setIsUpdating(true)
    try {
      const updateData: any = { name }
      if (selectedImg) {
        updateData.groupPicture = selectedImg
      }
      
      const updatedGroup = await updateGroupSettings(chat._id, updateData)
      setSelectedUser({ ...updatedGroup, isGroup: true })
      toast.success("Cập nhật thông tin nhóm thành công")
      onClose()
    } catch (error) {
      console.error(error)
      toast.error("Lỗi khi cập nhật thông tin")
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isOpen || !chat) return null

  const previewImage = selectedImg || chat.groupPicture || "/group.png"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="[&>button]:hidden bg-white border border-[#E5E7EB] text-[#111827] !w-[440px] rounded-2xl p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
          <DialogTitle className="text-[16px] font-bold text-[#111827] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1877F2]" />
            Đổi thông tin nhóm
          </DialogTitle>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors p-1.5 hover:bg-[#E5E7EB] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 flex flex-col items-center gap-6">
          {/* Avatar Upload */}
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img 
              src={previewImage} 
              alt="Group Avatar" 
              className="w-24 h-24 rounded-full object-cover border-2 border-[#E5E7EB] group-hover:border-[#1877F2] transition-colors"
            />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#1877F2] rounded-full flex items-center justify-center border-2 border-white shadow-md group-hover:bg-[#166FE5] transition-colors">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange}
            />
          </div>

          {/* Name Input */}
          <div className="w-full">
            <label className="block text-[13px] font-medium text-[#4B5563] mb-1.5">Tên nhóm</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên nhóm mới..."
              className="w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-2.5 text-[14px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-white border border-[#D1D5DB] text-[#374151] hover:bg-[#F3F4F6] transition-colors text-[14px] font-medium">
            Hủy
          </button>
          <button 
            onClick={handleUpdate} 
            disabled={!name.trim() || isUpdating}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1877F2] text-white hover:bg-[#166FE5] transition-colors text-[14px] font-medium disabled:opacity-50 shadow-md shadow-[#1877F2]/20"
          >
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BellOff, X } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"

interface MuteNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: any;
}

export function MuteNotificationModal({ isOpen, onClose, chat }: MuteNotificationModalProps) {
  const { muteChat } = useAuthStore()
  
  const [selectedOption, setSelectedOption] = useState<string>("1h")
  const [isUpdating, setIsUpdating] = useState(false)

  const handleMute = async () => {
    setIsUpdating(true)
    try {
      let mutedUntil: string | null = null;
      const now = new Date();

      switch (selectedOption) {
        case "1h":
          now.setHours(now.getHours() + 1);
          mutedUntil = now.toISOString();
          break;
        case "4h":
          now.setHours(now.getHours() + 4);
          mutedUntil = now.toISOString();
          break;
        case "8am":
          // Set to 8:00 AM tomorrow
          now.setDate(now.getDate() + 1);
          now.setHours(8, 0, 0, 0);
          mutedUntil = now.toISOString();
          break;
        case "forever":
          mutedUntil = null; // Infinite mute
          break;
      }

      await muteChat(chat._id, mutedUntil)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isOpen || !chat) return null

  const options = [
    { id: "1h", label: "Trong 1 giờ" },
    { id: "4h", label: "Trong 4 giờ" },
    { id: "8am", label: "Cho đến 8:00 AM" },
    { id: "forever", label: "Cho đến khi được mở lại" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="[&>button]:hidden bg-white border border-[#E5E7EB] text-[#111827] !w-[400px] rounded-2xl p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <DialogTitle className="text-[16px] font-bold text-[#111827] flex items-center gap-2">
            <BellOff className="w-5 h-5 text-[#4B5563]" />
            Tắt thông báo
          </DialogTitle>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors p-1.5 hover:bg-[#F3F4F6] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-[14px] text-[#4B5563] mb-4">
            Bạn có chắc muốn tắt thông báo hội thoại này:
          </p>
          
          <div className="flex flex-col gap-3">
            {options.map((opt) => (
              <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedOption === opt.id ? 'border-[#1877F2]' : 'border-[#D1D5DB] group-hover:border-[#9CA3AF]'}`}>
                  {selectedOption === opt.id && (
                    <div className="w-2.5 h-2.5 bg-[#1877F2] rounded-full" />
                  )}
                </div>
                <span className="text-[14px] text-[#374151]">{opt.label}</span>
                <input 
                  type="radio" 
                  name="muteOption" 
                  className="hidden" 
                  checked={selectedOption === opt.id}
                  onChange={() => setSelectedOption(opt.id)}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-md bg-[#E5E7EB] text-[#374151] hover:bg-[#D1D5DB] transition-colors text-[14px] font-medium">
            Hủy
          </button>
          <button 
            onClick={handleMute} 
            disabled={isUpdating}
            className="px-6 py-2.5 rounded-md bg-[#1877F2] text-white hover:bg-[#166FE5] transition-colors text-[14px] font-medium disabled:opacity-50"
          >
            {isUpdating ? "Đang xử lý..." : "Đồng ý"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

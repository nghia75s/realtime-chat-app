import { useState } from "react"
import { ChevronLeft, LogOut, Check, Ban, Crown, Link as LinkIcon } from "lucide-react"
import { useChatStore } from "@/store/useChatStore"
import { useAuthStore } from "@/store/useAuthStore"
import { toast } from "react-hot-toast"

interface GroupManagementPanelProps {
  chat: any;
  onBack: () => void;
}

export function GroupManagementPanel({ chat, onBack }: GroupManagementPanelProps) {
  const { updateGroupSettings } = useChatStore()
  const { authUser } = useAuthStore()
  
  const creatorId = typeof chat.createdBy === "string" ? chat.createdBy : chat.createdBy?._id
  const isCreator = authUser?._id === creatorId
  
  // Lấy cài đặt mặc định hoặc từ dữ liệu nhóm
  const defaultSettings = {
    memberPermissions: {
      changeNameAndAvatar: true,
      pinMessages: true,
      createNotes: true,
      createPolls: true,
      sendMessages: true
    },
    joinApprovalMode: false,
    highlightAdminMessages: true,
    readRecentMessages: true,
    allowJoinLink: false
  }

  const currentSettings = chat.settings || defaultSettings
  const [settings, setSettings] = useState(currentSettings)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async (newSettings: any) => {
    setSettings(newSettings)
    setIsUpdating(true)
    try {
      await updateGroupSettings(chat._id, newSettings)
    } catch (error) {
      // Revert if error
      setSettings(currentSettings)
    } finally {
      setIsUpdating(false)
    }
  }

  const togglePermission = (key: keyof typeof settings.memberPermissions) => {
    const newSettings = {
      ...settings,
      memberPermissions: {
        ...settings.memberPermissions,
        [key]: !settings.memberPermissions[key]
      }
    }
    handleUpdate(newSettings)
  }

  const toggleSetting = (key: keyof typeof settings) => {
    if (key === 'memberPermissions') return; // Handled separately
    const newSettings = {
      ...settings,
      [key]: !settings[key as keyof typeof settings]
    }
    handleUpdate(newSettings)
  }

  // Custom Toggle Switch Component
  const Switch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <div 
      className={`w-9 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-[#1877F2]' : 'bg-[#D1D5DB]'}`}
      onClick={onChange}
    >
      <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${checked ? 'translate-x-3.5' : 'translate-x-0'}`} />
    </div>
  )

  // Custom Checkbox Component
  const Checkbox = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <div 
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all ${checked ? "bg-[#1877F2] border-[#1877F2]" : "border-[#D1D5DB]"}`}
      onClick={onChange}
    >
      {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
    </div>
  )

  return (
    <div className="flex w-[340px] shrink-0 flex-col bg-[#1e1f22] border-l border-[#2b2d31] h-full overflow-hidden text-[#e1e1e1]">
      {/* Header */}
      <div className="flex h-[60px] items-center border-b border-[#2b2d31] px-4 py-[14px] shrink-0 z-10">
        <button onClick={onBack} className="mr-3 text-[#a1a1a1] hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-medium text-[16px] text-white">Quản lý nhóm</span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        <div className="flex flex-col">

          {/* Member Permissions */}
          <div className="px-4 py-4 border-b border-[#2b2d31]">
            <h3 className="text-[14px] font-semibold text-[#8B929A] mb-3 uppercase tracking-wide">Cho phép các thành viên trong nhóm:</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between group cursor-pointer" onClick={() => togglePermission('changeNameAndAvatar')}>
                <span className="text-[15px] text-[#e1e1e1] flex-1 pr-4">Thay đổi tên & ảnh đại diện của nhóm</span>
                <Checkbox checked={settings.memberPermissions.changeNameAndAvatar} onChange={() => togglePermission('changeNameAndAvatar')} />
              </div>
              <div className="flex items-center justify-between group cursor-pointer" onClick={() => togglePermission('pinMessages')}>
                <span className="text-[15px] text-[#e1e1e1] flex-1 pr-4">Ghim tin nhắn, ghi chú, bình chọn lên đầu hội thoại</span>
                <Checkbox checked={settings.memberPermissions.pinMessages} onChange={() => togglePermission('pinMessages')} />
              </div>
              <div className="flex items-center justify-between group cursor-pointer" onClick={() => togglePermission('createNotes')}>
                <span className="text-[15px] text-[#e1e1e1] flex-1 pr-4">Tạo mới ghi chú, nhắc hẹn</span>
                <Checkbox checked={settings.memberPermissions.createNotes} onChange={() => togglePermission('createNotes')} />
              </div>
              <div className="flex items-center justify-between group cursor-pointer" onClick={() => togglePermission('createPolls')}>
                <span className="text-[15px] text-[#e1e1e1] flex-1 pr-4">Tạo mới bình chọn</span>
                <Checkbox checked={settings.memberPermissions.createPolls} onChange={() => togglePermission('createPolls')} />
              </div>
              <div className="flex items-center justify-between group cursor-pointer" onClick={() => togglePermission('sendMessages')}>
                <span className="text-[15px] text-[#e1e1e1] flex-1 pr-4">Gửi tin nhắn</span>
                <Checkbox checked={settings.memberPermissions.sendMessages} onChange={() => togglePermission('sendMessages')} />
              </div>
            </div>
          </div>

          {/* Settings Toggles */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-3.5 hover:bg-[#2b2d31] transition-colors cursor-pointer border-b border-[#2b2d31]" onClick={() => toggleSetting('joinApprovalMode')}>
              <span className="text-[15px] text-[#e1e1e1]">Chế độ phê duyệt thành viên mới</span>
              <Switch checked={settings.joinApprovalMode} onChange={() => toggleSetting('joinApprovalMode')} />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5 hover:bg-[#2b2d31] transition-colors cursor-pointer border-b border-[#2b2d31]" onClick={() => toggleSetting('highlightAdminMessages')}>
              <span className="text-[15px] text-[#e1e1e1]">Đánh dấu tin nhắn từ trưởng/phó nhóm</span>
              <Switch checked={settings.highlightAdminMessages} onChange={() => toggleSetting('highlightAdminMessages')} />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5 hover:bg-[#2b2d31] transition-colors cursor-pointer border-b border-[#2b2d31]" onClick={() => toggleSetting('readRecentMessages')}>
              <span className="text-[15px] text-[#e1e1e1]">Cho phép thành viên mới đọc tin nhắn gần nhất</span>
              <Switch checked={settings.readRecentMessages} onChange={() => toggleSetting('readRecentMessages')} />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5 hover:bg-[#2b2d31] transition-colors cursor-pointer border-b border-[#2b2d31]" onClick={() => toggleSetting('allowJoinLink')}>
              <span className="text-[15px] text-[#e1e1e1]">Cho phép dùng link tham gia nhóm</span>
              <Switch checked={settings.allowJoinLink} onChange={() => toggleSetting('allowJoinLink')} />
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col py-2 border-b border-[#2b2d31]">
            {settings.allowJoinLink && (
              <div 
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#2b2d31] transition-colors cursor-pointer group"
                onClick={async () => {
                  try {
                    const res = await useChatStore.getState().getInviteLink(chat._id);
                    // Mocking front-end join URL
                    const link = `${window.location.origin}/join/${res.inviteLinkCode}`;
                    navigator.clipboard.writeText(link);
                    toast.success("Đã sao chép link tham gia nhóm!");
                  } catch (e) {
                    // handled
                  }
                }}
              >
                <LinkIcon className="w-5 h-5 text-[#a1a1a1] group-hover:text-white" />
                <span className="text-[15px] text-[#e1e1e1]">Sao chép link tham gia</span>
              </div>
            )}
            <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#2b2d31] transition-colors cursor-pointer group">
              <Ban className="w-5 h-5 text-[#a1a1a1] group-hover:text-white" />
              <span className="text-[15px] text-[#e1e1e1]">Chặn khỏi nhóm</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#2b2d31] transition-colors cursor-pointer group">
              <Crown className="w-5 h-5 text-[#a1a1a1] group-hover:text-white" />
              <span className="text-[15px] text-[#e1e1e1]">Trưởng & phó nhóm</span>
            </div>
          </div>

          {/* Dissolve Group */}
          {isCreator && (
            <div className="px-4 py-6 flex justify-center">
               <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] rounded-xl transition-colors font-medium">
                  <LogOut className="w-5 h-5" />
                  Giải tán nhóm
               </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

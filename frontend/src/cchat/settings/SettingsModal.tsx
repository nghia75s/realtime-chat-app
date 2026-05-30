import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Settings as SettingsIcon,
  Lock,
  RefreshCcw,
  Brush,
  Bell,
  Monitor,
  Laptop
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { settingActions } from "../actions/settingActions"

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "general" | "appearance" | "notifications";

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("general")
  const [language, setLanguage] = useState<"vi" | "en">("vi")

  const tabs = [
    { id: "general", icon: SettingsIcon, label: "Cài đặt chung" },
    { id: "appearance", icon: Brush, label: "Giao diện" },
    { id: "notifications", icon: Bell, label: "Thông báo" },
  ] as const;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[760px] w-[90vw] md:w-[760px] h-[550px] p-0 gap-0 overflow-hidden bg-white text-zinc-900 rounded-lg flex flex-col">

        {/* Header Modal - Ẩn nút X đi vì mình dùng nút mặc định của Dialog hoặc nút custom */}
        <div className="flex items-center px-6 py-4 border-b border-zinc-200">
          <h2 className="text-[16px] font-bold">Cài đặt</h2>
        </div>

        {/* Thân Modal */}
        <div className="flex flex-1 min-h-0 bg-white">

          {/* Sidebar Trái */}
          <div className="w-[200px] border-r border-zinc-200 py-2 flex flex-col gap-[2px] overflow-y-auto custom-scrollbar shrink-0 bg-white z-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md transition-colors text-[14px] ${activeTab === tab.id
                  ? "bg-[#ede9fe] text-[#7c3aed] font-semibold"
                  : "text-zinc-700 hover:bg-zinc-100 font-medium"
                  }`}
              >
                <tab.icon className="h-[18px] w-[18px]" strokeWidth={activeTab === tab.id ? 2.5 : 1.5} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Vùng Nội Dung Phát Sinh (Bên Phải) */}
          <div className="flex-1 bg-white overflow-y-auto custom-scrollbar px-6 py-5">

            {/* --- TAB CHUNG --- */}
            {activeTab === "general" && (
              <div className="flex flex-col gap-8 animate-in fade-in duration-200 w-full max-w-md">

                {/* Section Danh bạ */}
                <div className="flex flex-col gap-3">
                  <h3 className="font-semibold text-[15px] mb-1">Danh bạ</h3>
                  <p className="text-[13px] text-zinc-500 mb-2">Danh sách đồng nghiệp được hiển thị trong danh bạ</p>
                  <RadioGroup defaultValue="zalo-only" className="gap-2 mt-1">
                    <Label htmlFor="r-all" className="flex items-center space-x-3 w-full p-2.5 rounded-md hover:bg-zinc-100 cursor-pointer transition-colors">
                      <RadioGroupItem value="all" id="r-all" className="border-zinc-400 text-[#7c3aed]" />
                      <span className="cursor-pointer font-normal text-[14px]">Hiển thị tất cả đồng nghiệp</span>
                    </Label>
                    <Label htmlFor="r-zalo" className="flex items-center space-x-3 w-full p-2.5 rounded-md hover:bg-zinc-100 cursor-pointer transition-colors">
                      <RadioGroupItem value="zalo-only" id="r-zalo" className="border-[#7c3aed] text-[#7c3aed]" />
                      <span className="cursor-pointer font-normal text-[14px]">Chỉ hiển thị đồng nghiệp đang sử dụng</span>
                    </Label>
                  </RadioGroup>
                </div>

                {/* Section Ngôn Ngữ */}
                <div className="flex flex-col gap-3 pt-6 border-t border-zinc-100">
                  <h3 className="font-semibold text-[15px] mb-1">Ngôn ngữ</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center justify-between border border-zinc-200 rounded-md px-3 py-2.5 cursor-pointer hover:border-zinc-300 hover:bg-zinc-50 transition-colors">
                        <span className="text-[14px]">Thay đổi ngôn ngữ</span>
                        <span className="text-[14px] font-medium text-zinc-700 font-sans flex items-center gap-2">
                          {language === "vi" ? "Tiếng Việt" : "English"}
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[180px] rounded-xl shadow-lg border-zinc-200 py-1" align="end">
                      <DropdownMenuItem 
                        onClick={() => { setLanguage("vi"); settingActions.changeLanguage("vi"); }}
                        className="py-2.5 px-3 cursor-pointer text-[14px] rounded-lg mx-1 focus:bg-zinc-100 font-medium"
                      >
                        Tiếng Việt
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => { setLanguage("en"); settingActions.changeLanguage("en"); }}
                        className="py-2.5 px-3 cursor-pointer text-[14px] rounded-lg mx-1 focus:bg-zinc-100 font-medium"
                      >
                        English
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

              </div>
            )}

            {/* --- TAB THÔNG BÁO --- */}
            {activeTab === "notifications" && (
              <div className="flex flex-col gap-8 animate-in fade-in duration-200 w-full pt-1">
                <div className="flex flex-col gap-3">
                  <h3 className="font-semibold text-[15px] mb-1">Cài đặt thông báo</h3>
                  <p className="text-[13px] text-zinc-500 mb-2">Nhận được thông báo mỗi khi có tin nhắn mới</p>

                  {/* Hai khối Visual Notification Radio */}
                  <RadioGroup defaultValue="on" className="flex items-center gap-6 mt-2">
                    {/* Bật */}
                    <div className="flex flex-col items-center gap-4">
                      <Label htmlFor="notif-on" className="cursor-pointer group">
                        <div className="w-[120px] h-[80px] bg-white border-2 border-zinc-200 rounded-md relative flex items-center justify-center mb-2 group-hover:border-[#7c3aed] transition-colors">
                          <Laptop className="h-10 w-10 text-zinc-300 group-hover:text-[#7c3aed] stroke-[1.5] transition-colors" />
                          {/* Giả lập bong bóng Notif */}
                          <div className="absolute top-2 right-2 w-8 h-3 bg-zinc-200 group-hover:bg-purple-200 transition-colors rounded-sm"></div>
                        </div>
                      </Label>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="on" id="notif-on" className="border-zinc-400 group-hover:border-[#7c3aed] transition-colors" />
                        <span className="text-[14px]">Bật</span>
                      </div>
                    </div>

                    {/* Tắt */}
                    <div className="flex flex-col items-center gap-4">
                      <Label htmlFor="notif-off" className="cursor-pointer group">
                        <div className="w-[120px] h-[80px] bg-white border-2 border-zinc-200 rounded-md relative flex items-center justify-center mb-2 group-hover:border-[#7c3aed] transition-colors">
                          <Monitor className="h-10 w-10 text-zinc-300 group-hover:text-[#7c3aed] stroke-[1.5] transition-colors" />
                        </div>
                      </Label>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="off" id="notif-off" className="border-zinc-400 group-hover:border-[#7c3aed] transition-colors" />
                        <span className="text-[14px]">Tắt</span>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex flex-col gap-4 pt-6 border-t border-zinc-100">
                  <h3 className="font-semibold text-[15px] mb-1">Âm thanh thông báo</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-toggle" className="text-[14px] font-normal cursor-pointer">Phát âm thanh khi có tin nhắn & thông báo mới</Label>
                    <Switch id="sound-toggle" className="data-[state=checked]:bg-[#7c3aed]" />
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB GIAO DIỆN --- */}
            {activeTab === "appearance" && (
              <div className="flex flex-col gap-8 animate-in fade-in duration-200 w-full pt-1">
                <div className="flex flex-col gap-3">
                  <h3 className="font-semibold text-[15px] mb-3">Cài đặt giao diện</h3>

                  <RadioGroup defaultValue="dark" className="flex items-center gap-6 mt-2">
                    {/* Sáng */}
                    <div className="flex flex-col items-center gap-4 cursor-pointer group">
                      <Label htmlFor="theme-light" className="cursor-pointer group">
                        <div className="w-[100px] h-[70px] bg-white border-2 border-zinc-200 group-hover:border-[#7c3aed] transition-colors rounded-lg shadow-sm relative flex items-center justify-center mb-2">
                          <div className="w-[80%] h-[60%] bg-[#ede9fe] rounded border border-purple-200"></div>
                        </div>
                      </Label>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="light" id="theme-light" className="border-zinc-400" />
                        <span className="text-[14px]">Sáng</span>
                      </div>
                    </div>

                    {/* Tối */}
                    <div className="flex flex-col items-center gap-4 cursor-pointer group">
                      <Label htmlFor="theme-dark" className="cursor-pointer group">
                        <div className="w-[100px] h-[70px] bg-[#1a1c22] border-2 border-transparent group-hover:border-[#7c3aed] transition-colors rounded-lg shadow-sm relative flex items-center justify-center mb-2">
                          <div className="w-[80%] h-[60%] bg-zinc-800 rounded border border-zinc-700"></div>
                          <div className="absolute top-3 right-3 w-4 h-3 bg-[#7c3aed] rounded-sm"></div>
                        </div>
                      </Label>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="dark" id="theme-dark" className="border-zinc-400" />
                        <span className="text-[14px]">Tối</span>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


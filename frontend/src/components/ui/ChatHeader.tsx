import { PanelRightOpen, XIcon } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#1e1f22] border-b border-[#2b2d31] shrink-0">
        <div className="flex items-center gap-3">
          <img src={selectedUser.profilePicture || "/avatar.png"} alt={selectedUser.fullname} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h3 className="font-semibold text-white text-[16px] leading-tight flex items-center justify-start gap-2">
              {selectedUser.fullname}
              <span className="bg-amber-600/20 text-amber-500 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">BẠN BÈ</span>
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md transition-colors" title="Cuộc gọi thoại">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md transition-colors" title="Cuộc gọi video">
            <Video className="w-5 h-5" />
          </button>
          <div className="w-[1px] h-6 bg-[#2b2d31] mx-1"></div>
          <button onClick={onToggleRightSidebar} className="p-2 text-[#a1a1a1] hover:bg-[#2b2d31] rounded-md transition-colors" title="Thông tin hội thoại">
            {isRightSidebarOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
          </button>
        </div>
      </div>
  );
}
export default ChatHeader;
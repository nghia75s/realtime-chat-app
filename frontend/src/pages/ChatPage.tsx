import { useState } from "react"
import { PrimarySidebar } from "../cchat/sidebar/PrimarySidebar"
import { ChatListSidebar } from "../cchat/chat/ChatListSidebar"
import { MainChatArea } from "../cchat/chat/MainChatArea"
import { RightInfoPanel } from "../cchat/chat/RightInfoPanel"
import { useChatStore } from "../store/useChatStore"
import NoConversationPlaceholder from "@/components/ui/NoConversationPlaceholder"

export default function ChatPage() {
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  
  const { selectedUser } = useChatStore()
  
  return (
    <div className="flex flex-row h-screen w-full bg-[#1e1f22] text-[#e1e1e1] overflow-hidden font-sans">
      {/* Cột 1: Global Navigation */}
      <PrimarySidebar activeTab="chat" />

      {/* Cột 2: Danh sách hội thoại */}
      <ChatListSidebar />

      {/* Cột 3: Khu vực nhắn tin chính */}
      <div className="flex-1 flex flex-col min-h-screen relative border-l border-[#2b2d31]">
        {selectedUser ? (
          <MainChatArea 
            isRightSidebarOpen={isRightSidebarOpen} 
            onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)} 
          />
        ) : (
          <NoConversationPlaceholder />
        )}
      </div>
      
      {/* Cột 4: Thông tin hội thoại */}
      {isRightSidebarOpen && selectedUser && (
        <RightInfoPanel chat={selectedUser} />
      )}
    </div>
  )
}

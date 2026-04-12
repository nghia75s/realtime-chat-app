import { useState } from "react"
import { PrimarySidebar } from "../cchat/sidebar/PrimarySidebar"
import { ChatListSidebar } from "../cchat/chat/ChatListSidebar"
import { MainChatArea } from "../cchat/chat/MainChatArea"
// import { RightInfoPanel } from "../cchat/chat/RightInfoPanel"
import { useChatStore } from "../store/useChatStore"
import NoConversationPlaceholder from "@/components/ui/NoConversationPlaceholder"

export default function ChatPage() {
  // const [isRightPanelOpen, setIsRightPanelOpen] = useState(false)
  const [activeChatId, setActiveChatId] = useState<number>(1)

  const { selectedUser } = useChatStore()
  
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-zinc-900 font-sans">
      {/* Cột 1: Global Navigation */}
      <PrimarySidebar activeTab="chat" />

      {/* Cột 2: Danh sách hội thoại */}
      <ChatListSidebar />

      {/* Cột 3: Khu vực nhắn tin chính */}
      <div className="flex-1 min-h-screen flex flex-col">
        {selectedUser ? <MainChatArea /> : <NoConversationPlaceholder />}
      </div>
      
      {/* Cột 4: Thông tin hội thoại */}
      {/* {isRightPanelOpen && <RightInfoPanel chat={activeChat} />} */}
    </div>
  )
}

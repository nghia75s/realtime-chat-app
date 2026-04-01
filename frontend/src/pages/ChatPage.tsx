import { useState } from "react"
import { PrimarySidebar } from "../cchat/PrimarySidebar"
import { ChatListSidebar } from "../cchat/chat/ChatListSidebar"
import { MainChatArea } from "../cchat/chat/MainChatArea"
import { RightInfoPanel } from "../cchat/chat/RightInfoPanel"
import { mockConversations } from "../cchat/data/mockData"

export default function ChatPage() {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
  const [activeChatId, setActiveChatId] = useState<number>(1)
  
  const activeChat = mockConversations.find(c => c.id === activeChatId) || mockConversations[0]

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-zinc-900 font-sans">
      {/* Cột 1: Global Navigation */}
      <PrimarySidebar activeTab="chat" />

      {/* Cột 2: Danh sách hội thoại */}
      <ChatListSidebar 
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
      />

      {/* Cột 3: Khu vực nhắn tin chính */}
      <MainChatArea 
        chat={activeChat}
        isRightPanelOpen={isRightPanelOpen} 
        onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)} 
      />

      {/* Cột 4: Thông tin hội thoại */}
      {isRightPanelOpen && <RightInfoPanel chat={activeChat} />}
    </div>
  )
}

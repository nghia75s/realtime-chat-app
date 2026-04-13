import { useState, useRef, useEffect } from "react"
import { Phone, Video, PanelRight, Search, Paperclip, Image as ImageIcon, Smile, Mic, FileText, UserPlus, MoreHorizontal, Download, Scissors, Type, AtSign } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { chatActions } from "../actions/chatActions"
import { useAuthStore } from "@/store/useAuthStore"
import { useChatStore } from "@/store/useChatStore"
import ChatHeader from "@/components/ui/ChatHeader"
import NoChatHistoryPlaceholder from "@/components/ui/NoChatHistoryPlaceholder"

export function MainChatArea() {
  const { selectedUser, getMessagesByUserId, messages } = useChatStore()
  const { authUser } = useAuthStore()

  useEffect(() => {
    getMessagesByUserId(selectedUser._id)
  }, [selectedUser])

  return (
    <div className="flex flex-1 flex-col bg-purple-100 backdrop-blur-sm">
      {/* Chat Header */}
      <ChatHeader />

      {/* Main Chat Content */}
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map(msg => (
              <div
                key={msg._id} 
                className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
              >
                <div className={`chat-bubble relative ${msg.senderId === authUser._id ? "bg-purple-900" : "bg-purple-200"}`}>
                </div>
              </div>
            ))}
          </div>

        ) : (
        <NoChatHistoryPlaceholder name={selectedUser.fullname} />
      )}
      </div>
      
      {/* Chat Input */}
      
      
    </div>
  )
}



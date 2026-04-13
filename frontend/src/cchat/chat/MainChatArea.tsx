import { useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { useChatStore } from "@/store/useChatStore"
import ChatHeader from "@/components/ui/ChatHeader"
import NoChatHistoryPlaceholder from "@/components/ui/NoChatHistoryPlaceholder"
import MessageInput from "@/components/ui/MessageInput"
import MessageLoadingSkeleton from "@/components/ui/MessageLoadingSkeleton"

export function MainChatArea() {
  const { selectedUser, getMessagesByUserId, messages, isMessagesLoading } = useChatStore()
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
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map(msg => (
              <div
                key={msg._id} 
                className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
              >
                <div className={`chat-bubble relative ${msg.senderId === authUser._id ? "bg-purple-400 text-black" : "bg-purple-200 text-black"}`}>
                  {msg.image && <img src={msg.image} alt="Message" className="rounded-lg h-48 object-cover" />}
                  {msg.text && <p className="mt-2">{msg.text}</p>}
                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

        ) : isMessagesLoading ? (<MessageLoadingSkeleton />) : (
        <NoChatHistoryPlaceholder name={selectedUser.fullname} />
      )}
      </div>
      
      {/* Chat Input */}
      <MessageInput />
      
    </div>
  )
}



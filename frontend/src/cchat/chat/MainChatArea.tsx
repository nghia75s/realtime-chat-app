import React, { useEffect, useMemo, useRef, useState } from "react"
import { Phone, Video, PanelRightClose, PanelRightOpen, Smile, Send, Paperclip, Image as ImageIcon, FileText, Type, Maximize, Clock, ThumbsUp, X, Reply, Trash2, Copy, RotateCcw, Pin } from "lucide-react"
import { useChatStore } from "@/store/useChatStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useMessageActionStore } from "@/store/useMessageActionStore"
import NoChatHistoryPlaceholder from "@/components/ui/NoChatHistoryPlaceholder"
import MessageLoadingSkeleton from "@/components/ui/MessageLoadingSkeleton"
import { MessageBubble } from "./MessageBubble"
import { DocumentMessageCard } from "./DocumentMessageCard"
import { TaskMessageCard } from "./TaskMessageCard"
import { DocumentViewerModal } from "./DocumentViewerModal"
import { MessageDetailsModal } from "./modals/MessageDetailsModal"
import { ForwardMessageModal } from "./modals/ForwardMessageModal"
import { PinnedMessageBar } from "./PinnedMessageBar"
import { NoteMessageCard } from "./NoteMessageCard"
import { PollMessageCard } from "./PollMessageCard"
import { ProfileModal } from "./modals/ProfileModal"
import { toast } from "react-hot-toast"
import { EmojiPickerPanel } from "@/components/ui/EmojiPickerPanel"
import { formatMessageDateDivider } from "@/lib/formatTime"

// Emoticon shortcode → Emoji
const EMOTICON_MAP: Record<string, string> = {
  ":)": "😊", ":-)": "😊",
  ":D": "😄", ":-D": "😄",
  "xD": "😆", "XD": "😆",
  ":P": "😛", ":-P": "😛",
  ";)": "😉", ";-)": "😉",
  ":(": "😢", ":-(": "😢",
  ":'(": "😭",
  ">:(": "😠", ">:-(": "😠",
  ":o": "😮", ":O": "😮",
  "B)": "😎",
  "<3": "❤️", "</3": "💔",
  "(y)": "👍", "(n)": "👎",
  ":*": "😘", ":-*": "😘",
  "O:)": "😇", ":3": "😺",
}
const EMOTICON_RE = new RegExp(
  Object.keys(EMOTICON_MAP).sort((a, b) => b.length - a.length)
    .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g'
)
const convertEmoticons = (t: string) => t.replace(EMOTICON_RE, m => EMOTICON_MAP[m] ?? m)

interface MainChatAreaProps {
  isRightSidebarOpen: boolean;
  onToggleRightSidebar: () => void;
  requestedImageMessageId?: string | null;
  onConsumeRequestedImage?: () => void;
}

export function MainChatArea({ isRightSidebarOpen, onToggleRightSidebar, requestedImageMessageId, onConsumeRequestedImage }: MainChatAreaProps) {
  const {
    selectedUser,
    getMessagesByUserId,
    getGroupMessageByUserId,
    sendMessage,
    sendGroupMessage,
    joinGroup,
    leaveGroup,
    subscribeToMessages,
    unsubscribeFromMessages,
    messages,
    isMessagesLoading,
    getPinnedMessages,
    pinMessage
  } = useChatStore()
  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick)
  }, [])

  const { onlineUsers, authUser } = useAuthStore()

  // 1. Fetch messages và pinned messages khi mount / chuyển chat
  const {
    isSelectionMode,
    selectedMessageIds,
    selectedMessagesData,
    clearSelection,
    openForwardModal
  } = useMessageActionStore()

  // Dữ liệu Mock: Nếu đối tượng có thuộc tính isGroup thì coi như là Nhóm
  const isGroup = selectedUser?.isGroup || false
  const isOnline = selectedUser ? onlineUsers.includes(selectedUser._id) : false

  const creatorId = typeof selectedUser?.createdBy === "string" ? selectedUser.createdBy : selectedUser?.createdBy?._id;
  const isCreator = authUser?._id === creatorId;
  const isAdmin = selectedUser?.admins?.some((adminId: any) => {
    const id = typeof adminId === "string" ? adminId : adminId._id;
    return id === authUser?._id;
  });
  const isManager = isCreator || isAdmin;
  const canSendMessage = isGroup ? (isManager || selectedUser?.settings?.memberPermissions?.sendMessages !== false) : true;
  const canPin = isGroup ? (isManager || selectedUser?.settings?.memberPermissions?.pinMessages !== false) : true;
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const attachmentInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [fileAttachment, setFileAttachment] = useState<{ file: File; data: string } | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null)
  const [text, setText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [replyingTo, setReplyingTo] = useState<any | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const [documentViewer, setDocumentViewer] = useState<{ htmlContent: string; templateName: string } | null>(null)
  const [imageModalIndex, setImageModalIndex] = useState<number | null>(null)
  const [imageZoom, setImageZoom] = useState<number>(1)
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, msg: any } | null>(null)
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [didDrag, setDidDrag] = useState(false)

  const imageMessages = useMemo(() => {
    return messages?.filter((msg: any) => msg.image).map((msg: any) => ({
      id: msg._id,
      image: msg.image,
      createdAt: msg.createdAt,
    })) ?? []
  }, [messages])

  const openImageModal = (message: any) => {
    const messageId = typeof message === "string" ? message : message?._id
    const index = imageMessages.findIndex((item) => item.id === messageId)
    if (index !== -1) {
      setImageModalIndex(index)
      setImageZoom(1)
      setImageOffset({ x: 0, y: 0 })
      setDidDrag(false)
    }
  }

  const requestedImageRef = useRef<string | null>(null)

  useEffect(() => {
    if (!requestedImageMessageId || requestedImageMessageId === requestedImageRef.current) return
    requestedImageRef.current = requestedImageMessageId
    openImageModal(requestedImageMessageId)
    onConsumeRequestedImage?.()
  }, [requestedImageMessageId, onConsumeRequestedImage])

  const closeImageModal = () => {
    setImageModalIndex(null)
    setImageZoom(1)
    setImageOffset({ x: 0, y: 0 })
    setIsPanning(false)
    setDragStart(null)
    setDidDrag(false)
  }

  const showPreviousImage = () => {
    setImageModalIndex((current) => {
      if (current === null || imageMessages.length === 0) return null
      return current === 0 ? imageMessages.length - 1 : current - 1
    })
  }

  const showNextImage = () => {
    setImageModalIndex((current) => {
      if (current === null || imageMessages.length === 0) return null
      return current === imageMessages.length - 1 ? 0 : current + 1
    })
  }

  const joinedGroupIdRef = useRef<string | null>(null);

  // Đóng picker khi click ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node))
        setShowEmojiPicker(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Ctrl+E toggle picker
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault()
        setShowEmojiPicker(p => !p)
        textareaRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Global message subscription - Luôn lắng nghe tin nhắn mới
  useEffect(() => {
    subscribeToMessages();
    return () => {
      unsubscribeFromMessages();
    };
  }, []);

  useEffect(() => {
    if (imageModalIndex === null) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeImageModal()
      } else if (e.key === "ArrowLeft") {
        showPreviousImage()
      } else if (e.key === "ArrowRight") {
        showNextImage()
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [imageModalIndex, imageMessages.length])

  useEffect(() => {
    setImageZoom(1)
    setImageOffset({ x: 0, y: 0 })
    setIsPanning(false)
    setDragStart(null)
    setDidDrag(false)
  }, [imageModalIndex])

  // Chat specific logic
  const selectedUserId = selectedUser?._id;
  useEffect(() => {
    setReplyingTo(null)

    if (selectedUserId) {
      setIsScrolled(false);
      getPinnedMessages(selectedUserId);

      if (isGroup) {
        getGroupMessageByUserId(selectedUserId);
        joinGroup(selectedUserId);
        joinedGroupIdRef.current = selectedUserId;
      } else {
        getMessagesByUserId(selectedUserId);
      }
    }

    return () => {
      if (joinedGroupIdRef.current) {
        leaveGroup(joinedGroupIdRef.current);
        joinedGroupIdRef.current = null;
      }
    };
  }, [selectedUserId, isGroup, getMessagesByUserId, getGroupMessageByUserId, joinGroup, leaveGroup, getPinnedMessages])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
      setIsScrolled(true)
    }, 100);
  }

  const messagesLengthRef = useRef(0);
  const lastMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (messagesEndRef.current && messages && !isMessagesLoading) {
      const currentLength = messages.length;
      const currentLastId = currentLength > 0 ? messages[currentLength - 1]?._id : null;
      
      if (!isScrolled) {
        scrollToBottom();
      } else if (currentLength > messagesLengthRef.current || currentLastId !== lastMessageIdRef.current) {
        scrollToBottom();
      }
      
      messagesLengthRef.current = currentLength;
      lastMessageIdRef.current = currentLastId;
    }
  }, [messages, isMessagesLoading, isScrolled])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !fileAttachment) return;
    const msgText = text.trim();
    const msgImg = imagePreview;
    const replyToId = replyingTo?._id;
    const filePayload = fileAttachment
      ? {
        name: fileAttachment.file.name,
        type: fileAttachment.file.type,
        size: fileAttachment.file.size,
        data: fileAttachment.data,
      }
      : undefined;

    setIsSending(true);
    setText("");
    setImagePreview(null);
    setFileAttachment(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (attachmentInputRef.current) attachmentInputRef.current.value = "";
    setReplyingTo(null);

    try {
      if (isGroup) {
        await sendGroupMessage({ text: msgText, image: msgImg, file: filePayload, replyTo: replyToId });
      } else {
        await sendMessage({ text: msgText, image: msgImg, file: filePayload, replyTo: replyToId });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setText(msgText);
      setImagePreview(msgImg);
      setFileAttachment(fileAttachment);
      // fallback in case of error
      setReplyingTo(replyingTo);
    } finally {
      setIsSending(false);
    }
  }

  const handleReply = (msg: any) => {
    setReplyingTo(msg);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  const handleForward = (msg: any) => {
    openForwardModal([msg]);
  }

  const handleSendLike = async () => {
    if (!selectedUser || isSending) return;
    setIsSending(true);

    try {
      if (isGroup) {
        await sendGroupMessage({ text: "👍", image: null, replyTo: null });
      } else {
        await sendMessage({ text: "👍", image: null, replyTo: null });
      }
    } catch (error) {
      console.error("Failed to send like message:", error);
    } finally {
      setIsSending(false);
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setFileAttachment(null);
    };
    reader.readAsDataURL(file);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileAttachment({ file, data: reader.result as string });
      setImagePreview(null);
    };
    reader.readAsDataURL(file);
  }

  const [isDragActive, setIsDragActive] = useState(false)

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!canSendMessage) return;
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.kind !== "file") continue;
      const file = item.getAsFile();
      if (!file) continue;

      e.preventDefault();
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
          setFileAttachment(null);
        };
        reader.readAsDataURL(file);
      } else {
        setFileAttachment({ file, data: "" });
        setImagePreview(null);
      }
      break;
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSendMessage) return;
    setIsDragActive(true);
  }

  const handleDragLeave = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }

  const handleDrop = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (!canSendMessage) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFileAttachment(null);
      };
      reader.readAsDataURL(file);
    } else {
      setFileAttachment({ file, data: "" });
      setImagePreview(null);
    }
  }

  const removeImage = () => {
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  const removeFileAttachment = () => {
    setFileAttachment(null);
    if (attachmentInputRef.current) attachmentInputRef.current.value = "";
  }

  const handleScrollToMessage = (msgId: string) => {
    const el = document.getElementById(`message-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("bg-chat-hover/50", "transition-colors", "duration-500", "rounded-lg");
      setTimeout(() => {
        el.classList.remove("bg-chat-hover/50");
      }, 2000);
    }
  };

  if (!selectedUser) return null;

  return (
    <div className="flex flex-1 flex-col min-w-0 bg-chat-main h-full overflow-hidden text-chat-text">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-chat-header border-b border-chat-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={isGroup ? (selectedUser.groupPicture || "/group.png") : (selectedUser.profilePicture || "/avatar.png")} alt={selectedUser.fullname} className="w-10 h-10 rounded-full object-cover" />
            {!isGroup && (
              <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-chat-header transition-colors ${isOnline ? "bg-green-500" : "bg-[#4e4f52]"
                }`} />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-chat-text text-[16px] leading-tight">
              {isGroup ? selectedUser?.name : selectedUser?.fullname}
            </h3>
            {isGroup ? (
              <p className="text-[12px] font-medium text-chat-muted">
                {selectedUser.memberCount} thành viên
              </p>
            ) : (
              <p className={`text-[12px] font-medium ${isOnline ? "text-green-500" : "text-chat-muted"}`}>
                {isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-chat-muted hover:bg-chat-hover rounded-md transition-colors" title="Cuộc gọi thoại">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-chat-muted hover:bg-chat-hover rounded-md transition-colors" title="Cuộc gọi video">
            <Video className="w-5 h-5" />
          </button>
          <div className="w-[1px] h-6 bg-chat-border mx-1"></div>
          <button onClick={onToggleRightSidebar} className="p-2 text-chat-muted hover:bg-chat-hover rounded-md transition-colors" title="Thông tin hội thoại">
            {isRightSidebarOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <PinnedMessageBar onMessageClick={handleScrollToMessage} />

      {/* Message History */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
        {(isMessagesLoading || !isScrolled) && (
          <div className="absolute inset-0 z-10 bg-chat-main p-6">
            <MessageLoadingSkeleton />
          </div>
        )}

        <div className={`flex flex-col transition-opacity duration-200 ${isScrolled ? "opacity-100" : "opacity-0"}`}>
          {messages && messages.length > 0 ? (
            messages.map((msg: any, index: number) => {
              const prevMsg = messages[index - 1];

              const msgDateStr = msg.createdAt;
              const prevDateStr = prevMsg?.createdAt;
              const isDifferentDate = !prevDateStr || formatMessageDateDivider(msgDateStr) !== formatMessageDateDivider(prevDateStr);

              const hideHeader = prevMsg &&
                (prevMsg.senderId?._id || prevMsg.senderId) === (msg.senderId?._id || msg.senderId) &&
                !isDifferentDate;

              const dateDivider = isDifferentDate ? (
                <div className="flex justify-center my-4">
                  <span className="bg-chat-system-msg text-chat-muted text-[12px] font-medium px-3 py-1 rounded-full shadow-sm" style={{ background: 'var(--chat-system-msg-bg)', color: 'var(--chat-system-msg-text)' }}>
                    {formatMessageDateDivider(msgDateStr)}
                  </span>
                </div>
              ) : null;

              // Tin nhắn hệ thống (System Message)
              if (msg.messageType === "system") {
                return (
                  <React.Fragment key={msg._id}>
                    {dateDivider}
                    <div className="flex justify-center my-3 w-full">
                      <span className="text-[12px] font-medium truncate text-center max-w-[80%] break-words shadow-sm px-4 py-1.5 rounded-full border" style={{ background: 'var(--chat-system-msg-bg)', color: 'var(--chat-system-msg-text)', borderColor: 'var(--chat-border)' }}>
                        {msg.text?.includes("ghim") && <Pin className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5 text-[#0052cc]" />}
                        {msg.text || "Thông báo hệ thống"}
                      </span>
                    </div>
                  </React.Fragment>
                )
              }

              // Tin nhắn lá đơn: dùng DocumentMessageCard
              if (msg.messageType === "document") {
                return (
                  <React.Fragment key={msg._id}>
                    {dateDivider}
                    <div id={`message-${msg._id}`}>
                      <DocumentMessageCard
                        msg={msg}
                        onViewFull={(html, name) => setDocumentViewer({ htmlContent: html, templateName: name })}
                        senderAvatar={isGroup ? (msg.senderId?.profilePicture || "/avatar.png") : (selectedUser?.profilePicture || "/avatar.png")}
                        senderName={isGroup ? msg.senderId?.fullname : selectedUser?.fullname}
                        isGroupChat={isGroup}
                        hideHeader={hideHeader}
                      />
                    </div>
                  </React.Fragment>
                )
              }

              // Tin nhắn giao việc: dùng TaskMessageCard
              if (msg.messageType === "task_assignment") {
                return (
                  <React.Fragment key={msg._id}>
                    {dateDivider}
                    <div id={`message-${msg._id}`}>
                      <TaskMessageCard
                        msg={msg}
                        senderAvatar={isGroup ? (msg.senderId?.profilePicture || "/avatar.png") : (selectedUser?.profilePicture || "/avatar.png")}
                        senderName={isGroup ? msg.senderId?.fullname : selectedUser?.fullname}
                        isGroupChat={isGroup}
                        hideHeader={hideHeader}
                      />
                    </div>
                  </React.Fragment>
                )
              }

              // Tin nhắn ghi chú
              if (msg.messageType === "note") {
                return (
                  <React.Fragment key={msg._id}>
                    {dateDivider}
                    <div id={`message-${msg._id}`} className="flex justify-center w-full mt-4 mb-2">
                      <div
                        className="w-[400px] max-w-[85%]"
                        onContextMenu={(e) => {
                          if (!canPin) return;
                          e.preventDefault()
                          setContextMenu({ x: e.clientX, y: e.clientY, msg })
                        }}
                      >
                        <NoteMessageCard message={msg} />
                      </div>
                    </div>
                  </React.Fragment>
                )
              }

              // Tin nhắn bình chọn
              if (msg.messageType === "poll") {
                return (
                  <React.Fragment key={msg._id}>
                    {dateDivider}
                    <div id={`message-${msg._id}`} className="flex justify-center w-full mt-4 mb-2">
                      <div
                        className="w-[400px] max-w-[85%]"
                        onContextMenu={(e) => {
                          if (!canPin) return;
                          e.preventDefault()
                          setContextMenu({ x: e.clientX, y: e.clientY, msg })
                        }}
                      >
                        <PollMessageCard message={msg} />
                      </div>
                    </div>
                  </React.Fragment>
                )
              }

              // Quyền tương tác
              const msgSenderId = typeof msg.senderId === "string" ? msg.senderId : msg.senderId?._id;
              const isAdminMsg = isGroup ? (msgSenderId === creatorId || selectedUser?.admins?.some((a: any) => (typeof a === "string" ? a : a._id) === msgSenderId)) : false;
              const highlightAdminMessages = selectedUser?.settings?.highlightAdminMessages !== false;

              return (
                <React.Fragment key={msg._id}>
                  {dateDivider}
                  <div id={`message-${msg._id}`}>
                    <MessageBubble
                      msg={msg}
                      onImageLoad={scrollToBottom}
                      onImageClick={openImageModal}
                      senderAvatar={isGroup ? (msg.senderId?.profilePicture || "/avatar.png") : (selectedUser?.profilePicture || "/avatar.png")}
                      senderName={isGroup ? msg.senderId?.fullname : selectedUser?.fullname}
                      isGroupChat={isGroup}
                      hideHeader={hideHeader}
                      onReply={handleReply}
                      onForward={handleForward}
                      onAvatarClick={() => { 
                        if (isGroup) {
                          setSelectedProfile(typeof msg.senderId === "object" ? msg.senderId : null);
                        } else {
                          setSelectedProfile(selectedUser);
                        }
                      }}
                      canPin={canPin}
                      isAdminMsg={isAdminMsg}
                      highlightAdminMessages={highlightAdminMessages}
                    />
                  </div>
                </React.Fragment>
              )
            })
          ) : (
            < NoChatHistoryPlaceholder name={selectedUser.fullname} />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {isSelectionMode ? (
        <div className="bg-chat-header border-t border-chat-border py-3.5 px-6 flex items-center justify-between shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.3)] z-10 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-1">
            <span className="text-[#0052cc] text-[15px] font-bold bg-[#0052cc]/10 w-7 h-7 flex items-center justify-center rounded-md">
              {selectedMessageIds.length}
            </span>
            <span className="text-chat-text text-[14px] font-semibold ml-2">Đã chọn</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Sao chép */}
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-chat-border bg-chat-hover text-chat-text transition-colors rounded-full text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={selectedMessageIds.length === 0}
              onClick={() => {
                const textToCopy = selectedMessagesData
                  .map(m => m.text)
                  .filter(Boolean)
                  .join("\n");
                if (textToCopy) {
                  navigator.clipboard.writeText(textToCopy);
                  toast.success("Đã sao chép các tin nhắn đã chọn");
                } else {
                  toast.error("Không có nội dung chữ để sao chép");
                }
              }}
            >
              <Copy className="w-4 h-4" />
              <span>Sao chép</span>
            </button>

            {/* Chia sẻ (Chuyển tiếp) */}
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-chat-border bg-chat-hover text-chat-text transition-colors rounded-full text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={selectedMessageIds.length === 0}
              onClick={() => openForwardModal(selectedMessagesData)}
            >
              <Reply className="w-4 h-4 scale-x-[-1]" />
              <span>Chia sẻ</span>
            </button>

            {/* Thu hồi */}
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors rounded-full text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={selectedMessageIds.length === 0}
              onClick={async () => {
                // Chỉ thu hồi những tin nhắn do chính mình gửi
                const myMsgs = selectedMessagesData.filter(m => {
                  const sId = typeof m.senderId === "string" ? m.senderId : m.senderId?._id;
                  return sId === authUser?._id;
                });

                if (myMsgs.length === 0) {
                  toast.error("Không có tin nhắn nào của bạn để thu hồi");
                  return;
                }

                try {
                  for (const m of myMsgs) {
                    await useChatStore.getState().recallMessage(m._id);
                  }
                  toast.success(`Đã thu hồi ${myMsgs.length} tin nhắn`);
                  clearSelection();
                } catch (err) {
                  // Lỗi đã được xử lý trong store
                }
              }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thu hồi</span>
            </button>

            {/* Xóa */}
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors rounded-full text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={selectedMessageIds.length === 0}
              onClick={async () => {
                try {
                  for (const msgId of selectedMessageIds) {
                    await useChatStore.getState().deleteMessage(msgId);
                  }
                  toast.success("Đã xóa các tin nhắn đã chọn");
                  clearSelection();
                } catch (error) {
                  // Lỗi đã được xử lý trong store
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa</span>
            </button>

            {/* Hủy */}
            <button
              type="button"
              onClick={clearSelection}
              className="ml-2 px-3 py-2 text-chat-muted hover:text-chat-text transition-colors text-[13px] font-semibold"
            >
              Hủy
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-chat-input-area flex flex-col shrink-0 min-w-0" style={{ background: 'var(--chat-input-area-bg)' }}>
          {canSendMessage ? (
            <>
              {/* Top Toolbar */}
              <div className="flex items-center px-2 py-2 gap-1 h-[40px]">
                <button disabled={isSending || !canSendMessage} className="p-1.5 text-chat-muted hover:bg-chat-hover rounded-md disabled:opacity-50"><Smile className="w-[18px] h-[18px]" /></button>

                <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} className="hidden" disabled={!canSendMessage} />
                <input type="file" ref={attachmentInputRef} onChange={handleFileChange} className="hidden" disabled={!canSendMessage} />
                <button disabled={isSending || !canSendMessage} onClick={() => imageInputRef.current?.click()} className="p-1.5 text-chat-muted hover:bg-chat-hover rounded-md disabled:opacity-50">
                  <ImageIcon className="w-[18px] h-[18px]" />
                </button>

                <button disabled={isSending || !canSendMessage} onClick={() => attachmentInputRef.current?.click()} className="p-1.5 text-chat-muted hover:bg-chat-hover rounded-md disabled:opacity-50">
                  <Paperclip className="w-[18px] h-[18px]" />
                </button>
                <button disabled={isSending || !canSendMessage} className="p-1.5 text-chat-muted hover:bg-chat-hover rounded-md disabled:opacity-50"><FileText className="w-[18px] h-[18px]" /></button>
                <button disabled={isSending || !canSendMessage} className="p-1.5 text-chat-muted hover:bg-chat-hover rounded-md disabled:opacity-50"><Type className="w-[18px] h-[18px]" /></button>
                <button disabled={isSending || !canSendMessage} className="p-1.5 text-chat-muted hover:bg-chat-hover rounded-md disabled:opacity-50"><Maximize className="w-[18px] h-[18px]" /></button>
                <button disabled={isSending || !canSendMessage} className="p-1.5 text-chat-muted hover:bg-chat-hover rounded-md disabled:opacity-50"><Clock className="w-[18px] h-[18px]" /></button>
              </div>

              {/* Reply Preview Bar */}
              {replyingTo && (
                <div className="flex items-center gap-2 px-4 py-2 bg-chat-main border-t border-chat-border border-l-2 border-l-[#0052cc] min-w-0">
                  <Reply className="w-4 h-4 text-[#0052cc] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#0052cc] font-semibold mb-0.5">Trả lời tin nhắn</p>
                    <p className="text-[12px] text-chat-muted truncate">
                      {replyingTo.messageType === "document"
                        ? `[Đơn] ${replyingTo.documentPayload?.templateName || "Tài liệu"}`
                        : replyingTo.messageType === "task_assignment"
                          ? `[Task] ${replyingTo.taskPayload?.title || "Công việc"}`
                          : replyingTo.messageType === "file"
                            ? "[File đính kèm]"
                            : replyingTo.image && !replyingTo.text
                              ? "[Hình ảnh]"
                              : replyingTo.text || "[Tin nhắn]"}
                    </p>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="p-1 rounded-full hover:bg-chat-hover text-[#717171] hover:text-chat-text shrink-0 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Input Area */}
              <div className="flex flex-col border-t border-chat-border relative">

                {/* Image Preview */}
                {imagePreview && (
                  <div className="px-4 py-3 pb-0">
                    <div className="relative inline-block mt-2">
                      <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-md border border-chat-border" />
                      <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-chat-hover flex items-center justify-center text-chat-text hover:bg-red-500 hover:text-white transition-colors"
                        type="button"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {fileAttachment && (
                  <div className="px-4 py-3 pb-0">
                    <div className="relative flex items-center gap-3 w-full max-w-full rounded-2xl border border-chat-border bg-chat-main p-3">
                      <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-chat-hover border border-chat-border">
                        <FileText className="w-5 h-5 text-[#67d7ff]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-chat-text truncate">{fileAttachment.file.name}</p>
                        <p className="text-[12px] text-chat-muted truncate">
                          {fileAttachment.file.type || "Tệp đính kèm"} · {(fileAttachment.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={removeFileAttachment}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-chat-hover flex items-center justify-center text-chat-text hover:bg-red-500 hover:text-white transition-colors"
                        type="button"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                <form
                  onSubmit={handleSendMessage}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col border-t border-chat-border relative ${isDragActive ? 'bg-chat-hover/40' : ''}`}
                >
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onPaste={handlePaste}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val.endsWith(' ')) {
                        const converted = convertEmoticons(val)
                        if (converted !== val) {
                          setText(converted)
                          return
                        }
                      }
                      setText(val)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        const converted = convertEmoticons(text)
                        setText(converted)
                        // dùng converted trực tiếp để không bị stale closure
                        setTimeout(() => handleSendMessage(e), 0)
                      }
                    }}
                    placeholder={!canSendMessage ? "Chỉ quản trị viên mới được gửi tin nhắn" : `Nhập @, tin nhắn tới ${isGroup ? selectedUser.name : selectedUser.fullname}`}
                    className="flex-1 bg-transparent text-[15px] text-chat-text px-4 py-3 outline-none resize-none min-h-[44px] max-h-[120px] custom-scrollbar placeholder:text-chat-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    rows={1}
                    disabled={!canSendMessage}
                  />
                  <div className="flex items-center gap-2 pr-3 pb-0 shrink-0">
                    <div className="flex items-center gap-1 rounded-2xl border border-chat-border bg-chat-hover px-2 py-1">
                      <button
                        type="button"
                        disabled={isSending || !canSendMessage}
                        onClick={handleSendLike}
                        title="Gửi like"
                        className="p-1.5 text-[#ebaa16] hover:bg-chat-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ThumbsUp className="w-5 h-5" />
                      </button>
                      <button
                        name="send"
                        type="submit"
                        disabled={(!text.trim() && !imagePreview && !fileAttachment) || isSending || !canSendMessage}
                        className="p-1.5 text-[#0052cc] hover:bg-chat-hover rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                    {/* Emoji Button + Picker */}
                    <div ref={emojiPickerRef} className="relative">
                      <button
                        type="button"
                        title="Emoji (Ctrl+E)"
                        onClick={() => setShowEmojiPicker(p => !p)}
                        className={`p-1.5 rounded-md transition-colors hover:bg-chat-hover ${showEmojiPicker ? 'text-[#ebaa16]' : 'text-chat-muted'}`}
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-10 right-0 z-50">
                          <EmojiPickerPanel
                            onEmojiSelect={(emoji) => {
                              setText(prev => prev + emoji)
                              setShowEmojiPicker(false)
                              textareaRef.current?.focus()
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-6 border-t border-chat-border">
              <span className="text-[14px] text-chat-muted">Chỉ trưởng/phó nhóm mới có quyền gửi tin nhắn vào nhóm này.</span>
            </div>
          )}
        </div>
      )}

      {/* Document Viewer Modal (Zalo-style lightbox) */}
      {documentViewer && (
        <DocumentViewerModal
          htmlContent={documentViewer.htmlContent}
          templateName={documentViewer.templateName}
          onClose={() => setDocumentViewer(null)}
        />
      )}

      <MessageDetailsModal />
      <ForwardMessageModal />
      <ProfileModal selectedProfile={selectedProfile} onClose={() => setSelectedProfile(null)} />

      {imageModalIndex !== null && imageMessages[imageModalIndex] && (
        <div
          className="fixed inset-0 z-[220] flex items-center justify-center bg-black/85 backdrop-blur-sm px-4 py-6"
          onClick={(e) => { if (e.target === e.currentTarget) closeImageModal() }}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] w-full flex flex-col items-center justify-center gap-4">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); closeImageModal() }}
              className="absolute top-4 right-4 z-20 inline-flex items-center justify-center rounded-full bg-[#111214]/95 p-2 text-[#e1e1e1] hover:bg-white/10 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative w-full max-w-[1000px] max-h-[calc(100vh-120px)] flex flex-col items-center justify-center gap-3">
              <div className="relative w-full flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); showPreviousImage() }}
                  className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-white/20 transition-colors"
                  aria-label="Ảnh trước"
                >
                  ‹
                </button>

                <div
                  className="overflow-hidden rounded-3xl border border-white/10 bg-[#101113]"
                  style={{ maxHeight: '80vh', width: '100%', touchAction: 'none' }}
                  onWheel={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    if (e.deltaY < 0) {
                      setImageZoom((prev) => Math.min(prev + 0.25, 3))
                    } else {
                      setImageZoom((prev) => Math.max(prev - 0.25, 1))
                    }
                  }}
                  onMouseMove={(e) => {
                    if (!isPanning || !dragStart) return
                    e.stopPropagation()
                    const deltaX = e.clientX - dragStart.x
                    const deltaY = e.clientY - dragStart.y
                    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
                      setDidDrag(true)
                    }
                    setImageOffset((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
                    setDragStart({ x: e.clientX, y: e.clientY })
                  }}
                  onMouseUp={(e) => {
                    if (!isPanning) return
                    e.stopPropagation()
                    setIsPanning(false)
                    setDragStart(null)
                  }}
                  onMouseLeave={(e) => {
                    if (!isPanning) return
                    e.stopPropagation()
                    setIsPanning(false)
                    setDragStart(null)
                  }}
                >
                  <img
                    src={imageMessages[imageModalIndex].image}
                    alt={`Ảnh ${imageModalIndex + 1}`}
                    className="w-full object-contain shadow-2xl"
                    style={{
                      transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${imageZoom})`,
                      transition: isPanning ? 'none' : 'transform 0.2s ease',
                      cursor: imageZoom === 1 ? 'zoom-in' : isPanning ? 'grabbing' : 'grab'
                    }}
                    onMouseDown={(e) => {
                      if (imageZoom <= 1) return
                      e.preventDefault()
                      e.stopPropagation()
                      setIsPanning(true)
                      setDragStart({ x: e.clientX, y: e.clientY })
                      setDidDrag(false)
                    }}
                    onClick={(e) => {
                      if (didDrag) {
                        setDidDrag(false)
                        return
                      }
                      e.stopPropagation()
                      setImageZoom((prev) => prev === 1 ? 2 : 1)
                      if (imageZoom === 1) {
                        setImageOffset({ x: 0, y: 0 })
                      }
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); showNextImage() }}
                  className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-white/20 transition-colors"
                  aria-label="Ảnh tiếp"
                >
                  ›
                </button>
              </div>

            </div>

            <div className="w-full max-w-[1000px] flex flex-col items-center gap-3">
              <div className="flex items-center justify-between w-full text-sm text-[#d1d5db]">
                <span>{imageModalIndex + 1} / {imageMessages.length}</span>
                <span>{imageMessages[imageModalIndex].createdAt ? new Date(imageMessages[imageModalIndex].createdAt).toLocaleString() : ""}</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto py-2 w-full">
                {imageMessages.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImageModalIndex(idx) }}
                    className={`relative h-16 min-w-[90px] overflow-hidden rounded-2xl border ${idx === imageModalIndex ? "border-[#0052cc]" : "border-white/10"} shadow-sm bg-[#111214]`}
                  >
                    <img src={item.image} alt={`Thu nhỏ ${idx + 1}`} className="h-full w-full object-cover" />
                    {idx === imageModalIndex && (
                      <span className="absolute inset-x-0 bottom-0 bg-[#000000]/70 text-[11px] text-white text-center py-1">
                        {idx + 1}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 rounded-xl py-1.5 w-56 shadow-2xl overflow-hidden border"
          style={{ top: contextMenu.y, left: contextMenu.x, background: 'var(--chat-dropdown-bg)', borderColor: 'var(--chat-border)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-3 transition-colors text-chat-text hover:bg-chat-hover"
            onClick={async () => {
              try {
                await pinMessage(contextMenu.msg._id);
                setContextMenu(null);
              } catch (error) {
                console.error(error);
              }
            }}
          >
            <Pin className="w-4 h-4 text-chat-muted" />
            {contextMenu.msg.isPinned ? "Bỏ ghim tin nhắn" : "Ghim tin nhắn"}
          </button>
        </div>
      )}
    </div>
  )
}

export interface MessageSender {
  _id: string;
  fullname?: string;
  profilePicture?: string;
}

export interface Message {
  _id: string;
  senderId: string | MessageSender;
  text?: string;
  image?: string;
  createdAt: string;
}

export interface MessageBubbleProps {
  msg: Message;
  onImageLoad?: () => void;
  senderAvatar?: string;
  senderName?: string;
  isGroupChat?: boolean;
  onReply?: (msg: Message) => void;
  onForward?: (msg: Message) => void;
}
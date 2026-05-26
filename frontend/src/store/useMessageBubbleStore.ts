export interface MessageSender {
  _id: string;
  fullname?: string;
  profilePicture?: string;
}

export interface DocumentPayload {
  templateId: string;
  templateName: string;
  fields: Record<string, string>;
  htmlContent: string;
}

export interface DocumentReplyData {
  status: "approved" | "rejected";
  note?: string;
  repliedAt: string;
  repliedBy?: {
    _id: string;
    fullname: string;
    profilePicture: string;
  };
}

export interface TaskPayload {
  taskId: string;
  title: string;
  description: string;
  deadline: string;
  note?: string;
}

export interface Message {
  _id: string;
  senderId: string | MessageSender;
  receiverId?: string;
  text?: string;
  image?: string;
  messageType?: "text" | "document" | "task_assignment";
  documentPayload?: DocumentPayload;
  documentReplyData?: DocumentReplyData;
  taskPayload?: TaskPayload;
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
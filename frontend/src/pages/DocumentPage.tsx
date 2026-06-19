import { useState, useMemo, useEffect } from "react";
import { PrimarySidebar } from "../cchat/sidebar/PrimarySidebar";
import { useChatStore } from "@/store/useChatStore";
import { useCloudStore } from "@/store/useCloudStore";
import type { DocumentItem, DocCategory } from "@/store/useCloudStore";
import { Folder, Loader } from "lucide-react";
import { CloudSidebar } from "../cloud/CloudSidebar";
import { CloudHeader } from "../cloud/CloudHeader";
import { CategoryGrid } from "../cloud/CategoryGrid";
import { DocumentList } from "../cloud/DocumentList";

export default function DocumentPage() {

  const { allContacts, messages, isMessagesLoading, getAllcontacts, getMessagesByUserId } = useChatStore();

  const activeCategory = useCloudStore(state => state.activeCategory);
  const setActiveCategory = useCloudStore(state => state.setActiveCategory);
  const searchQuery = useCloudStore(state => state.searchQuery);
  const setSearchQuery = useCloudStore(state => state.setSearchQuery);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    getAllcontacts();
  }, [getAllcontacts]);

  const selectedUser = useMemo(() => {
    return allContacts.find(u => u._id === selectedUserId) || null;
  }, [allContacts, selectedUserId]);

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setActiveCategory(null);
    getMessagesByUserId(userId);
  };

  // Extract documents từ messages
  const extractedDocuments = useMemo(() => {
    const docs: DocumentItem[] = [];

    if (selectedUserId) {
      // Lấy messages với selected user
      const userMessages = messages.filter(msg =>
        (msg.senderId?._id === selectedUserId || msg.senderId === selectedUserId) ||
        (msg.receiverId?._id === selectedUserId || msg.receiverId === selectedUserId)
      );

      // Extract documents từ messages
      userMessages.forEach((msg, idx) => {
        // Files/Images/Links
        if (msg.file) {
          const fileName = msg.file.name || `document_${idx}`;
          const ext = fileName.split('.').pop()?.toLowerCase() || '';
          let category: DocCategory = 'files';

          if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
            category = 'images';
          } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'json', 'zip', 'rar'].includes(ext)) {
            category = 'files';
          } else if (['http', 'www', 'ftp'].some(prefix => msg.file?.url?.includes(prefix))) {
            category = 'links';
          }

          docs.push({
            id: msg._id || `msg_${idx}`,
            name: fileName,
            category,
            date: new Date(msg.createdAt).toLocaleDateString('vi-VN'),
            size: msg.file.size ? `${(msg.file.size / 1024 / 1024).toFixed(1)} MB` : undefined,
            url: msg.file.url,
          });
        }

        if (msg.image) {
          let sizeLabel = "Không rõ";
          if (msg.image.startsWith("data:image")) {
            const base64Str = msg.image.split(",")[1];
            if (base64Str) {
              const sizeBytes = base64Str.length * 0.75 - (base64Str.endsWith("==") ? 2 : base64Str.endsWith("=") ? 1 : 0);
              if (sizeBytes > 1024 * 1024) sizeLabel = (sizeBytes / 1024 / 1024).toFixed(1) + " MB";
              else sizeLabel = (sizeBytes / 1024).toFixed(1) + " KB";
            }
          }
          docs.push({
            id: msg._id || `img_${idx}`,
            name: `Hình ảnh`,
            category: "images",
            date: new Date(msg.createdAt).toLocaleDateString('vi-VN'),
            size: sizeLabel,
            url: msg.image,
          });
        }

        // Forms (Đơn từ)
        if (msg.documentPayload) {
          docs.push({
            id: msg._id || `form_${idx}`,
            name: msg.documentPayload.templateName || "Biểu mẫu",
            category: "forms",
            date: new Date(msg.createdAt).toLocaleDateString('vi-VN'),
            status: msg.documentReplyData?.status || "pending",
            htmlContent: msg.documentPayload.htmlContent,
            isTask: false
          });
        }

        // Removed tasks as requested
      });
    }

    return docs;
  }, [selectedUserId, messages]);

  const userDocs = useMemo(() => {
    return extractedDocuments.filter(d => !activeCategory || d.category === activeCategory);
  }, [extractedDocuments, activeCategory]);

  const docCounts = useMemo(() => {
    return {
      files: extractedDocuments.filter(d => d.category === 'files').length,
      images: extractedDocuments.filter(d => d.category === 'images').length,
      links: extractedDocuments.filter(d => d.category === 'links').length,
      forms: extractedDocuments.filter(d => d.category === 'forms').length,
    };
  }, [extractedDocuments]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-chat-main text-chat-text font-sans">
      <PrimarySidebar activeTab="cloud" />

      <CloudSidebar
        selectedUserId={selectedUserId}
        onSelectUser={handleSelectUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-chat-main">
        {!selectedUser ? (
          <div className="flex-1 flex items-center justify-center text-chat-muted">
            <div className="text-center">
              <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Chọn một liên hệ bên trái để xem tài liệu được trao đổi.</p>
            </div>
          </div>
        ) : (
          <>
            <CloudHeader
              activeCategory={activeCategory}
              onBack={() => setActiveCategory(null)}
              selectedUser={selectedUser}
            />

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {isMessagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader className="w-6 h-6 animate-spin text-chat-muted" />
                </div>
              ) : !activeCategory ? (
                <CategoryGrid docCounts={docCounts} onSelectCategory={setActiveCategory} />
              ) : (
                <DocumentList activeCategory={activeCategory} userDocs={userDocs} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

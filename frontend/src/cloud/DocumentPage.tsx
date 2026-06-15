import { useState, useMemo, useEffect } from "react";
import { PrimarySidebar } from "../cchat/sidebar/PrimarySidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { mockDocs, type DocCategory } from "./data";
import { Folder, Image as ImageIcon, Link as LinkIcon, FileText, File, Download, ExternalLink, ChevronLeft, Search, Loader } from "lucide-react";

interface DocumentItem {
  id: string;
  name: string;
  category: DocCategory;
  date: string;
  size?: string;
  url?: string;
  status?: "pending" | "approved" | "rejected";
}

export default function DocumentPage() {
  const { authUser } = useAuthStore();
  const { allContacts, messages, isContactsLoading, isMessagesLoading, getAllcontacts, getMessagesByUserId } = useChatStore();

  useEffect(() => {
    getAllcontacts();
  }, [getAllcontacts]);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<DocCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Lọc contact dựa trên search query
  const filteredContacts = useMemo(() => {
    return allContacts.filter(contact =>
      contact.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allContacts, searchQuery]);

  const selectedUser = filteredContacts.find(u => u._id === selectedUserId);

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
        if (msg.file) {
          const fileName = msg.file.name || `document_${idx}`;
          const ext = fileName.split('.').pop()?.toLowerCase() || '';
          let category: DocCategory = 'files';
          
          // Phân loại dựa trên extension
          if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
            category = 'images';
          } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'json'].includes(ext)) {
            category = 'files';
          } else if (['http', 'www', 'ftp'].some(prefix => msg.file.url?.includes(prefix))) {
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
      });
    }

    return docs;
  }, [selectedUserId, messages]);

  const userDocs = useMemo(() => {
    return extractedDocuments.filter(d => !activeCategory || d.category === activeCategory);
  }, [extractedDocuments, activeCategory]);

  // Count documents theo category
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

      {/* Sidebar contact */}
      <div className="w-[300px] bg-chat-sidebar border-r border-chat-border flex flex-col shrink-0 z-10">
        <div className="p-4 border-b border-chat-border shrink-0">
          <h2 className="text-lg font-bold text-chat-text">Tài liệu Trao đổi</h2>
          <p className="text-[13px] text-chat-muted mt-0.5">Tin nhắn & File</p>
        </div>

        <div className="p-3 border-b border-chat-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-chat-muted" />
            <input
              type="text"
              placeholder="Tìm liên hệ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-chat-main border border-chat-border rounded-md pl-9 pr-3 py-1.5 text-sm text-chat-text focus:outline-none focus:border-[#0052cc]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {isContactsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader className="w-4 h-4 animate-spin text-chat-muted" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-4 text-chat-muted text-sm">
              Không có liên hệ
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <button
                key={contact._id}
                onClick={() => {
                  setSelectedUserId(contact._id);
                  setActiveCategory(null);
                  getMessagesByUserId(contact._id);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-md transition-colors ${selectedUserId === contact._id ? "bg-chat-active text-chat-text font-semibold" : "hover:bg-chat-hover text-chat-text/90"
                  }`}
              >
                <img src={contact.profilePicture || "/avatar.png"} alt={contact.fullname} className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div className="text-left flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{contact.fullname}</p>
                  <p className="text-[12px] text-chat-muted truncate">{contact.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

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
            {/* Header */}
            <div className="h-[60px] border-b border-chat-border flex items-center px-6 shrink-0 bg-chat-header/50 backdrop-blur-md">
              {activeCategory ? (
                <button
                  onClick={() => setActiveCategory(null)}
                  className="flex items-center gap-2 text-chat-muted hover:text-chat-text transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="font-medium">Quay lại danh mục</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <img src={selectedUser.profilePicture || "/avatar.png"} alt={selectedUser.fullname} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <h2 className="font-bold text-chat-text text-sm">{selectedUser.fullname}</h2>
                    <p className="text-xs text-chat-muted">Tài liệu trao đổi</p>
                  </div>
                </div>
              )}
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {isMessagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader className="w-6 h-6 animate-spin text-chat-muted" />
                </div>
              ) : !activeCategory ? (
                // 4 Thư mục
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <button onClick={() => setActiveCategory("files")} className="bg-chat-sidebar border border-chat-border p-6 rounded-xl hover:border-[#0052cc] hover:bg-[#0052cc]/5 transition-all text-left group relative">
                    <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {docCounts.files}
                    </div>
                    <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Folder className="w-7 h-7 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold text-chat-text mb-1">Tệp tin (Files)</h3>
                    <p className="text-sm text-chat-muted">Văn bản, tài liệu Word, Excel, PDF</p>
                  </button>

                  <button onClick={() => setActiveCategory("images")} className="bg-chat-sidebar border border-chat-border p-6 rounded-xl hover:border-purple-500 hover:bg-purple-500/5 transition-all text-left group relative">
                    <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {docCounts.images}
                    </div>
                    <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-7 h-7 text-purple-500" />
                    </div>
                    <h3 className="text-lg font-bold text-chat-text mb-1">Hình ảnh (Images)</h3>
                    <p className="text-sm text-chat-muted">Ảnh, hình nền, thiết kế</p>
                  </button>

                  <button onClick={() => setActiveCategory("links")} className="bg-chat-sidebar border border-chat-border p-6 rounded-xl hover:border-green-500 hover:bg-green-500/5 transition-all text-left group relative">
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {docCounts.links}
                    </div>
                    <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <LinkIcon className="w-7 h-7 text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-chat-text mb-1">Liên kết (Links)</h3>
                    <p className="text-sm text-chat-muted">URL, Figma, Google Drive, Github</p>
                  </button>

                  <button onClick={() => setActiveCategory("forms")} className="bg-chat-sidebar border border-chat-border p-6 rounded-xl hover:border-orange-500 hover:bg-orange-500/5 transition-all text-left group relative">
                    <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {docCounts.forms}
                    </div>
                    <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileText className="w-7 h-7 text-orange-500" />
                    </div>
                    <h3 className="text-lg font-bold text-chat-text mb-1">Biểu mẫu (Forms)</h3>
                    <p className="text-sm text-chat-muted">Đơn từ, hóa đơn, v.v.</p>
                  </button>
                </div>
              ) : (
                // Chi tiết danh sách bên trong thư mục
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-chat-text capitalize flex items-center gap-3">
                      {activeCategory === "files" && <Folder className="w-6 h-6 text-blue-500" />}
                      {activeCategory === "images" && <ImageIcon className="w-6 h-6 text-purple-500" />}
                      {activeCategory === "links" && <LinkIcon className="w-6 h-6 text-green-500" />}
                      {activeCategory === "forms" && <FileText className="w-6 h-6 text-orange-500" />}
                      {activeCategory === "files" ? "Tệp tin" : activeCategory === "images" ? "Hình ảnh" : activeCategory === "links" ? "Liên kết" : "Biểu mẫu"}
                    </h2>
                  </div>

                  <div className="bg-chat-sidebar border border-chat-border rounded-xl overflow-hidden shadow-sm">
                    {userDocs.length === 0 ? (
                      <div className="p-12 text-center text-chat-muted">
                        Thư mục này hiện đang trống.
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-chat-hover/30 border-b border-chat-border">
                            <th className="px-4 py-3 text-sm font-semibold text-chat-muted">Tên tài liệu</th>
                            <th className="px-4 py-3 text-sm font-semibold text-chat-muted w-[150px]">Ngày tạo</th>
                            <th className="px-4 py-3 text-sm font-semibold text-chat-muted w-[150px]">Kích thước</th>
                            <th className="px-4 py-3 text-sm font-semibold text-chat-muted w-[80px]"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-chat-border">
                          {userDocs.map(doc => (
                            <tr key={doc.id} className="hover:bg-chat-hover/30 transition-colors group">
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <File className="w-5 h-5 text-chat-muted" />
                                  <span className="font-medium text-chat-text">{doc.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-sm text-chat-muted">{doc.date}</td>
                              <td className="px-4 py-4 text-sm text-chat-muted">{doc.size || "-"}</td>
                              <td className="px-4 py-4 text-right">
                                {doc.url ? (
                                  <a href={doc.url} target="_blank" rel="noreferrer" className="inline-flex p-2 text-chat-muted hover:text-[#0052cc] transition-colors rounded">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                ) : (
                                  <button className="p-2 text-chat-muted hover:text-[#0052cc] transition-colors rounded">
                                    <Download className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

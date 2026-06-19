import { useState } from "react";
import { X, Folder, Image as ImageIcon, Link as LinkIcon, FileText, File, Download, ExternalLink, Eye } from "lucide-react";
import type { DocCategory, DocumentItem } from "@/store/useCloudStore";

interface DocumentListProps {
  activeCategory: DocCategory;
  userDocs: DocumentItem[];
}

function PreviewModal({ title, content, type, onClose }: { title: string, content: string, type: "image" | "html", onClose: () => void }) {
  if (type === "image") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors bg-black/50 rounded-full">
          <X className="w-6 h-6" />
        </button>
        <img src={content} alt={title} className="max-w-full max-h-full object-contain" onClick={e => e.stopPropagation()} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-[#f0f2f5] w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shadow-sm z-10">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 custom-scrollbar flex justify-center bg-[#f0f2f5]">
          <div className="bg-white p-8 shadow-sm border border-gray-200 w-full max-w-[800px] text-black" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
}

export function DocumentList({ activeCategory, userDocs }: DocumentListProps) {
  const [previewData, setPreviewData] = useState<{ title: string, content: string, type: "image" | "html" } | null>(null);

  const handleDownload = (doc: DocumentItem) => {
    if (doc.url) {
      const a = document.createElement('a');
      a.href = doc.url;
      a.download = doc.name;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (doc.htmlContent) {
      const blob = new Blob([doc.htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.name}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {previewData && (
        <PreviewModal
          title={previewData.title}
          content={previewData.content}
          type={previewData.type}
          onClose={() => setPreviewData(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-chat-text capitalize flex items-center gap-3">
          {activeCategory === "files" && <Folder className="w-6 h-6 text-blue-500" />}
          {activeCategory === "images" && <ImageIcon className="w-6 h-6 text-purple-500" />}
          {activeCategory === "links" && <LinkIcon className="w-6 h-6 text-green-500" />}
          {activeCategory === "forms" && <FileText className="w-6 h-6 text-orange-500" />}
          {activeCategory === "files" ? "Tệp tin" : activeCategory === "images" ? "Hình ảnh" : activeCategory === "links" ? "Liên kết" : "Biểu mẫu & Nhiệm vụ"}
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
                <th className="px-4 py-3 text-sm font-semibold text-chat-muted w-[150px]">Kích thước / T.Thái</th>
                <th className="px-4 py-3 text-sm font-semibold text-chat-muted w-[120px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-chat-border">
              {userDocs.map(doc => {
                const isClickable = (activeCategory === "images" && doc.url) || (activeCategory === "forms" && doc.htmlContent);
                return (
                  <tr
                    key={doc.id}
                    onClick={() => {
                      if (isClickable) {
                        setPreviewData({
                          title: doc.name,
                          content: activeCategory === "images" ? doc.url! : doc.htmlContent!,
                          type: activeCategory === "images" ? "image" : "html"
                        });
                      }
                    }}
                    className={`hover:bg-chat-hover/30 transition-colors group ${isClickable ? 'cursor-pointer' : ''}`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <File className="w-5 h-5 text-chat-muted" />
                        <span className="font-medium text-chat-text line-clamp-1">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-chat-muted">{doc.date}</td>
                    <td className="px-4 py-4 text-sm">
                      {activeCategory === "forms" ? (
                        doc.isTask ? (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${doc.taskStatus === "done" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            doc.taskStatus === "rejected" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                              doc.status === "overdue" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            }`}>
                            {doc.taskStatus === "done" ? "Hoàn thành" : doc.taskStatus === "rejected" ? "Làm lại" : doc.status === "overdue" ? "Quá hạn" : "Đang chờ"}
                          </span>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${doc.status === "approved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            doc.status === "rejected" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                              "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            }`}>
                            {doc.status === "approved" ? "Đã duyệt" : doc.status === "rejected" ? "Từ chối" : "Đang chờ"}
                          </span>
                        )
                      ) : (
                        <span className="text-chat-muted">{doc.size || "-"}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {activeCategory === "links" && doc.url && (
                          <a href={doc.url} onClick={e => e.stopPropagation()} target="_blank" rel="noreferrer" className="p-2 text-chat-muted hover:text-[#0052cc] transition-colors rounded" title="Truy cập liên kết">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        {(activeCategory === "images" && doc.url) || (activeCategory === "forms" && doc.htmlContent) ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewData({
                                title: doc.name,
                                content: activeCategory === "images" ? doc.url! : doc.htmlContent!,
                                type: activeCategory === "images" ? "image" : "html"
                              });
                            }}
                            className="p-2 text-chat-muted hover:text-[#0052cc] transition-colors rounded"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : null}

                        {(activeCategory === "files" || activeCategory === "forms" || activeCategory === "images") && (
                          <button onClick={(e) => { e.stopPropagation(); handleDownload(doc); }} className="p-2 text-chat-muted hover:text-[#0052cc] transition-colors rounded" title="Tải xuống">
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

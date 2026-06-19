import { Folder, Image as ImageIcon, Link as LinkIcon, FileText } from "lucide-react";
import type { DocCategory } from "@/store/useCloudStore";

interface CategoryGridProps {
  docCounts: {
    files: number;
    images: number;
    links: number;
    forms: number;
  };
  onSelectCategory: (category: DocCategory) => void;
}

export function CategoryGrid({ docCounts, onSelectCategory }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <button onClick={() => onSelectCategory("files")} className="bg-chat-sidebar border border-chat-border p-6 rounded-xl hover:border-[#0052cc] hover:bg-[#0052cc]/5 transition-all text-left group relative">
        <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {docCounts.files}
        </div>
        <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Folder className="w-7 h-7 text-blue-500" />
        </div>
        <h3 className="text-lg font-bold text-chat-text mb-1">Tệp tin (Files)</h3>
        <p className="text-sm text-chat-muted">Văn bản, tài liệu Word, Excel, PDF</p>
      </button>

      <button onClick={() => onSelectCategory("images")} className="bg-chat-sidebar border border-chat-border p-6 rounded-xl hover:border-purple-500 hover:bg-purple-500/5 transition-all text-left group relative">
        <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {docCounts.images}
        </div>
        <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <ImageIcon className="w-7 h-7 text-purple-500" />
        </div>
        <h3 className="text-lg font-bold text-chat-text mb-1">Hình ảnh (Images)</h3>
        <p className="text-sm text-chat-muted">Ảnh, hình nền, thiết kế</p>
      </button>

      <button onClick={() => onSelectCategory("links")} className="bg-chat-sidebar border border-chat-border p-6 rounded-xl hover:border-green-500 hover:bg-green-500/5 transition-all text-left group relative">
        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {docCounts.links}
        </div>
        <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <LinkIcon className="w-7 h-7 text-green-500" />
        </div>
        <h3 className="text-lg font-bold text-chat-text mb-1">Liên kết (Links)</h3>
        <p className="text-sm text-chat-muted">URL, Figma, Google Drive, Github</p>
      </button>

      <button onClick={() => onSelectCategory("forms")} className="bg-chat-sidebar border border-chat-border p-6 rounded-xl hover:border-orange-500 hover:bg-orange-500/5 transition-all text-left group relative">
        <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {docCounts.forms}
        </div>
        <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <FileText className="w-7 h-7 text-orange-500" />
        </div>
        <h3 className="text-lg font-bold text-chat-text mb-1">Biểu mẫu & Nhiệm vụ</h3>
        <p className="text-sm text-chat-muted">Đơn từ, hóa đơn, task, v.v.</p>
      </button>
    </div>
  );
}

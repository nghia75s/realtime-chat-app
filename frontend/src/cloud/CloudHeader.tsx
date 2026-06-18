import { ChevronLeft } from "lucide-react";
import type { DocCategory } from "@/store/useCloudStore";

interface CloudHeaderProps {
  activeCategory: DocCategory | null;
  onBack: () => void;
  selectedUser: any | null;
}

export function CloudHeader({ activeCategory, onBack, selectedUser }: CloudHeaderProps) {
  if (!selectedUser) return null;

  return (
    <div className="h-[60px] border-b border-chat-border flex items-center px-6 shrink-0 bg-chat-header/50 backdrop-blur-md">
      {activeCategory ? (
        <button
          onClick={onBack}
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
  );
}

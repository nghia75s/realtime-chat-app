import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useChatStore } from "@/store/useChatStore";

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

export function CreateNoteModal({ isOpen, onClose, groupId }: CreateNoteModalProps) {
  const [content, setContent] = useState("");
  const [pinToTop, setPinToTop] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createNote } = useChatStore();

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await createNote(groupId, { content, pinToTop });
      setContent("");
      setPinToTop(true);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#2b2d31] border-[#1e1f22] text-[#e1e1e1] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Tạo ghi chú</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <textarea
              className="min-h-[120px] bg-[#1e1f22] border-none rounded-md p-3 text-white placeholder-[#a1a1a1] resize-none focus:outline-none focus:ring-1 focus:ring-[#1877F2]"
              placeholder="Nhập nội dung ghi chú..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded bg-[#1e1f22] border-[#2b2d31] text-[#1877F2] focus:ring-[#1877F2]"
              checked={pinToTop}
              onChange={(e) => setPinToTop(e.target.checked)}
            />
            <span className="text-sm">Ghim lên đầu đoạn chat</span>
          </label>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 border-t-0 bg-[#2b2d31]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-transparent hover:bg-[#3f4147] transition-colors text-sm font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="px-4 py-2 rounded-md bg-[#1877F2] hover:bg-[#166fe5] text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Đang tạo..." : "Tạo ghi chú"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

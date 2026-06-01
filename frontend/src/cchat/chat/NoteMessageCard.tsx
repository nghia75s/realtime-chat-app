import { FileText } from "lucide-react";

export function NoteMessageCard({ message }: { message: any }) {
  const content = message.notePayload?.content || message.text || "Nội dung ghi chú trống";

  return (
    <div className="flex flex-col gap-2 bg-[#1e1f22] p-4 rounded-xl border border-[#3f4147] shadow-sm w-full">
      <div className="flex items-center gap-2 mb-1">
        <FileText className="w-5 h-5 text-[#1877F2]" />
        <span className="text-xs font-semibold uppercase text-[#1877F2]">Ghi chú</span>
      </div>
      <div className="text-[14px] text-[#e1e1e1] break-words whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  );
}

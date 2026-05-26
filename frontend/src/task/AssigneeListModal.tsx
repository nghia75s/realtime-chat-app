import { useState } from "react"
import { X, StickyNote, Eye, EyeOff } from "lucide-react"
import type { TaskItem } from "@/store/useTaskStore"
import { useTaskStore } from "@/store/useTaskStore"

interface AssigneeListModalProps {
  task: TaskItem;
  isCreatorOrAdmin: boolean;
  onClose: () => void;
}

export function AssigneeListModal({ task, isCreatorOrAdmin, onClose }: AssigneeListModalProps) {
  const { updateAccess } = useTaskStore();
  const [accessLoadingId, setAccessLoadingId] = useState<string | null>(null);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-[350px] bg-[#1e1f22] border border-[#2b2d31] rounded-xl shadow-2xl flex flex-col p-5 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2b2d31]">
          <h3 className="text-white font-semibold text-[15px]">Được giao cho ({task.assignees.length})</h3>
          <button
            onClick={onClose}
            className="text-[#a1a1a1] hover:text-white p-1 hover:bg-[#2b2d31] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
          {task.assignees.map(a => (
            <div
              key={a.user?._id || Math.random()}
              className="flex flex-col gap-2 p-3 bg-[#131416] rounded-md border border-[#2b2d31]"
            >
              <div className="flex items-center gap-3">
                <img
                  src={a.user?.profilePicture || "/avatar.png"}
                  className="w-8 h-8 rounded-full border border-[#2b2d31] object-cover"
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[14px] text-[#e1e1e1] font-medium truncate">{a.user?.fullname || "Unknown"}</span>
                  <span className="text-[12px] text-[#a1a1a1]">
                    {a.status === 'done'
                      ? 'Hoàn thành'
                      : a.status === 'submitted'
                      ? 'Đã nộp bài'
                      : a.status === 'rejected'
                      ? 'Cần làm lại'
                      : 'Đang chờ'}
                  </span>
                </div>
              </div>
              {a.personalNote && (
                <div className="flex items-start gap-1.5 text-[12px] text-[#a1a1a1] bg-[#1e1f22] px-2 py-1.5 rounded border border-[#2b2d31]">
                  <StickyNote className="w-3 h-3 shrink-0 mt-0.5 text-[#0052cc]" />
                  <span className="italic">{a.personalNote}</span>
                </div>
              )}
              {/* Feature 2c: canViewOthers toggle — chỉ creator/manager thấy */}
              {isCreatorOrAdmin && task.assignees.length > 1 && (
                <div className="flex items-center justify-between pt-1 border-t border-[#2b2d31]">
                  <span className="text-[12px] text-[#a1a1a1] flex items-center gap-1">
                    {a.canViewOthers ? <Eye className="w-3.5 h-3.5 text-[#0052cc]" /> : <EyeOff className="w-3.5 h-3.5" />}
                    Xem bài của người khác
                  </span>
                  <button
                    disabled={accessLoadingId === a._id}
                    onClick={async () => {
                      setAccessLoadingId(a._id);
                      await updateAccess(task._id, a.user._id, !a.canViewOthers);
                      setAccessLoadingId(null);
                    }}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-300 shrink-0 ${
                      a.canViewOthers ? "bg-[#0052cc]" : "bg-[#2b2d31]"
                    } ${accessLoadingId === a._id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${
                        a.canViewOthers ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

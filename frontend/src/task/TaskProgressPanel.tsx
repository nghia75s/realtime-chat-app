import type { TaskItem } from "@/store/useTaskStore"
import { BarChart2, StickyNote } from "lucide-react"

interface TaskProgressPanelProps {
  task: TaskItem;
}

export function TaskProgressPanel({ task }: TaskProgressPanelProps) {
  if (task.assignees.length === 0) return null;

  const doneCount = task.assignees.filter(a => a.status === "done").length;
  const progress = Math.round((doneCount / task.assignees.length) * 100);

  const getAssigneeStatusLabel = (status: string) => {
    switch (status) {
      case "done":
        return { label: "Hoàn thành", cls: "bg-green-500/20 text-green-400 border-green-500/30" };
      case "submitted":
        return { label: "Đã nộp bài", cls: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
      case "rejected":
        return { label: "Cần làm lại", cls: "bg-red-500/20 text-red-400 border-red-500/30" };
      default:
        return { label: "Đang chờ", cls: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    }
  };

  const getSubmitCount = (userId: string) =>
    task.commits.filter(c => c.type === "commit" && c.userId?._id === userId).length;

  const getLastCommitTime = (userId: string) => {
    const commits = task.commits.filter(c => c.type === "commit" && c.userId?._id === userId);
    if (!commits.length) return null;
    return new Date(commits[commits.length - 1].createdAt).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border" style={{ background: 'var(--chat-bg-sidebar)', borderColor: 'var(--chat-border)' }}>
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold text-chat-muted tracking-wider uppercase flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5" /> Tiến độ công việc
        </span>
        <span className="text-[13px] font-semibold text-chat-text">{doneCount}/{task.assignees.length}</span>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--chat-border)' }}>
        <div
          className="h-full bg-gradient-to-r from-[#0052cc] to-green-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-[11px] text-chat-muted">{progress}% hoàn thành</span>
      {/* Per-assignee rows */}
      <div className="flex flex-col gap-2 mt-1">
        {task.assignees.map(a => {
          const { label, cls } = getAssigneeStatusLabel(a.status);
          const submitCount = getSubmitCount(a.user?._id);
          const lastTime = getLastCommitTime(a.user?._id);
          return (
            <div key={a._id} className="flex flex-col gap-1.5 p-3 rounded-md border" style={{ background: 'var(--chat-bg-main)', borderColor: 'var(--chat-border)' }}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={a.user?.profilePicture || "/avatar.png"} className="w-6 h-6 rounded-full object-cover shrink-0" />
                  <span className="text-[13px] text-chat-text font-medium truncate">{a.user?.fullname || "Unknown"}</span>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border shrink-0 ${cls}`}>{label}</span>
              </div>
              {a.personalNote && (
                <div className="flex items-start gap-1.5 text-[12px] text-chat-muted">
                  <StickyNote className="w-3 h-3 shrink-0 mt-0.5 text-[#0052cc]" />
                  <span className="italic">{a.personalNote}</span>
                </div>
              )}
              <div className="text-[11px] text-chat-muted flex items-center gap-2">
                {submitCount > 0 ? (
                  <span>Đã nộp {submitCount} lần · Lần cuối: {lastTime}</span>
                ) : (
                  <span>Chưa nộp bài</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from "react"
import { Clock, Paperclip, CheckCircle2, XCircle, Edit2, MessageSquareReply, Send } from "lucide-react"
import type { TaskItem, CommitType } from "@/store/useTaskStore"
import { useTaskStore } from "@/store/useTaskStore"

interface TaskTimelineProps {
  task: TaskItem;
  role: "manager" | "employee";
  authUser: any;
}

export function TaskTimeline({ task, role, authUser }: TaskTimelineProps) {
  const { addCommit } = useTaskStore();
  const [evaluatingCommitId, setEvaluatingCommitId] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectText, setRejectText] = useState("");
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState<string | null>(null);

  const isCreatorOrAdmin = !!(authUser?._id === task.creator?._id || authUser?.permissions?.approveTasks);

  const handleManagerApprove = async (targetId: string) => {
    await addCommit(task._id, { type: "approve", description: "Duyệt nội dung.", targetCommitId: targetId });
    setEvaluatingCommitId(null);
  }

  const handleManagerReject = async (targetId: string) => {
    if (!rejectText.trim()) return;
    await addCommit(task._id, { type: "reject", description: rejectText, targetCommitId: targetId });
    setRejectText("");
    setIsRejecting(false);
    setEvaluatingCommitId(null);
  }

  const renderCommitIcon = (type: CommitType | "edit") => {
    switch (type) {
      case "create":
        return <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/30"><Clock className="w-4 h-4" /></div>;
      case "edit":
        return <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0 border border-yellow-500/30"><Edit2 className="w-4 h-4" /></div>;
      case "commit":
        return <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/30"><FileTextIcon className="w-4 h-4" /></div>;
      case "approve":
        return <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0 border border-green-500/30"><CheckCircle2 className="w-4 h-4" /></div>;
      case "reject":
        return <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 border border-red-500/30"><XCircle className="w-4 h-4" /></div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-gray-500/20 text-gray-400 flex items-center justify-center shrink-0 border border-gray-500/30"><Clock className="w-4 h-4" /></div>;
    }
  };

  // Helper component for FileText because lucide-react uses FileText
  function FileTextIcon({ className }: { className?: string }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    )
  }

  const primaryCommits = task.commits.filter(c => {
    if (c.targetCommitId) return false;
    if (selectedAssigneeFilter && c.type === "commit") {
      return c.userId?._id === selectedAssigneeFilter;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="shrink-0 mb-4">
        <h3 className="text-[16px] font-semibold text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0052cc]" /> Lịch sử hoạt động
        </h3>
        {/* Assignee filter tabs */}
        {task.assignees.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedAssigneeFilter(null)}
              className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors border ${
                selectedAssigneeFilter === null
                  ? "bg-[#0052cc] border-[#0052cc] text-white"
                  : "border-[#2b2d31] text-[#a1a1a1] hover:text-white hover:border-[#4a4d52]"
              }`}
            >
              Tất cả
            </button>
            {task.assignees.map(a => (
              <button
                key={a._id}
                onClick={() => setSelectedAssigneeFilter(
                  selectedAssigneeFilter === a.user?._id ? null : a.user?._id
                )}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium transition-colors border ${
                  selectedAssigneeFilter === a.user?._id
                    ? "bg-[#0052cc] border-[#0052cc] text-white"
                    : "border-[#2b2d31] text-[#a1a1a1] hover:text-white hover:border-[#4a4d52]"
                }`}
              >
                <img src={a.user?.profilePicture || "/avatar.png"} className="w-4 h-4 rounded-full object-cover" />
                {a.user?.fullname?.split(" ").pop()}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 relative">
        {/* Timeline Line */}
        <div className="absolute top-4 bottom-4 left-4 w-0.5 bg-[#2b2d31]"></div>

        <div className="flex flex-col gap-6 relative pb-6">
          {primaryCommits.map((primaryCommit) => {
            const evaluations = task.commits.filter(c => c.targetCommitId === primaryCommit._id);
            const hasEvaluated = evaluations.some(e => e.type === 'approve' || e.type === 'reject');
            const isEvaluating = evaluatingCommitId === primaryCommit._id;

            return (
              <div key={primaryCommit._id} className="flex gap-4 group">
                <div className="z-10">{renderCommitIcon(primaryCommit.type)}</div>
                <div className="flex-1 bg-[#1e1f22] border border-[#2b2d31] p-4 rounded-lg shadow-sm group-hover:border-[#0052cc]/30 transition-colors flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <img src={primaryCommit.userId?.profilePicture || "/avatar.png"} className="w-6 h-6 rounded-full object-cover" />
                      <span className="font-semibold text-white text-[14px]">{primaryCommit.userId?.fullname || "Unknown"}</span>
                    </div>
                    <span className="text-[12px] text-[#a1a1a1]">
                      {new Date(primaryCommit.createdAt).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-[14px] text-[#e1e1e1] leading-relaxed">{primaryCommit.description}</p>

                  {primaryCommit.fileName && (
                    <div className="mt-2 flex items-center gap-2 bg-[#131416] border border-[#2b2d31] w-max px-3 py-2 rounded-md hover:bg-[#2b2d31] cursor-pointer transition-colors">
                      <Paperclip className="w-4 h-4 text-[#a1a1a1]" />
                      <span className="text-[13px] text-[#e1e1e1] max-w-[200px] truncate">{primaryCommit.fileName}</span>
                    </div>
                  )}

                  {/* Display nested Feedback/Evaluations */}
                  {evaluations.length > 0 && (
                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-[#2b2d31] relative">
                      <div className="absolute top-0 left-4 w-px h-full bg-[#2b2d31]" />
                      {evaluations.map(evalCommit => (
                        <div key={evalCommit._id} className={`ml-8 p-3 rounded-md border ${evalCommit.type === 'reject' ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'} animate-in fade-in slide-in-from-top-2 duration-300`}>
                          <div className="flex items-center gap-2 mb-1.5">
                            {evalCommit.type === 'reject' ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            <span className="font-semibold text-[13px] text-white">{evalCommit.userId?.fullname || "Unknown"} <span className="opacity-60 text-xs ml-1">(Quản lý)</span></span>
                            <span className="text-[12px] text-[#a1a1a1] ml-auto">
                              {new Date(evalCommit.createdAt).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}
                            </span>
                          </div>
                          <p className={`text-[13px] leading-relaxed ${evalCommit.type === 'reject' ? 'text-red-100' : 'text-green-100'}`}>{evalCommit.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Manager Action Form */}
                  {role === 'manager' && primaryCommit.type === 'commit' && !hasEvaluated && task.status !== 'done' && (
                    <div className="mt-3 pt-3 border-t border-[#2b2d31]">
                      {isEvaluating ? (
                        <div className="bg-[#131416] border border-blue-500/30 p-4 rounded-md flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
                          <p className="text-[13px] text-[#e1e1e1] font-medium">Nhận xét bản thảo của {primaryCommit.userId.fullname}:</p>
                          {!isRejecting ? (
                            <div className="flex gap-3 mt-1">
                              <button onClick={() => setIsRejecting(true)} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded-md text-[13px] font-semibold transition-colors">Yêu cầu làm lại</button>
                              <button onClick={() => handleManagerApprove(primaryCommit._id)} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-[13px] font-semibold transition-colors flex-1 shadow-sm">Duyệt Đạt</button>
                              <button onClick={() => setEvaluatingCommitId(null)} className="px-3 py-2 text-[#a1a1a1] hover:text-white transition-colors">Hủy</button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3">
                              <textarea
                                value={rejectText}
                                onChange={e => setRejectText(e.target.value)}
                                placeholder="Ghi rõ lý do cần sửa..."
                                className="w-full bg-[#1e1f22] border border-[#2b2d31] rounded-md p-3 text-[14px] focus:border-red-500 outline-none resize-none placeholder:text-[#a1a1a1]"
                                rows={3}
                              />
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => setIsRejecting(false)} className="px-4 py-2 text-[13px] text-[#a1a1a1] hover:text-white transition-colors">Quay lại</button>
                                <button onClick={() => handleManagerReject(primaryCommit._id)} disabled={!rejectText.trim()} className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-md text-[13px] font-semibold transition-colors flex items-center gap-2"><Send className="w-3.5 h-3.5" /> Gửi phản hồi</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : isCreatorOrAdmin && primaryCommit.userId?._id !== authUser?._id ? (
                        <button
                          onClick={() => setEvaluatingCommitId(primaryCommit._id)}
                          className="text-[13px] text-[#0052cc] hover:text-white hover:bg-[#0052cc] px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 font-medium border border-[#0052cc]/50 hover:border-transparent w-max"
                        >
                          <MessageSquareReply className="w-4 h-4" /> Đánh giá bản thảo này
                        </button>
                      ) : null}
                    </div>
                  )}

                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

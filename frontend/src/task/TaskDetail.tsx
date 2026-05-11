import { useState, useRef } from "react"
import { ChevronLeft, Paperclip, CheckCircle2, XCircle, Clock, FileText, Send, X, MessageSquareReply } from "lucide-react"
import type { Role, TaskItem, CommitType, CommitItem } from "./data"

interface TaskDetailProps {
  role: Role;
  task: TaskItem;
  onBack: () => void;
  onAddCommit: (taskId: string, type: CommitType, desc: string, fileName?: string, targetCommitId?: string) => void;
}

export function TaskDetail({ role, task, onBack, onAddCommit }: TaskDetailProps) {
  const [reportText, setReportText] = useState("");
  const [reportFile, setReportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rejectText, setRejectText] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [showAssigneesList, setShowAssigneesList] = useState(false);
  const [evaluatingCommitId, setEvaluatingCommitId] = useState<string | null>(null);

  const getStatusBadge = (status: TaskItem['status']) => {
    switch (status) {
      case "pending": return <span className="bg-amber-500/20 text-amber-500 px-3 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1.5 w-max"><Clock className="w-4 h-4" /> Đang chờ</span>;
      case "done": return <span className="bg-green-500/20 text-green-500 px-3 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1.5 w-max"><CheckCircle2 className="w-4 h-4" /> Hoàn thành</span>;
      case "rejected": return <span className="bg-red-500/20 text-red-500 px-3 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1.5 w-max"><XCircle className="w-4 h-4" /> Cần làm lại</span>;
    }
  }

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim() && !reportFile) return;
    onAddCommit(task.id, "commit", reportText, reportFile?.name);
    setReportText("");
    setReportFile(null);
  }

  const handleManagerApprove = (targetId: string) => {
    onAddCommit(task.id, "approve", "Duyệt nội dung.", undefined, targetId);
    setEvaluatingCommitId(null);
  }

  const handleManagerReject = (targetId: string) => {
    if (!rejectText.trim()) return;
    onAddCommit(task.id, "reject", rejectText, undefined, targetId);
    setRejectText("");
    setIsRejecting(false);
    setEvaluatingCommitId(null);
  }

  // A helper to determine icon based on commit type
  const renderCommitIcon = (type: CommitType) => {
    switch (type) {
      case "create": return <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/30"><Clock className="w-4 h-4" /></div>;
      case "commit": return <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/30"><FileText className="w-4 h-4" /></div>;
      case "approve": return <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0 border border-green-500/30"><CheckCircle2 className="w-4 h-4" /></div>;
      case "reject": return <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 border border-red-500/30"><XCircle className="w-4 h-4" /></div>;
    }
  }

  const canEmployeeSubmit = role === 'employee' && task.status !== 'done';
  const primaryCommits = task.commits.filter(c => !c.targetCommitId);

  return (
    <div className="flex-1 flex flex-col bg-[#131416] h-full overflow-hidden text-[#e1e1e1]">

      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-[#2b2d31] bg-[#1e1f22] shrink-0">
        <button onClick={onBack} className="p-1.5 mr-2 text-[#a1a1a1] hover:text-white hover:bg-[#2b2d31] rounded-md transition-colors"><ChevronLeft className="w-5 h-5" /></button>
        <h2 className="text-[16px] font-semibold text-white">Chi tiết công việc</h2>
      </div>

      <div className="flex-1 flex overflow-hidden">

        {/* Left Column: General Info */}
        <div className="w-1/3 min-w-[300px] border-r border-[#2b2d31] p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <h1 className="text-[20px] font-bold text-white leading-tight">{task.title}</h1>
          </div>

          <div>{getStatusBadge(task.status)}</div>

          <div className="flex flex-col gap-4 bg-[#1e1f22] p-4 rounded-lg border border-[#2b2d31]">
            <div className="flex items-center justify-between border-b border-[#2b2d31] pb-3">
              <span className="text-[#a1a1a1] text-[13px]">Giao cho</span>
              <div 
                onClick={() => setShowAssigneesList(true)}
                className="flex items-center gap-2 max-w-[200px] cursor-pointer hover:bg-[#2b2d31]/50 p-1.5 -mr-1.5 rounded-md transition-colors group"
                title="Xem danh sách"
              >
                <div className="flex -space-x-2 shrink-0">
                  {task.assignees.slice(0, 4).map((_, i) => (
                    <img key={i} src="/avatar.png" className="w-6 h-6 rounded-full border-2 border-[#1e1f22] relative" style={{ zIndex: 10 - i }} />
                  ))}
                  {task.assignees.length > 4 && (
                    <div className="w-6 h-6 rounded-full border-2 border-[#1e1f22] bg-[#2b2d31] text-[#e1e1e1] text-[10px] font-medium flex items-center justify-center relative" style={{ zIndex: 5 }}>
                      +{task.assignees.length - 4}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-[#2b2d31] pb-3">
              <span className="text-[#a1a1a1] text-[13px]">Người tạo</span>
              <div className="flex items-center gap-2">
                <img src="/avatars/me.png" className="w-6 h-6 rounded-full" />
                <span className="text-[14px] text-white">{task.creator}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#a1a1a1] text-[13px]">Deadline</span>
              <span className="text-[14px] text-[#ebaa16] font-medium px-2 py-1 bg-[#ebaa16]/10 rounded">{task.deadline}</span>
            </div>
          </div>

          <div>
            <h3 className="text-[13px] font-semibold text-[#a1a1a1] uppercase tracking-wider mb-2">Mô tả yêu cầu</h3>
            <div className="text-[14px] text-[#e1e1e1] leading-relaxed whitespace-pre-wrap bg-[#1e1f22] p-4 rounded-lg border border-[#2b2d31]">
              {task.description}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Actions */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden bg-[#0a0a0c]">
          <h3 className="text-[16px] font-semibold text-white mb-6 shrink-0 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0052cc]" /> Lịch sử hoạt động
          </h3>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 relative">
            {/* Timeline Line */}
            <div className="absolute top-4 bottom-4 left-4 w-0.5 bg-[#2b2d31]"></div>

            <div className="flex flex-col gap-6 relative pb-6">
              {primaryCommits.map((primaryCommit) => {
                const evaluations = task.commits.filter(c => c.targetCommitId === primaryCommit.id);
                const hasEvaluated = evaluations.some(e => e.type === 'approve' || e.type === 'reject');
                const isEvaluating = evaluatingCommitId === primaryCommit.id;

                return (
                  <div key={primaryCommit.id} className="flex gap-4 group">
                    <div className="z-10">{renderCommitIcon(primaryCommit.type)}</div>
                    <div className="flex-1 bg-[#1e1f22] border border-[#2b2d31] p-4 rounded-lg shadow-sm group-hover:border-[#0052cc]/30 transition-colors flex flex-col gap-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white text-[14px]">{primaryCommit.user}</span>
                        <span className="text-[12px] text-[#a1a1a1]">{primaryCommit.time}</span>
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
                             <div key={evalCommit.id} className={`ml-8 p-3 rounded-md border ${evalCommit.type === 'reject' ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'} animate-in fade-in slide-in-from-top-2 duration-300`}>
                               <div className="flex items-center gap-2 mb-1.5">
                                 {evalCommit.type === 'reject' ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                 <span className="font-semibold text-[13px] text-white">{evalCommit.user} <span className="opacity-60 text-xs ml-1">(Quản lý)</span></span>
                                 <span className="text-[12px] text-[#a1a1a1] ml-auto">{evalCommit.time}</span>
                               </div>
                               <p className={`text-[13px] leading-relaxed ${evalCommit.type === 'reject' ? 'text-red-100' : 'text-green-100'}`}>{evalCommit.description}</p>
                             </div>
                          ))}
                        </div>
                      )}

                      {/* Manager Action Form: Trượt xuống bên trong hộp nộp bài */}
                      {role === 'manager' && primaryCommit.type === 'commit' && !hasEvaluated && task.status !== 'done' && (
                        <div className="mt-3 pt-3 border-t border-[#2b2d31]">
                          {isEvaluating ? (
                            <div className="bg-[#131416] border border-blue-500/30 p-4 rounded-md flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
                               <p className="text-[13px] text-[#e1e1e1] font-medium">Nhận xét bản thảo của {primaryCommit.user}:</p>
                               {!isRejecting ? (
                                 <div className="flex gap-3 mt-1">
                                   <button onClick={() => setIsRejecting(true)} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded-md text-[13px] font-semibold transition-colors">Yêu cầu làm lại</button>
                                   <button onClick={() => handleManagerApprove(primaryCommit.id)} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-[13px] font-semibold transition-colors flex-1 shadow-sm">Duyệt Đạt</button>
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
                                     <button onClick={() => handleManagerReject(primaryCommit.id)} disabled={!rejectText.trim()} className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-md text-[13px] font-semibold transition-colors flex items-center gap-2"><Send className="w-3.5 h-3.5" /> Gửi phản hồi</button>
                                   </div>
                                 </div>
                               )}
                            </div>
                          ) : (
                            <button 
                              onClick={() => setEvaluatingCommitId(primaryCommit.id)}
                              className="text-[13px] text-[#0052cc] hover:text-white hover:bg-[#0052cc] px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 font-medium border border-[#0052cc]/50 hover:border-transparent w-max"
                            >
                              <MessageSquareReply className="w-4 h-4" /> Đánh giá bản thảo này
                            </button>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                )
              })}
            </div>
            
          </div>

          {/* Employee Action (Submit File/Report) stays at the bottom to submit new files */}
          {canEmployeeSubmit && (
            <div className="mt-4 shrink-0 bg-[#1e1f22] border border-[#2b2d31] rounded-lg p-4">
              {reportFile && (
                <div className="flex items-center justify-between bg-[#131416] border border-[#2b2d31] px-3 py-2 rounded-md mb-3">
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-4 h-4 text-[#0052cc]" />
                    <span className="text-[13px] text-[#e1e1e1] truncate">{reportFile.name}</span>
                  </div>
                  <button onClick={() => setReportFile(null)} className="p-1 hover:bg-[#2b2d31] rounded text-[#a1a1a1] hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
              )}
              <form onSubmit={handleEmployeeSubmit} className="flex flex-col gap-3">
                <textarea
                  value={reportText}
                  onChange={e => setReportText(e.target.value)}
                  placeholder="Nhập ghi chú và tải file báo cáo..."
                  className="w-full bg-transparent text-[14px] text-white outline-none resize-none placeholder:text-[#a1a1a1] custom-scrollbar"
                  rows={2}
                />
                <div className="flex items-center justify-between border-t border-[#2b2d31] pt-3">
                  <input type="file" ref={fileInputRef} onChange={(e) => setReportFile(e.target.files?.[0] || null)} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-[13px] text-[#a1a1a1] hover:text-white px-2 py-1 rounded hover:bg-[#2b2d31] transition-colors"><Paperclip className="w-4 h-4" /> Đính kèm file</button>
                  <button type="submit" disabled={!reportText.trim() && !reportFile} className="flex items-center gap-2 text-[13px] font-medium bg-[#0052cc] hover:bg-[#0052cc]/90 text-white px-4 py-2 rounded shadow-sm disabled:opacity-50 transition-colors"><Send className="w-4 h-4" /> Nộp bản thảo</button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

      {showAssigneesList && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowAssigneesList(false)}>
           <div className="w-[350px] bg-[#1e1f22] border border-[#2b2d31] rounded-xl shadow-2xl flex flex-col p-5 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2b2d31]">
                 <h3 className="text-white font-semibold text-[15px]">Được giao cho ({task.assignees.length})</h3>
                 <button onClick={() => setShowAssigneesList(false)} className="text-[#a1a1a1] hover:text-white p-1 hover:bg-[#2b2d31] rounded transition-colors"><X className="w-4 h-4"/></button>
              </div>
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                 {task.assignees.map(name => (
                    <div key={name} className="flex items-center gap-3 p-2 bg-[#131416] hover:bg-[#202124] transition-colors rounded-md border border-[#2b2d31]">
                       <img src="/avatar.png" className="w-8 h-8 rounded-full border border-[#2b2d31]" />
                       <span className="text-[14px] text-[#e1e1e1] font-medium">{name}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

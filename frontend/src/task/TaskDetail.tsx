import React, { useState, useRef, useEffect } from "react"
import { ChevronLeft, Paperclip, Clock, X, Send, Edit2, BarChart2 } from "lucide-react"
import type { TaskItem } from "@/store/useTaskStore"
import { useTaskStore } from "@/store/useTaskStore"
import { useAuthStore } from "@/store/useAuthStore"
import toast from "react-hot-toast"
import { TaskProgressPanel } from "./TaskProgressPanel"
import { TaskTimeline } from "./TaskTimeline"
import { AssigneeListModal } from "./AssigneeListModal"

interface TaskDetailProps {
  role: "manager" | "employee";
  task: TaskItem;
  onBack: () => void;
}

export function TaskDetail({ role, task, onBack }: TaskDetailProps) {
  const { addCommit, editTask } = useTaskStore();
  const { authUser } = useAuthStore();
  const [reportText, setReportText] = useState("");
  const [reportFile, setReportFile] = useState<File | null>(null);
  
  const formatLocalDateForInput = (dateInput: string) => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editDesc, setEditDesc] = useState(task.description);
  const [editDeadline, setEditDeadline] = useState(() => formatLocalDateForInput(task.deadline));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if task prop changes or updates
  useEffect(() => {
    setEditDesc(task.description);
    setEditDeadline(formatLocalDateForInput(task.deadline));
    setIsEditing(false);
  }, [task]);

  const [showAssigneesList, setShowAssigneesList] = useState(false);
  const [showProgressPanel, setShowProgressPanel] = useState(false);

  const getStatusBadge = (status: TaskItem['status']) => {
    switch (status) {
      case "done":
        return <span className="bg-green-500/20 text-green-500 px-3 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1.5 w-max"><Clock className="w-4 h-4" /> Hoàn thành</span>;
      case "pending":
      default:
        return <span className="bg-amber-500/20 text-amber-500 px-3 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1.5 w-max"><Clock className="w-4 h-4" /> Đang chờ</span>;
    }
  }

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim() && !reportFile) return;
    await addCommit(task._id, { type: "commit", description: reportText, fileName: reportFile?.name });
    setReportText("");
    setReportFile(null);
  }

  const isCreatorOrAdmin = !!(authUser?._id === task.creator?._id || authUser?.permissions?.approveTasks);

  const handleEditSubmit = async () => {
    if (!editDesc || !editDeadline) return;
    const taskDeadline = new Date(editDeadline);
    const now = new Date();
    const maxDeadline = new Date();
    maxDeadline.setFullYear(maxDeadline.getFullYear() + 100);
    if (taskDeadline <= now) {
      toast.error("Deadline phải là thời điểm trong tương lai");
      return;
    }
    if (taskDeadline > maxDeadline) {
      toast.error("Deadline không được vượt quá 100 năm kể từ hôm nay");
      return;
    }
    await editTask(task._id, { description: editDesc, deadline: editDeadline });
    setIsEditing(false);
  }

  const isAssignee = task.assignees.some(a => a.user?._id === authUser?._id);
  const isOverdue = new Date() > new Date(task.deadline);

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

          <div className="flex items-center gap-3 flex-wrap">
            {getStatusBadge(task.status)}
            <button
              onClick={() => setShowProgressPanel(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-semibold border transition-all duration-200 ${
                showProgressPanel
                  ? 'bg-[#0052cc] border-[#0052cc] text-white shadow-sm shadow-[#0052cc]/30'
                  : 'bg-[#1e1f22] border-[#2b2d31] text-[#a1a1a1] hover:text-white hover:border-[#0052cc]/50'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Tiến độ công việc
            </button>
          </div>

          <div className="flex flex-col gap-4 bg-[#1e1f22] p-4 rounded-lg border border-[#2b2d31]">
            <div className="flex items-center justify-between border-b border-[#2b2d31] pb-3">
              <span className="text-[#a1a1a1] text-[13px]">Giao cho</span>
              <div 
                onClick={() => setShowAssigneesList(true)}
                className="flex items-center gap-2 max-w-[200px] cursor-pointer hover:bg-[#2b2d31]/50 p-1.5 -mr-1.5 rounded-md transition-colors group"
                title="Xem danh sách"
              >
                <div className="flex -space-x-2 shrink-0">
                  {task.assignees.slice(0, 4).map((assignee, i) => (
                    <img key={i} src={assignee.user?.profilePicture || "/avatar.png"} className="w-6 h-6 rounded-full border-2 border-[#1e1f22] object-cover relative" style={{ zIndex: 10 - i }} />
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
                <img src={task.creator?.profilePicture || "/avatar.png"} className="w-6 h-6 rounded-full object-cover" />
                <span className="text-[14px] text-white">{task.creator?.fullname || "Unknown"}</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-[#2b2d31] pb-3">
              <span className="text-[#a1a1a1] text-[13px]">Ngày tạo</span>
              <span className="text-[14px] text-white font-medium">
                {new Date(task.createdAt).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#a1a1a1] text-[13px]">Deadline</span>
              <span className={`text-[14px] font-medium px-2 py-1 rounded flex items-center gap-1.5 ${
                isOverdue && task.status !== 'done'
                  ? 'text-red-400 bg-red-500/10 border border-red-500/20'
                  : 'text-[#ebaa16] bg-[#ebaa16]/10'
              }`}>
                {isOverdue && task.status !== 'done' && <Clock className="w-3.5 h-3.5" />}
                {new Date(task.deadline).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}
                {isOverdue && task.status !== 'done' && <span className="text-[11px] font-bold">· QUÁ HẠN</span>}
              </span>
            </div>
          </div>

          {/* PROGRESS PANEL */}
          {showProgressPanel && (
            <TaskProgressPanel task={task} />
          )}

          {/* MÔ TẢ YÊU CẦU */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#a1a1a1] tracking-wider uppercase">Mô tả yêu cầu</span>
              {authUser?._id === task.creator?._id && !isEditing && (
                <button onClick={() => setIsEditing(true)} className="text-[12px] text-[#0052cc] hover:underline flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> Chỉnh sửa
                </button>
              )}
            </div>
            
            {isEditing ? (
              <div className="bg-[#1e1f22] p-4 rounded-lg border border-[#2b2d31] flex flex-col gap-3">
                <textarea 
                  value={editDesc} 
                  onChange={e => setEditDesc(e.target.value)} 
                  className="w-full bg-[#131416] border border-[#2b2d31] rounded-md px-3 py-2 text-[14px] text-white outline-none focus:border-[#0052cc] resize-none"
                  rows={4}
                />
                <div className="flex items-center gap-2">
                  <label className="text-[13px] text-[#e1e1e1] whitespace-nowrap">Deadline mới:</label>
                  <input 
                    type="datetime-local" 
                    value={editDeadline}
                    onChange={e => setEditDeadline(e.target.value)}
                    className="flex-1 bg-[#131416] border border-[#2b2d31] rounded-md px-3 py-2 text-[14px] text-white outline-none focus:border-[#0052cc]"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-[13px] text-[#a1a1a1] hover:text-white transition-colors">Hủy</button>
                  <button onClick={handleEditSubmit} className="px-4 py-1.5 bg-[#0052cc] hover:bg-[#0052cc]/90 text-white text-[13px] font-medium rounded transition-colors">Lưu thay đổi</button>
                </div>
              </div>
            ) : (
              <div className="bg-[#1e1f22] p-4 rounded-lg border border-[#2b2d31] text-[14px] text-[#e1e1e1] leading-relaxed whitespace-pre-wrap">
                {task.description}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Timeline & Actions */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden bg-[#0a0a0c]">
          <TaskTimeline task={task} role={role} authUser={authUser} />

          {/* Employee Action (Submit File/Report) stays at the bottom to submit new files */}
          {isAssignee && task.status !== 'done' && (
            isOverdue ? (
              <div className="mt-4 shrink-0 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-[14px] font-semibold text-red-400">Task đã quá hạn</p>
                  <p className="text-[12px] text-red-300/70 mt-0.5">Thời gian nộp bài đã kết thúc. Vui lòng liên hệ quản lý để được gia hạn.</p>
                </div>
              </div>
            ) : (
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
            )
          )}

        </div>
      </div>

      {showAssigneesList && (
        <AssigneeListModal 
          task={task} 
          isCreatorOrAdmin={isCreatorOrAdmin} 
          onClose={() => setShowAssigneesList(false)} 
        />
      )}
    </div>
  )
}

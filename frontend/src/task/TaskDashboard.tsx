import { useState } from "react"
import { Search, Filter, Calendar, Plus, Clock, CheckCircle2, XCircle, PieChart as PieChartIcon, ChevronDown } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import type { TaskItem } from "@/store/useTaskStore"
import { useAuthStore } from "@/store/useAuthStore"
import { TaskStatisticsModal } from "./TaskStatisticsModal"

interface TaskDashboardProps {
  role: "manager" | "employee";
  tasks: TaskItem[];
  onOpenCreate: () => void;
  onOpenDetail: (task: TaskItem) => void;
}

export function TaskDashboard({ role, tasks, onOpenCreate, onOpenDetail }: TaskDashboardProps) {
  const { authUser } = useAuthStore();
  const [filterStr, setFilterStr] = useState("");
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeSort, setTimeSort] = useState("newest");

  const displayedTasks = tasks.filter(t => {
    // Role filter
    if (role === "employee" && !t.assignees.some(a => a.user._id === authUser?._id)) return false;
    // Search string filter
    if (filterStr && !t.title.toLowerCase().includes(filterStr.toLowerCase())) return false;
    
    // Status filter
    if (statusFilter !== "all") {
      const isOverdue = (t.status === "pending" || t.status === "rejected") && new Date() > new Date(t.deadline);
      if (statusFilter === "overdue" && !isOverdue) return false;
      if (statusFilter === "pending" && (t.status !== "pending" || isOverdue)) return false;
      if (statusFilter === "done" && t.status !== "done") return false;
      if (statusFilter === "rejected" && (t.status !== "rejected" || isOverdue)) return false;
    }
    
    return true;
  }).sort((a, b) => {
    if (timeSort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (timeSort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (timeSort === "deadline_asc") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    if (timeSort === "deadline_desc") return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
    return 0;
  });

  const stats = {
    pending: displayedTasks.filter(t => t.status === "pending" && new Date() <= new Date(t.deadline)).length,
    overdue: displayedTasks.filter(t => (t.status === "pending" || t.status === "rejected") && new Date() > new Date(t.deadline)).length,
    done: displayedTasks.filter(t => t.status === "done").length,
    rejected: displayedTasks.filter(t => (t.status as string) === "rejected" && new Date() <= new Date(t.deadline)).length,
  };

  const chartData = [
    { name: 'Đang chờ', value: stats.pending, color: '#f59e0b' },
    { name: 'Quá hạn', value: stats.overdue, color: '#f43f5e' },
    { name: 'Hoàn thành', value: stats.done, color: '#10b981' },
    { name: 'Cần làm lại', value: stats.rejected, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const getStatusBadge = (task: TaskItem) => {
    if ((task.status === "pending" || task.status === "rejected") && new Date() > new Date(task.deadline)) {
      return <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded-[4px] text-[12px] font-semibold flex items-center gap-1 w-max"><Clock className="w-3 h-3" /> Quá hạn</span>;
    }
    switch (task.status) {
      case "pending": return <span className="bg-amber-500/20 text-amber-500 px-2 py-1 rounded-[4px] text-[12px] font-semibold flex items-center gap-1 w-max"><Clock className="w-3 h-3" /> Đang chờ</span>;
      case "done": return <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded-[4px] text-[12px] font-semibold flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3" /> Hoàn thành</span>;
      case "rejected": return <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded-[4px] text-[12px] font-semibold flex items-center gap-1 w-max"><XCircle className="w-3 h-3" /> Cần làm lại</span>;
    }
  }

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      {/* Filters Row */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-chat-muted" />
            <input
              value={filterStr}
              onChange={(e) => setFilterStr(e.target.value)}
              placeholder="Tìm kiếm công việc..."
              className="w-full bg-chat-sidebar border border-chat-border rounded-md py-2 pl-[34px] pr-3 text-[14px] text-chat-text outline-none focus:border-[#0052cc] transition-colors placeholder:text-chat-muted"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none flex items-center gap-2 px-3 py-2 pl-9 pr-9 rounded-md bg-chat-sidebar border border-chat-border text-[14px] text-chat-text/90 hover:bg-chat-hover transition-colors outline-none cursor-pointer focus:border-[#0052cc]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Đang chờ</option>
              <option value="done">Hoàn thành</option>
              <option value="overdue">Quá hạn</option>
              <option value="rejected">Cần làm lại</option>
            </select>
            <Filter className="w-4 h-4 text-chat-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-4 h-4 text-chat-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={timeSort}
              onChange={(e) => setTimeSort(e.target.value)}
              className="appearance-none flex items-center gap-2 px-3 py-2 pl-9 pr-9 rounded-md bg-chat-sidebar border border-chat-border text-[14px] text-chat-text/90 hover:bg-chat-hover transition-colors outline-none cursor-pointer focus:border-[#0052cc]"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="deadline_asc">Gần hạn nhất</option>
              <option value="deadline_desc">Hạn xa nhất</option>
            </select>
            <Calendar className="w-4 h-4 text-chat-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-4 h-4 text-chat-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStatsModal(true)}
            className="flex items-center gap-2 bg-chat-sidebar hover:bg-chat-hover text-[#0052cc] border border-[#0052cc]/30 px-4 py-2 rounded-md text-[14px] font-medium transition-colors"
          >
            <PieChartIcon className="w-4 h-4" /> Thống kê
          </button>
          
          {(authUser?.permissions?.editTasks || authUser?.permissions?.viewAdmin) && (
            <button
              onClick={onOpenCreate}
              className="flex items-center gap-2 bg-[#0052cc] hover:bg-[#0052cc]/90 text-white px-4 py-2 rounded-md text-[14px] font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Tạo Task mới
            </button>
          )}
        </div>
      </div>

      {/* Stats Chart Section */}
      {displayedTasks.length > 0 && (
        <div className="flex gap-6 mb-6 h-[160px] shrink-0">
          <div className="bg-chat-sidebar border border-chat-border rounded-xl p-4 flex-1 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h3 className="text-[16px] font-semibold text-chat-text flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-[#0052cc]" /> Thống kê công việc
              </h3>
              <p className="text-[14px] text-chat-muted">Tổng số công việc: <span className="font-bold text-chat-text">{displayedTasks.length}</span></p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div><span className="text-[13px] text-chat-text/90">{stats.done} Hoàn thành</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-[13px] text-chat-text/90">{stats.pending} Đang chờ</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#f43f5e]"></div><span className="text-[13px] text-chat-text/90">{stats.overdue} Quá hạn</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-[13px] text-chat-text/90">{stats.rejected} Cần làm lại</span></div>
              </div>
            </div>

            <div className="w-[120px] h-[120px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: 'var(--chat-bg-sidebar)', border: '1px solid var(--chat-border)', borderRadius: '8px', color: 'var(--chat-text-main)' }}
                      itemStyle={{ color: 'var(--chat-text-main)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center rounded-full border-4 border-chat-border text-[12px] text-chat-muted">
                  N/A
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-10">
          {displayedTasks.map(task => (
            <div
              key={task._id}
              onClick={() => onOpenDetail(task)}
              className="group bg-chat-sidebar border border-chat-border hover:border-[#0052cc]/50 hover:bg-chat-hover rounded-lg p-5 cursor-pointer transition-all flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-[16px] font-semibold text-chat-text group-hover:text-[#0052cc] transition-colors pr-2 line-clamp-2 leading-tight">
                  {task.title}
                </h3>
                {getStatusBadge(task)}
              </div>

              <div className="text-[14px] text-chat-muted line-clamp-2 mb-4 flex-1">
                {task.description}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-chat-border">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {task.assignees.slice(0, 4).map((a, i) => (
                      <img key={i} src={a.user?.profilePicture || "/avatar.png"} className="w-[28px] h-[28px] rounded-full border-2 border-chat-sidebar relative object-cover" style={{ zIndex: 10 - i }} title={a.user?.fullname || "Unknown"} />
                    ))}
                    {task.assignees.length > 4 && (
                      <div className="w-[28px] h-[28px] rounded-full border-2 border-chat-sidebar bg-chat-hover text-chat-text/90 text-[11px] font-medium flex items-center justify-center relative" style={{ zIndex: 5 }}>
                        +{task.assignees.length - 4}
                      </div>
                    )}
                    <img src={task.creator?.profilePicture || "/avatar.png"} className="w-[28px] h-[28px] rounded-full border-2 border-[#0052cc] relative ml-2 object-cover" style={{ zIndex: 0 }} title={`Tạo bởi: ${task.creator?.fullname || "Unknown"}`} />
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-right shrink-0">
                  <div className="flex items-center justify-end text-[12px] text-chat-muted">
                    Tạo: {new Date(task.createdAt).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}
                  </div>
                  <div className={`flex items-center text-[12px] font-medium px-2 py-1 rounded ${
                    (task.status === "pending" || task.status === "rejected") && new Date() > new Date(task.deadline)
                      ? "text-red-500 bg-red-500/10"
                      : "text-[#ebaa16] bg-[#ebaa16]/10"
                  }`}>
                    Hạn: {new Date(task.deadline).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {displayedTasks.length === 0 && (
            <div className="col-span-full py-10 flex flex-col items-center justify-center text-chat-muted">
              <CheckCircle2 className="w-10 h-10 mb-2 opacity-20" />
              <p>Không tìm thấy công việc nào.</p>
            </div>
          )}
        </div>
      </div>

      {showStatsModal && (
        <TaskStatisticsModal
          tasks={tasks}
          role={role}
          onClose={() => setShowStatsModal(false)}
        />
      )}
    </div>
  )
}

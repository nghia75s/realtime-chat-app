import { useState } from "react"
import { Search, Filter, Calendar, Plus, Clock, CheckCircle2, XCircle, PieChart as PieChartIcon } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import type { TaskItem } from "@/store/useTaskStore"
import { useAuthStore } from "@/store/useAuthStore"

interface TaskDashboardProps {
  role: "manager" | "employee";
  tasks: TaskItem[];
  onOpenCreate: () => void;
  onOpenDetail: (task: TaskItem) => void;
}

export function TaskDashboard({ role, tasks, onOpenCreate, onOpenDetail }: TaskDashboardProps) {
  const { authUser } = useAuthStore();
  const [filterStr, setFilterStr] = useState("");

  const displayedTasks = tasks.filter(t => {
    // Role filter
    if (role === "employee" && !t.assignees.some(a => a.user._id === authUser?._id)) return false;
    // Search string filter
    if (filterStr && !t.title.toLowerCase().includes(filterStr.toLowerCase())) return false;
    return true;
  });

  const stats = {
    pending: displayedTasks.filter(t => t.status === "pending").length,
    done: displayedTasks.filter(t => t.status === "done").length,
    rejected: displayedTasks.filter(t => t.status === "rejected").length,
  };

  const chartData = [
    { name: 'Đang chờ', value: stats.pending, color: '#f59e0b' },
    { name: 'Hoàn thành', value: stats.done, color: '#10b981' },
    { name: 'Cần làm lại', value: stats.rejected, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const getStatusBadge = (status: TaskItem['status']) => {
    switch (status) {
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1a1]" />
            <input
              value={filterStr}
              onChange={(e) => setFilterStr(e.target.value)}
              placeholder="Tìm kiếm công việc..."
              className="w-full bg-[#1e1f22] border border-[#2b2d31] rounded-md py-2 pl-[34px] pr-3 text-[14px] text-white outline-none focus:border-[#0052cc] transition-colors placeholder:text-[#a1a1a1]"
            />
          </div>

          <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#1e1f22] border border-[#2b2d31] text-[14px] text-[#e1e1e1] hover:bg-[#2b2d31] transition-colors">
            <Filter className="w-4 h-4 text-[#a1a1a1]" /> Trạng thái
          </button>

          <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#1e1f22] border border-[#2b2d31] text-[14px] text-[#e1e1e1] hover:bg-[#2b2d31] transition-colors">
            <Calendar className="w-4 h-4 text-[#a1a1a1]" /> Thời gian
          </button>
        </div>

        {(authUser?.permissions?.editTasks || authUser?.permissions?.viewAdmin) && (
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-2 bg-[#0052cc] hover:bg-[#0052cc]/90 text-white px-4 py-2 rounded-md text-[14px] font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Tạo Task mới
          </button>
        )}
      </div>

      {/* Stats Chart Section */}
      {displayedTasks.length > 0 && (
        <div className="flex gap-6 mb-6 h-[160px] shrink-0">
          <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-4 flex-1 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h3 className="text-[16px] font-semibold text-white flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-[#0052cc]" /> Thống kê công việc
              </h3>
              <p className="text-[14px] text-[#a1a1a1]">Tổng số công việc: <span className="font-bold text-white">{displayedTasks.length}</span></p>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-[13px] text-[#e1e1e1]">{stats.pending} Đang chờ</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-[13px] text-[#e1e1e1]">{stats.done} Hoàn thành</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-[13px] text-[#e1e1e1]">{stats.rejected} Cần làm lại</span></div>
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
                      contentStyle={{ backgroundColor: '#1e1f22', border: '1px solid #2b2d31', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center rounded-full border-4 border-[#2b2d31] text-[12px] text-[#a1a1a1]">
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
              className="group bg-[#1e1f22] border border-[#2b2d31] hover:border-[#0052cc]/50 hover:bg-[#202124] rounded-lg p-5 cursor-pointer transition-all flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-[16px] font-semibold text-white group-hover:text-[#0052cc] transition-colors pr-2 line-clamp-2 leading-tight">
                  {task.title}
                </h3>
                {getStatusBadge(task.status)}
              </div>

              <div className="text-[14px] text-[#a1a1a1] line-clamp-2 mb-4 flex-1">
                {task.description}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#2b2d31]">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {task.assignees.slice(0, 4).map((a, i) => (
                      <img key={i} src={a.user?.profilePicture || "/avatar.png"} className="w-[28px] h-[28px] rounded-full border-2 border-[#1e1f22] relative object-cover" style={{ zIndex: 10 - i }} title={a.user?.fullname || "Unknown"} />
                    ))}
                    {task.assignees.length > 4 && (
                      <div className="w-[28px] h-[28px] rounded-full border-2 border-[#1e1f22] bg-[#2b2d31] text-[#e1e1e1] text-[11px] font-medium flex items-center justify-center relative" style={{ zIndex: 5 }}>
                        +{task.assignees.length - 4}
                      </div>
                    )}
                    <img src={task.creator?.profilePicture || "/avatar.png"} className="w-[28px] h-[28px] rounded-full border-2 border-[#0052cc] relative ml-2 object-cover" style={{ zIndex: 0 }} title={`Tạo bởi: ${task.creator?.fullname || "Unknown"}`} />
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-right shrink-0">
                  <div className="flex items-center justify-end text-[12px] text-[#a1a1a1]">
                    Tạo: {new Date(task.createdAt).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}
                  </div>
                  <div className="flex items-center text-[12px] text-[#ebaa16] font-medium bg-[#ebaa16]/10 px-2 py-1 rounded">
                    Hạn: {new Date(task.deadline).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {displayedTasks.length === 0 && (
            <div className="col-span-full py-10 flex flex-col items-center justify-center text-[#a1a1a1]">
              <CheckCircle2 className="w-10 h-10 mb-2 opacity-20" />
              <p>Không tìm thấy công việc nào.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

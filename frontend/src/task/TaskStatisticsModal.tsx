import { useState } from "react"
import { X, PieChartIcon, User, TrendingUp, CheckCircle2, Clock, XCircle, Calendar, FileText, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import type { TaskItem } from "@/store/useTaskStore"

interface TaskStatisticsModalProps {
  tasks: TaskItem[];
  role: "manager" | "employee";
  onClose: () => void;
}

export function TaskStatisticsModal({ tasks, role, onClose }: TaskStatisticsModalProps) {
  const [empPage, setEmpPage] = useState(1);
  const [taskPage, setTaskPage] = useState(1);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const ITEMS_PER_PAGE = 5;

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  // Overall Stats
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === "pending" && new Date() <= new Date(t.deadline)).length;
  const overdueTasks = tasks.filter(t => t.status !== "done" && new Date() > new Date(t.deadline)).length;
  const doneTasks = tasks.filter(t => t.status === "done").length;
  const rejectedTasks = tasks.filter(t => (t.status as string) === "rejected" && new Date() <= new Date(t.deadline)).length;

  const overviewChartData = [
    { name: 'Đang chờ', value: pendingTasks, color: '#f59e0b' },
    { name: 'Quá hạn', value: overdueTasks, color: '#f43f5e' },
    { name: 'Hoàn thành', value: doneTasks, color: '#10b981' },
    { name: 'Cần làm lại', value: rejectedTasks, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Performance Stats (Manager Only)
  const employeeStats: Record<string, { fullname: string; profilePicture: string; total: number; done: number; pending: number; rejected: number }> = {};

  if (role === "manager") {
    tasks.forEach(task => {
      task.assignees.forEach(assignee => {
        if (!assignee || !assignee.user) return;
        const uid = assignee.user._id;
        if (!employeeStats[uid]) {
          employeeStats[uid] = {
            fullname: assignee.user.fullname,
            profilePicture: assignee.user.profilePicture,
            total: 0,
            done: 0,
            pending: 0,
            rejected: 0,
          };
        }
        employeeStats[uid].total += 1;
        if (assignee.status === "done") employeeStats[uid].done += 1;
        else if (assignee.status === "rejected") employeeStats[uid].rejected += 1;
        else employeeStats[uid].pending += 1;
      });
    });
  }

  const performanceData = Object.values(employeeStats).sort((a, b) => b.total - a.total);

  const getPercentage = (val: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((val / total) * 100);
  }

  const totalEmpPages = Math.ceil(performanceData.length / ITEMS_PER_PAGE);
  const displayedEmps = performanceData.slice((empPage - 1) * ITEMS_PER_PAGE, empPage * ITEMS_PER_PAGE);

  const totalTaskPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);
  const displayedTasks = tasks.slice((taskPage - 1) * ITEMS_PER_PAGE, taskPage * ITEMS_PER_PAGE);

  const renderPagination = (currentPage: number, totalPages: number, setPage: (p: number) => void) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-5 py-3 border-t border-chat-border bg-chat-sidebar">
        <span className="text-[12px] text-chat-muted">Trang {currentPage} / {totalPages}</span>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            className="p-1.5 rounded-md hover:bg-chat-hover border border-chat-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-chat-text"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setPage(currentPage + 1)}
            className="p-1.5 rounded-md hover:bg-chat-hover border border-chat-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-chat-text"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[1100px] max-w-[95vw] h-[90vh] bg-chat-sidebar rounded-xl border border-chat-border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-chat-border shrink-0 bg-chat-sidebar relative z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0052cc]/10 flex items-center justify-center text-[#0052cc]">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-chat-text">Thống kê công việc</h2>
              <p className="text-[13px] text-chat-muted">Tổng quan dữ liệu và hiệu suất hệ thống</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-chat-muted hover:text-chat-text p-2 rounded-full hover:bg-chat-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-chat-main space-y-6">

          {/* Section 1: Overall Stats */}
          <div className="flex gap-6">
            <div className="w-1/3 bg-chat-sidebar border border-chat-border rounded-xl p-5 shadow-sm flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0052cc]/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-xl pointer-events-none" />
              <h3 className="text-[15px] font-medium text-chat-text/90 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#0052cc]" /> Tổng số công việc
              </h3>
              <div className="text-[36px] font-bold text-chat-text mb-1">{totalTasks}</div>
              <p className="text-[13px] text-chat-muted">Các công việc bạn được quyền xem</p>
            </div>

            <div className="flex-1 bg-chat-sidebar border border-chat-border rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[13px] text-chat-muted">Đang chờ</div>
                    <div className="text-[18px] font-semibold text-chat-text">{pendingTasks}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[13px] text-chat-muted">Quá hạn</div>
                    <div className="text-[18px] font-semibold text-chat-text">{overdueTasks}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[13px] text-chat-muted">Hoàn thành</div>
                    <div className="text-[18px] font-semibold text-chat-text">{doneTasks}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[13px] text-chat-muted">Cần làm lại</div>
                    <div className="text-[18px] font-semibold text-chat-text">{rejectedTasks}</div>
                  </div>
                </div>
              </div>

              <div className="w-[160px] h-[160px]">
                {overviewChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overviewChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {overviewChartData.map((entry, index) => (
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
                  <div className="w-full h-full flex items-center justify-center rounded-full border-4 border-chat-border border-dashed text-[13px] text-chat-muted">
                    Chưa có dữ liệu
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Employee Performance (Manager Only) */}
          {role === "manager" && (
            <div className="bg-chat-sidebar border border-chat-border rounded-xl shadow-sm flex flex-col overflow-hidden">
              <div className="px-5 py-4 border-b border-chat-border bg-chat-sidebar">
                <h3 className="text-[15px] font-medium text-chat-text/90 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#0052cc]" /> Hiệu suất nhân viên
                </h3>
              </div>

              {performanceData.length > 0 ? (
                <div className="flex flex-col">
                  {/* Chart for Performance */}
                  <div className="p-5 h-[280px] border-b border-chat-border">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData.slice(0, 8)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chat-border)" />
                        <XAxis dataKey="fullname" tick={{ fill: 'var(--chat-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--chat-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip
                          cursor={{ fill: 'var(--chat-hover)' }}
                          contentStyle={{ backgroundColor: 'var(--chat-bg-sidebar)', border: '1px solid var(--chat-border)', borderRadius: '8px', color: 'var(--chat-text-main)' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar dataKey="done" name="Hoàn thành" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="pending" name="Đang chờ" stackId="a" fill="#f59e0b" />
                        <Bar dataKey="rejected" name="Làm lại" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Detailed List */}
                  <div className="flex flex-col">
                    {displayedEmps.map((emp, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border-b border-chat-border last:border-0 hover:bg-chat-hover transition-colors">
                        <div className="flex items-center gap-3 w-[250px]">
                          <img src={emp.profilePicture || "/avatar.png"} className="w-9 h-9 rounded-full object-cover border border-chat-border" />
                          <div className="flex flex-col">
                            <span className="text-[14px] font-medium text-chat-text">{emp.fullname}</span>
                            <span className="text-[12px] text-chat-muted">{emp.total} công việc</span>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col gap-2 px-8">
                          <div className="flex justify-between text-[12px] text-chat-muted">
                            <span>Tỉ lệ hoàn thành: <span className="font-medium text-[#10b981]">{getPercentage(emp.done, emp.total)}%</span></span>
                            <span>{emp.done}/{emp.total} Task</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-chat-border overflow-hidden flex">
                            <div style={{ width: `${getPercentage(emp.done, emp.total)}%` }} className="h-full bg-[#10b981]"></div>
                            <div style={{ width: `${getPercentage(emp.pending, emp.total)}%` }} className="h-full bg-[#f59e0b]"></div>
                            <div style={{ width: `${getPercentage(emp.rejected, emp.total)}%` }} className="h-full bg-[#ef4444]"></div>
                          </div>
                        </div>

                        <div className="flex gap-4 w-[200px] justify-end">
                          <div className="flex flex-col items-center">
                            <span className="text-[16px] font-semibold text-[#10b981]">{emp.done}</span>
                            <span className="text-[11px] text-chat-muted">Đã xong</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[16px] font-semibold text-[#f59e0b]">{emp.pending}</span>
                            <span className="text-[11px] text-chat-muted">Đang chờ</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[16px] font-semibold text-[#ef4444]">{emp.rejected}</span>
                            <span className="text-[11px] text-chat-muted">Làm lại</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {renderPagination(empPage, totalEmpPages, setEmpPage)}
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center justify-center text-chat-muted">
                  <User className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-[14px]">Chưa có dữ liệu giao việc cho nhân viên</p>
                </div>
              )}
            </div>
          )}

          {/* Section 3: Detailed Task Performance (Manager Only) */}
          {role === "manager" && tasks.length > 0 && (
            <div className="bg-chat-sidebar border border-chat-border rounded-xl shadow-sm flex flex-col overflow-hidden">
              <div className="px-5 py-4 border-b border-chat-border bg-chat-sidebar flex items-center justify-between">
                <h3 className="text-[15px] font-medium text-chat-text/90 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0052cc]" /> Chi tiết hiệu suất từng công việc
                </h3>
              </div>

              <div className="flex flex-col">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-chat-hover text-[13px] text-chat-muted border-b border-chat-border">
                        <th className="px-5 py-3 font-medium whitespace-nowrap">Tên công việc</th>
                        <th className="px-5 py-3 font-medium whitespace-nowrap">Deadline</th>
                        <th className="px-5 py-3 font-medium whitespace-nowrap">Đánh giá thành viên</th>
                      </tr>
                    </thead>
                    <tbody className="text-[13px] text-chat-text">
                      {displayedTasks.map(task => (
                        <tr key={task._id} className="border-b border-chat-border hover:bg-chat-hover/50 transition-colors">
                          <td className="px-5 py-4 align-top w-[30%]">
                            <div className="font-medium text-chat-text line-clamp-2">{task.title}</div>
                            <div className="text-[12px] text-chat-muted mt-1 flex items-center gap-1">
                              Trạng thái chung:
                              {task.status === "done" ? <span className="text-green-500 font-medium">Hoàn thành</span> :
                                (task.status === "rejected" && new Date() <= new Date(task.deadline) ? <span className="text-red-500 font-medium">Cần làm lại</span> :
                                  (new Date() > new Date(task.deadline) ? <span className="text-red-500 font-medium">Quá hạn</span> :
                                    <span className="text-amber-500 font-medium">Đang chờ</span>))}
                            </div>
                          </td>
                          <td className="px-5 py-4 align-top whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-chat-muted">
                              <Calendar className="w-3 h-3" />
                              {new Date(task.deadline).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}
                            </div>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => toggleTaskExpanded(task._id)}
                                className="flex items-center gap-1.5 text-[13px] font-medium text-chat-text hover:text-[#0052cc] transition-colors w-fit bg-chat-hover px-2 py-1 rounded-md border border-chat-border"
                              >
                                {task.assignees.length} thành viên tham gia
                                {expandedTasks.has(task._id) ? <ChevronUp className="w-4 h-4 text-chat-muted" /> : <ChevronDown className="w-4 h-4 text-chat-muted" />}
                              </button>

                              {expandedTasks.has(task._id) && (
                                <div className="flex flex-col gap-3 mt-1">
                                  {task.assignees.length > 0 ? task.assignees.map((a, i) => {
                                    if (!a || !a.user) return null;
                                    return (
                                      <div key={a.user._id || i} className="flex items-start justify-between bg-chat-main border border-chat-border rounded-md p-2">
                                        <div className="flex items-center gap-2">
                                          <img src={a.user.profilePicture || "/avatar.png"} className="w-6 h-6 rounded-full object-cover" />
                                          <div className="flex flex-col">
                                            <span className="text-[13px] font-medium text-chat-text">{a.user.fullname}</span>
                                            {a.personalNote && <span className="text-[11px] text-chat-muted italic line-clamp-1">Note: {a.personalNote}</span>}
                                          </div>
                                        </div>
                                        <div className="flex items-center shrink-0 ml-2">
                                          {a.status === "done" && <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[11px] font-medium">Đã nộp</span>}
                                          {a.status === "submitted" && <span className="bg-[#0052cc]/10 text-[#0052cc] px-2 py-0.5 rounded text-[11px] font-medium">Chờ duyệt</span>}
                                          {a.status === "rejected" && new Date() <= new Date(task.deadline) && <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-[11px] font-medium">Làm lại</span>}
                                          {(a.status === "pending" || a.status === "rejected") && new Date() > new Date(task.deadline) && <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-[11px] font-medium">Quá hạn</span>}
                                          {a.status === "pending" && new Date() <= new Date(task.deadline) && <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[11px] font-medium">Đang làm</span>}
                                        </div>
                                      </div>
                                    )
                                  }) : (
                                    <span className="text-[12px] text-chat-muted italic">Không có người nhận</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renderPagination(taskPage, totalTaskPages, setTaskPage)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

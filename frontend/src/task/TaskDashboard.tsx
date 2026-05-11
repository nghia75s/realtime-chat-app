import { useState } from "react"
import { Search, Filter, Calendar, Plus, Clock, CheckCircle2, XCircle } from "lucide-react"
import type { Role, TaskItem } from "./data"

interface TaskDashboardProps {
  role: Role;
  tasks: TaskItem[];
  onOpenCreate: () => void;
  onOpenDetail: (task: TaskItem) => void;
}

export function TaskDashboard({ role, tasks, onOpenCreate, onOpenDetail }: TaskDashboardProps) {
  const [filterStr, setFilterStr] = useState("");
  
  const displayedTasks = tasks.filter(t => {
    // Role filter
    if (role === "employee" && !t.assignees.includes("Nguyễn Văn A")) return false;
    // Search string filter
    if (filterStr && !t.title.toLowerCase().includes(filterStr.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: TaskItem['status']) => {
    switch(status) {
      case "pending": return <span className="bg-amber-500/20 text-amber-500 px-2 py-1 rounded-[4px] text-[12px] font-semibold flex items-center gap-1 w-max"><Clock className="w-3 h-3"/> Đang chờ</span>;
      case "done": return <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded-[4px] text-[12px] font-semibold flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3"/> Hoàn thành</span>;
      case "rejected": return <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded-[4px] text-[12px] font-semibold flex items-center gap-1 w-max"><XCircle className="w-3 h-3"/> Cần làm lại</span>;
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

        {role === "manager" && (
          <button 
            onClick={onOpenCreate}
            className="flex items-center gap-2 bg-[#0052cc] hover:bg-[#0052cc]/90 text-white px-4 py-2 rounded-md text-[14px] font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Tạo Task mới
          </button>
        )}
      </div>

      {/* Grid List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-10">
          {displayedTasks.map(task => (
            <div 
              key={task.id} 
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
                    {task.assignees.slice(0, 4).map((name, i) => (
                      <img key={i} src="/avatar.png" className="w-[28px] h-[28px] rounded-full border-2 border-[#1e1f22] relative" style={{ zIndex: 10 - i }} title={name} />
                    ))}
                    {task.assignees.length > 4 && (
                      <div className="w-[28px] h-[28px] rounded-full border-2 border-[#1e1f22] bg-[#2b2d31] text-[#e1e1e1] text-[11px] font-medium flex items-center justify-center relative" style={{ zIndex: 5 }}>
                        +{task.assignees.length - 4}
                      </div>
                    )}
                    <img src="/avatars/me.png" className="w-[28px] h-[28px] rounded-full border-2 border-[#1e1f22] relative ml-2" style={{ zIndex: 0 }} title={`Tạo bởi: ${task.creator}`} />
                  </div>
                </div>
                <div className="flex items-center text-[12px] text-[#ebaa16] font-medium bg-[#ebaa16]/10 px-2 py-1 rounded">
                  {task.deadline}
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

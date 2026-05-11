import { useState } from "react"
import { PrimarySidebar } from "../cchat/sidebar/PrimarySidebar"
import { initialTasks } from "./data"
import type { Role, TaskItem, CommitType } from "./data"
import { TaskHeader } from "./TaskHeader"
import { TaskDashboard } from "./TaskDashboard"
import { CreateTaskModal } from "./CreateTaskModal"
import { TaskDetail } from "./TaskDetail"

export default function TasksPage() {
  const [role, setRole] = useState<Role>(null);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  const handleCreateTask = (formData: any) => {
    const newTask: TaskItem = {
      id: `t${Date.now()}`,
      title: formData.title,
      description: formData.description,
      assignees: formData.assignees,
      creator: "Manager Tiến Đạt",
      deadline: formData.deadline,
      status: "pending",
      commits: [
        {
          id: `c${Date.now()}`,
          type: "create",
          user: "Manager Tiến Đạt",
          time: new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }),
          description: "Bắt đầu khởi tạo task."
        }
      ]
    };
    setTasks([newTask, ...tasks]);
    setIsCreating(false);
  }

  const handleAddCommit = (taskId: string, type: CommitType, desc: string, fileName?: string, targetCommitId?: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newCommit = {
          id: `c${Date.now()}`,
          type,
          user: role === 'manager' ? "Manager Tiến Đạt" : "Nguyễn Văn A",
          time: new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }),
          description: desc,
          fileName,
          targetCommitId
        };
        
        let newStatus = t.status;
        if (type === "approve") newStatus = "done";
        if (type === "reject") newStatus = "rejected";
        if (type === "commit") newStatus = "pending"; // employee resubmits

        const updatedTask = { ...t, status: newStatus, commits: [...t.commits, newCommit] };
        
        return updatedTask;
      }
      return t;
    }));
  }

  // Nếu chưa chọn Role, hiện màn mock login
  if (!role) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-[#131416] text-[#e1e1e1] font-sans">
        <PrimarySidebar activeTab="todo" />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-[#1e1f22] p-8 rounded-xl border border-[#2b2d31] shadow-2xl flex flex-col items-center gap-6 animate-in fade-in zoom-in w-[400px]">
             <div className="w-16 h-16 bg-[#0052cc]/20 text-[#0052cc] rounded-full flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
             </div>
             <div className="text-center">
               <h2 className="text-[20px] font-bold text-white mb-2">Chọn Vai Trò (Mock)</h2>
               <p className="text-[14px] text-[#a1a1a1]">Module này yêu cầu xác định quyền hạn để hiển thị giao diện phù hợp.</p>
             </div>
             <div className="flex flex-col gap-3 w-full mt-4">
                <button onClick={() => setRole("manager")} className="w-full py-3 bg-[#0052cc] hover:bg-[#0052cc]/90 text-white rounded-lg font-medium transition-all shadow-sm">
                  Đăng nhập quyền Quản Lý
                </button>
                <button onClick={() => setRole("employee")} className="w-full py-3 bg-[#1e1f22] hover:bg-[#2b2d31] border border-[#2b2d31] text-[#e1e1e1] rounded-lg font-medium transition-all">
                  Đăng nhập quyền Nhân Viên
                </button>
             </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#131416] text-[#e1e1e1] font-sans">
      <PrimarySidebar activeTab="todo" />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TaskHeader role={role} setRole={setRole} />
        
        {selectedTask ? (
           <TaskDetail 
             role={role} 
             task={selectedTask} 
             onBack={() => setSelectedTaskId(null)} 
             onAddCommit={handleAddCommit}
           />
        ) : (
           <TaskDashboard 
             role={role} 
             tasks={tasks} 
             onOpenCreate={() => setIsCreating(true)} 
             onOpenDetail={(task) => setSelectedTaskId(task.id)} 
           />
        )}

      </div>

      {isCreating && (
        <CreateTaskModal 
          onClose={() => setIsCreating(false)} 
          onSubmit={handleCreateTask} 
        />
      )}
    </div>
  )
}

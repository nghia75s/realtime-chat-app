import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PrimarySidebar } from "../cchat/sidebar/PrimarySidebar";
import { useTaskStore } from "@/store/useTaskStore";
import { useAuthStore } from "@/store/useAuthStore";
import { TaskHeader } from "../task/TaskHeader";
import { TaskDashboard } from "../task/TaskDashboard";
import { CreateTaskModal } from "../task/CreateTaskModal";
import { TaskDetail } from "../task/TaskDetail";

export default function TasksPage() {
  const { authUser } = useAuthStore();
  const { tasks, fetchTasks, subscribeToTaskUpdates, unsubscribeFromTaskUpdates } = useTaskStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = authUser?.permissions?.editTasks ? "manager" : "employee";

  const [isCreating, setIsCreating] = useState(false);
  const taskIdParam = searchParams.get("taskId");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(taskIdParam);
  const selectedTask = tasks.find(t => t._id === selectedTaskId) || null;

  useEffect(() => {
    fetchTasks();
    subscribeToTaskUpdates();
    return () => {
      unsubscribeFromTaskUpdates();
    };
  }, [fetchTasks, subscribeToTaskUpdates, unsubscribeFromTaskUpdates]);

  useEffect(() => {
    if (taskIdParam) {
      setSelectedTaskId(taskIdParam);
    }
  }, [taskIdParam]);

  const handleCloseDetail = () => {
    setSelectedTaskId(null);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-chat-main text-chat-text font-sans">
      <PrimarySidebar activeTab="todo" />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TaskHeader />

        {selectedTask ? (
          <TaskDetail
            role={role as "manager" | "employee"}
            task={selectedTask}
            onBack={handleCloseDetail}
          />
        ) : (
          <TaskDashboard
            role={role as "manager" | "employee"}
            tasks={tasks}
            onOpenCreate={() => setIsCreating(true)}
            onOpenDetail={(task) => {
              setSelectedTaskId(task._id);
              setSearchParams({ taskId: task._id });
            }}
          />
        )}

      </div>

      {isCreating && (
        <CreateTaskModal
          onClose={() => setIsCreating(false)}
        />
      )}
    </div>
  )
}

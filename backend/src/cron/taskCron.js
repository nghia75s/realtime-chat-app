import cron from "node-cron";
import Task from "../models/Task.js";
import Notification from "../models/Notification.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Chạy mỗi phút
export const initCronJobs = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      
      // Tìm các task: quá hạn, chưa hoàn thành, và chưa báo cáo
      const overdueTasks = await Task.find({
        deadline: { $lt: now },
        status: { $ne: "done" },
        isOverdueReported: false,
      })
        .populate("assignees.user", "fullname _id")
        .populate("creator", "_id");

      for (const task of overdueTasks) {
        // Gom nhóm những người chưa nộp (pending, rejected)
        const pendingAssignees = task.assignees.filter(a => a.status === "pending" || a.status === "rejected");
        
        if (pendingAssignees.length > 0) {
          const names = pendingAssignees.map(a => a.user.fullname).join(", ");
          
          // 1. Thông báo cho Quản lý (creator)
          const managerNotif = new Notification({
            recipient: task.creator._id,
            sender: task.creator._id,
            type: "task_overdue",
            taskId: task._id,
            message: `[QUÁ HẠN] Công việc "${task.title}" đã quá hạn. Còn ${pendingAssignees.length} nhân viên chưa hoàn thành: ${names}`
          });
          await managerNotif.save();
          await managerNotif.populate("taskId", "title");

          const managerSocketId = getReceiverSocketId(task.creator._id.toString());
          if (managerSocketId) {
            io.to(managerSocketId).emit("newNotification", managerNotif);
          }

          // 2. Thông báo cho từng nhân viên quá hạn
          for (const assignee of pendingAssignees) {
            const assigneeNotif = new Notification({
              recipient: assignee.user._id,
              sender: task.creator._id,
              type: "task_overdue",
              taskId: task._id,
              message: `[QUÁ HẠN] Công việc "${task.title}" đã vượt deadline. Vui lòng liên hệ quản lý ngay!`
            });
            await assigneeNotif.save();
            await assigneeNotif.populate("taskId", "title");

            const assigneeSocketId = getReceiverSocketId(assignee.user._id.toString());
            if (assigneeSocketId) {
              io.to(assigneeSocketId).emit("newNotification", assigneeNotif);
            }
          }
        }

        // Đánh dấu đã báo cáo để không bị spam
        task.isOverdueReported = true;
        await task.save();
      }
    } catch (error) {
      console.error("Cron Job Error:", error);
    }
  });
};

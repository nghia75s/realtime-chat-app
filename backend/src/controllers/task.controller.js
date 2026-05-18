import Task from "../models/Task.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { ENV } from "../lib/env.js";
import mongoose from "mongoose";

const VALID_COMMIT_TYPES = ["commit", "approve", "reject"];

// GET /api/tasks
export const getTasks = async (req, res) => {
  try {
    const myId = req.user._id;
    // Lấy hết task nếu là admin (có quyền viewAdmin)
    if (req.user.permissions?.viewAdmin) {
      const tasks = await Task.find()
        .populate("creator", "fullname profilePicture email")
        .populate("assignees.user", "fullname profilePicture email")
        .populate("commits.userId", "fullname profilePicture")
        .sort({ createdAt: -1 });
      return res.status(200).json(tasks);
    } else if (req.user.permissions?.editTasks) {
      // Quản lý: Lấy task do mình tạo hoặc được giao
      const tasks = await Task.find({
        $or: [
          { creator: myId },
          { "assignees.user": myId }
        ]
      })
        .populate("creator", "fullname profilePicture email")
        .populate("assignees.user", "fullname profilePicture email")
        .populate("commits.userId", "fullname profilePicture")
        .sort({ createdAt: -1 });
      return res.status(200).json(tasks);
    } else {
      // Nhân viên: Chỉ lấy task được giao
      const tasks = await Task.find({ "assignees.user": myId })
        .populate("creator", "fullname profilePicture email")
        .populate("assignees.user", "fullname profilePicture email")
        .populate("commits.userId", "fullname profilePicture")
        .sort({ createdAt: -1 });
      return res.status(200).json(tasks);
    }
  } catch (error) {
    console.error("Error in getTasks:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/tasks
export const createTask = async (req, res) => {
  try {
    // Phải có quyền editTasks hoặc viewAdmin mới được tạo
    if (!req.user.permissions?.editTasks && !req.user.permissions?.viewAdmin) {
      return res.status(403).json({ message: "Bạn không có quyền tạo công việc" });
    }

    const { title, description, assignees, deadline } = req.body;
    const creatorId = req.user._id;

    if (!title || !description || !assignees || assignees.length === 0 || !deadline) {
      return res.status(400).json({ message: "Vui lòng điền đủ thông tin" });
    }

    // Bug #8: Validate từng assignee ID là ObjectId hợp lệ
    const allIdsValid = assignees.every(id => mongoose.Types.ObjectId.isValid(id));
    if (!allIdsValid) {
      return res.status(400).json({ message: "Danh sách người được giao không hợp lệ" });
    }

    const taskDeadline = new Date(deadline);
    const now = new Date(); // So sánh đầy đủ cả giờ:phút, không chỉ ngày

    if (taskDeadline <= now) {
      return res.status(400).json({ message: "Deadline phải là thời điểm trong tương lai" });
    }

    // Format assignees cho schema
    const formattedAssignees = assignees.map(userId => ({
      user: userId,
      status: "pending"
    }));

    const newTask = new Task({
      title,
      description,
      creator: creatorId,
      assignees: formattedAssignees,
      deadline: new Date(deadline),
      commits: [
        {
          type: "create",
          userId: creatorId,
          description: "Bắt đầu khởi tạo task."
        }
      ]
    });

    await newTask.save();

    // Populate data to return
    await newTask.populate("creator", "fullname profilePicture email");
    await newTask.populate("assignees.user", "fullname profilePicture email");
    await newTask.populate("commits.userId", "fullname profilePicture");

    // Gửi tin nhắn tự động cho từng assignee
    const clientUrl = ENV.CLIENT_URL || "http://localhost:5173";
    const creatorName = req.user.fullname;

    for (const assigneeId of assignees) {
      const assigneeDoc = await User.findById(assigneeId);
      if (!assigneeDoc) continue;

      const dateStr = new Date(deadline).toLocaleDateString("vi-VN");
      const taskLink = `${clientUrl}/todo?taskId=${newTask._id}`;
      const msgText = `Quản lý ${creatorName} đã giao việc cho ${assigneeDoc.fullname} với deadline đến ngày ${dateStr} với ghi chú là ${description}. Xem chi tiết tại: ${taskLink}`;

      const newMessage = new Message({
        senderId: creatorId,
        receiverId: assigneeId,
        text: msgText,
      });

      await newMessage.save();

      const newNotif = new Notification({
        recipient: assigneeId,
        sender: creatorId,
        type: "task_assign",
        taskId: newTask._id,
        message: `Quản lý ${creatorName} đã giao cho bạn một công việc: "${newTask.title}"`
      });
      await newNotif.save();
      await newNotif.populate("sender", "fullname profilePicture");
      await newNotif.populate("taskId", "title");

      const receiverSocketId = getReceiverSocketId(assigneeId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
        io.to(receiverSocketId).emit("newNotification", newNotif);
      }
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error in createTask:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/tasks/:id/commit
export const addCommit = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, description, fileName, targetCommitId } = req.body;
    const userId = req.user._id;

    // Bug #2: Whitelist commit type — ngăn chặn giả mạo commit log
    if (!VALID_COMMIT_TYPES.includes(type)) {
      return res.status(400).json({ message: "Loại commit không hợp lệ" });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task không tồn tại" });

    // Xác định logic trạng thái
    if (type === "commit") {
      // Kiểm tra task có quá hạn không — không cho phép nộp sau deadline
      if (new Date() > new Date(task.deadline)) {
        return res.status(400).json({ message: "Task đã quá hạn, không thể nộp bài" });
      }

      // Nhân viên nộp bài
      const myAssignee = task.assignees.find(a => a.user.toString() === userId.toString());
      if (!myAssignee) {
        return res.status(403).json({ message: "Bạn không được giao task này" });
      }

      myAssignee.status = "submitted";

      // Gửi Notification cho người tạo task (Quản lý)
      const newNotif = new Notification({
        recipient: task.creator,
        sender: userId,
        type: "task_submit",
        taskId: task._id,
        message: `${req.user.fullname} đã nộp bản thảo cho công việc "${task.title}"`
      });
      await newNotif.save();
      await newNotif.populate("sender", "fullname profilePicture");
      await newNotif.populate("taskId", "title");

      // Fix: toString() cho ObjectId để socket tìm đúng room
      const managerSocketId = getReceiverSocketId(task.creator.toString());
      if (managerSocketId) {
        io.to(managerSocketId).emit("newNotification", newNotif);
      }
    } else if (type === "approve" || type === "reject") {
      if (!req.user.permissions?.approveTasks) {
        return res.status(403).json({ message: "Bạn không có quyền duyệt task" });
      }
      
      // Cần biết đang duyệt bài của ai (qua targetCommitId)
      if (targetCommitId) {
        const targetCommit = task.commits.find(c => c._id.toString() === targetCommitId);
        if (targetCommit) {
          const assigneeId = targetCommit.userId;
          const assigneeIndex = task.assignees.findIndex(a => a.user.toString() === assigneeId.toString());
          
          if (assigneeIndex !== -1) {
            task.assignees[assigneeIndex].status = type === "approve" ? "done" : "rejected";
            
            // Tự động bắn tin nhắn báo duyệt cho người đó
            const clientUrl = ENV.CLIENT_URL || "http://localhost:5173";
            const taskLink = `${clientUrl}/todo?taskId=${task._id}`;
            const msgStatus = type === "approve" ? "phê duyệt thành công" : "yêu cầu làm lại";
            const msgText = `Quản lý ${req.user.fullname} đã ${msgStatus} phần công việc của bạn trong Task "${task.title}". Xem chi tiết tại: ${taskLink}`;
            
            const newMessage = new Message({
              senderId: userId,
              receiverId: assigneeId,
              text: msgText,
            });
            await newMessage.save();

            const newNotif = new Notification({
              recipient: assigneeId,
              sender: userId,
              type: type === "approve" ? "task_approve" : "task_reject",
              taskId: task._id,
              message: `Quản lý ${req.user.fullname} đã ${type === "approve" ? "Duyệt Đạt" : "Yêu cầu làm lại"} công việc "${task.title}"`
            });
            await newNotif.save();
            await newNotif.populate("sender", "fullname profilePicture");
            await newNotif.populate("taskId", "title");

            const receiverSocketId = getReceiverSocketId(assigneeId);
            if (receiverSocketId) {
              io.to(receiverSocketId).emit("newMessage", newMessage);
              io.to(receiverSocketId).emit("newNotification", newNotif);
            }
          }
        }
      }
    }

    // Cập nhật trạng thái tổng của Task
    // Nếu tất cả là "done" -> Task "done"
    // Nếu có "rejected" -> Task "rejected"
    // Ngược lại -> Task "pending"
    const allDone = task.assignees.every(a => a.status === "done");
    const anyRejected = task.assignees.some(a => a.status === "rejected");
    
    if (allDone && task.assignees.length > 0) task.status = "done";
    else if (anyRejected) task.status = "rejected";
    else task.status = "pending";

    // Thêm commit
    const newCommit = {
      type,
      userId,
      description,
      fileName,
      targetCommitId
    };
    task.commits.push(newCommit);
    
    await task.save();

    await task.populate("creator", "fullname profilePicture email");
    await task.populate("assignees.user", "fullname profilePicture email");
    await task.populate("commits.userId", "fullname profilePicture");

    res.status(200).json(task);
  } catch (error) {
    console.error("Error in addCommit:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/tasks/:id
export const editTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, deadline } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task không tồn tại" });

    if (task.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Chỉ người tạo task mới có quyền chỉnh sửa" });
    }

    if (description) task.description = description;
    if (deadline) {
      const taskDeadline = new Date(deadline);
      const now = new Date();
      if (taskDeadline <= now) {
        return res.status(400).json({ message: "Deadline phải là thời điểm trong tương lai" });
      }
      task.deadline = taskDeadline;
      task.isOverdueReported = false; // Reset cờ báo quá hạn nếu gia hạn
    }

    // Ghi log vào commits
    task.commits.push({
      type: "edit",
      userId: req.user._id,
      description: `Đã chỉnh sửa nội dung/deadline công việc.`
    });

    await task.save();

    await task.populate("creator", "fullname profilePicture email");
    await task.populate("assignees.user", "fullname profilePicture email");
    await task.populate("commits.userId", "fullname profilePicture");

    res.status(200).json(task);
  } catch (error) {
    console.error("Error in editTask:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

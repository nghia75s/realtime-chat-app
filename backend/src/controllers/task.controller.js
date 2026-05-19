import Task from "../models/Task.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Group from "../models/Group.js";
import Notification from "../models/Notification.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { ENV } from "../lib/env.js";
import mongoose from "mongoose";

const VALID_COMMIT_TYPES = ["commit", "approve", "reject"];

// Helper: validate deadline trong khoảng (now, now + 100 năm]
const validateDeadline = (deadline) => {
  const taskDeadline = new Date(deadline);
  const now = new Date();
  const maxDeadline = new Date();
  maxDeadline.setFullYear(maxDeadline.getFullYear() + 100);

  if (isNaN(taskDeadline.getTime())) return "Deadline không hợp lệ";
  if (taskDeadline <= now) return "Deadline phải là thời điểm trong tương lai";
  if (taskDeadline > maxDeadline) return "Deadline không được vượt quá 100 năm kể từ hôm nay";
  return null; // OK
};

// Helper: filter commits cho employee dựa theo canViewOthers
const filterCommitsForEmployee = (task, myId) => {
  const myAssignee = task.assignees.find(
    (a) => a.user._id?.toString() === myId.toString() || a.user?.toString() === myId.toString()
  );

  // Nếu được phép xem tất cả thì trả về nguyên
  if (myAssignee?.canViewOthers) return task;

  // Lấy tập commit IDs của mình
  const myCommitIds = new Set(
    task.commits
      .filter((c) => {
        const uid = c.userId?._id?.toString() || c.userId?.toString();
        return uid === myId.toString();
      })
      .map((c) => c._id.toString())
  );

  task.commits = task.commits.filter((c) => {
    // Luôn thấy logs hệ thống (create, edit)
    if (["create", "edit"].includes(c.type)) return true;
    // Commits do mình tạo
    const uid = c.userId?._id?.toString() || c.userId?.toString();
    if (uid === myId.toString()) return true;
    // Manager phản hồi cho commit của mình
    if (c.targetCommitId && myCommitIds.has(c.targetCommitId.toString())) return true;
    return false;
  });

  return task;
};

// GET /api/tasks
export const getTasks = async (req, res) => {
  try {
    const myId = req.user._id;
    const isManager = req.user.permissions?.editTasks || req.user.permissions?.viewAdmin;

    let query;
    if (req.user.permissions?.viewAdmin) {
      query = Task.find();
    } else if (req.user.permissions?.editTasks) {
      query = Task.find({
        $or: [{ creator: myId }, { "assignees.user": myId }],
      });
    } else {
      query = Task.find({ "assignees.user": myId });
    }

    const tasks = await query
      .populate("creator", "fullname profilePicture email")
      .populate("assignees.user", "fullname profilePicture email")
      .populate("commits.userId", "fullname profilePicture")
      .sort({ createdAt: -1 });

    // Nếu là employee: filter commits theo canViewOthers
    if (!isManager) {
      const filtered = tasks.map((task) => {
        const plain = task.toObject({ virtuals: true });
        return filterCommitsForEmployee(plain, myId);
      });
      return res.status(200).json(filtered);
    }

    return res.status(200).json(tasks);
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

    const { title, description, assignees = [], groups = [], assigneeNotes = {}, deadline } = req.body;
    const creatorId = req.user._id;

    if (!title || !description || !deadline) {
      return res.status(400).json({ message: "Vui lòng điền đủ thông tin" });
    }

    // Validate deadline
    const deadlineError = validateDeadline(deadline);
    if (deadlineError) return res.status(400).json({ message: deadlineError });

    // Validate individual assignee IDs
    if (assignees.length > 0) {
      const allIdsValid = assignees.every((id) => mongoose.Types.ObjectId.isValid(id));
      if (!allIdsValid) {
        return res.status(400).json({ message: "Danh sách người được giao không hợp lệ" });
      }
    }

    // Validate group IDs
    if (groups.length > 0) {
      const allGroupIdsValid = groups.every((id) => mongoose.Types.ObjectId.isValid(id));
      if (!allGroupIdsValid) {
        return res.status(400).json({ message: "Danh sách nhóm không hợp lệ" });
      }
    }

    // Expand group members → individual user IDs
    let groupUserIds = [];
    if (groups.length > 0) {
      const groupDocs = await Group.find({ _id: { $in: groups } }).select("members");
      groupUserIds = groupDocs.flatMap((g) => g.members.map((m) => m.toString()));
    }

    // Merge & deduplicate, loại bỏ creator khỏi assignees
    const allAssigneeIds = [
      ...new Set([...assignees.map(String), ...groupUserIds]),
    ].filter((id) => id !== creatorId.toString());

    if (allAssigneeIds.length === 0) {
      return res.status(400).json({ message: "Phải có ít nhất một người được giao việc" });
    }

    // Format assignees với personalNote
    const formattedAssignees = allAssigneeIds.map((userId) => ({
      user: userId,
      status: "pending",
      personalNote: assigneeNotes[userId] || "",
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
          description: "Bắt đầu khởi tạo task.",
        },
      ],
    });

    await newTask.save();

    // Populate data to return
    await newTask.populate("creator", "fullname profilePicture email");
    await newTask.populate("assignees.user", "fullname profilePicture email");
    await newTask.populate("commits.userId", "fullname profilePicture");

    // Gửi tin nhắn và notification cho từng assignee
    const clientUrl = ENV.CLIENT_URL || "http://localhost:5173";
    const creatorName = req.user.fullname;

    for (const assigneeId of allAssigneeIds) {
      const assigneeDoc = await User.findById(assigneeId);
      if (!assigneeDoc) continue;

      const dateStr = new Date(deadline).toLocaleDateString("vi-VN");
      const personalNote = assigneeNotes[assigneeId];
      const taskLink = `${clientUrl}/todo?taskId=${newTask._id}`;
      const noteStr = personalNote ? ` Ghi chú riêng: ${personalNote}.` : "";
      const msgText = `Quản lý ${creatorName} đã giao việc cho ${assigneeDoc.fullname} với deadline đến ngày ${dateStr} với ghi chú là ${description}.${noteStr} Xem chi tiết tại: ${taskLink}`;

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
        message: `Quản lý ${creatorName} đã giao cho bạn một công việc: "${newTask.title}"`,
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

    // Whitelist commit type
    if (!VALID_COMMIT_TYPES.includes(type)) {
      return res.status(400).json({ message: "Loại commit không hợp lệ" });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task không tồn tại" });

    if (type === "commit") {
      // Kiểm tra quá hạn
      if (new Date() > new Date(task.deadline)) {
        return res.status(400).json({ message: "Task đã quá hạn, không thể nộp bài" });
      }

      const myAssignee = task.assignees.find(
        (a) => a.user.toString() === userId.toString()
      );
      if (!myAssignee) {
        return res.status(403).json({ message: "Bạn không được giao task này" });
      }

      myAssignee.status = "submitted";

      // Notify manager
      const newNotif = new Notification({
        recipient: task.creator,
        sender: userId,
        type: "task_submit",
        taskId: task._id,
        message: `${req.user.fullname} đã nộp bản thảo cho công việc "${task.title}"`,
      });
      await newNotif.save();
      await newNotif.populate("sender", "fullname profilePicture");
      await newNotif.populate("taskId", "title");

      const managerSocketId = getReceiverSocketId(task.creator.toString());
      if (managerSocketId) {
        io.to(managerSocketId).emit("newNotification", newNotif);
      }
    } else if (type === "approve" || type === "reject") {
      if (!req.user.permissions?.approveTasks) {
        return res.status(403).json({ message: "Bạn không có quyền duyệt task" });
      }

      if (targetCommitId) {
        const targetCommit = task.commits.find(
          (c) => c._id.toString() === targetCommitId
        );
        if (targetCommit) {
          const assigneeId = targetCommit.userId;
          const assigneeIndex = task.assignees.findIndex(
            (a) => a.user.toString() === assigneeId.toString()
          );

          if (assigneeIndex !== -1) {
            task.assignees[assigneeIndex].status =
              type === "approve" ? "done" : "rejected";

            const clientUrl = ENV.CLIENT_URL || "http://localhost:5173";
            const taskLink = `${clientUrl}/todo?taskId=${task._id}`;
            const msgStatus =
              type === "approve" ? "phê duyệt thành công" : "yêu cầu làm lại";
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
              message: `Quản lý ${req.user.fullname} đã ${
                type === "approve" ? "Duyệt Đạt" : "Yêu cầu làm lại"
              } công việc "${task.title}"`,
            });
            await newNotif.save();
            await newNotif.populate("sender", "fullname profilePicture");
            await newNotif.populate("taskId", "title");

            const receiverSocketId = getReceiverSocketId(assigneeId.toString());
            if (receiverSocketId) {
              io.to(receiverSocketId).emit("newMessage", newMessage);
              io.to(receiverSocketId).emit("newNotification", newNotif);
            }
          }
        }
      }
    }

    // Bug #1 FIX: Trạng thái tổng chỉ dựa vào allDone
    // Trạng thái chi tiết từng người (rejected/pending/submitted) đã đủ thể hiện
    const allDone =
      task.assignees.length > 0 &&
      task.assignees.every((a) => a.status === "done");
    task.status = allDone ? "done" : "pending";

    // Thêm commit
    task.commits.push({ type, userId, description, fileName, targetCommitId });

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
    const { description, deadline, assigneeNotes } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task không tồn tại" });

    if (task.creator.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Chỉ người tạo task mới có quyền chỉnh sửa" });
    }

    if (description) task.description = description;

    if (deadline) {
      const deadlineError = validateDeadline(deadline);
      if (deadlineError) return res.status(400).json({ message: deadlineError });
      task.deadline = new Date(deadline);
      task.isOverdueReported = false;
    }

    // Cập nhật personalNote per-assignee nếu có
    if (assigneeNotes && typeof assigneeNotes === "object") {
      task.assignees.forEach((a) => {
        const userId = a.user.toString();
        if (assigneeNotes[userId] !== undefined) {
          a.personalNote = assigneeNotes[userId];
        }
      });
    }

    task.commits.push({
      type: "edit",
      userId: req.user._id,
      description: `Đã chỉnh sửa nội dung/deadline công việc.`,
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

// PATCH /api/tasks/:id/access — cập nhật canViewOthers per-assignee
export const updateAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigneeId, canViewOthers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
      return res.status(400).json({ message: "assigneeId không hợp lệ" });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task không tồn tại" });

    // Chỉ creator hoặc manager mới được thay đổi access
    const isCreator = task.creator.toString() === req.user._id.toString();
    if (!isCreator && !req.user.permissions?.editTasks && !req.user.permissions?.viewAdmin) {
      return res.status(403).json({ message: "Bạn không có quyền thay đổi access control" });
    }

    const assignee = task.assignees.find(
      (a) => a.user.toString() === assigneeId
    );
    if (!assignee) {
      return res.status(404).json({ message: "Người được giao không tồn tại trong task này" });
    }

    assignee.canViewOthers = Boolean(canViewOthers);
    await task.save();

    await task.populate("creator", "fullname profilePicture email");
    await task.populate("assignees.user", "fullname profilePicture email");
    await task.populate("commits.userId", "fullname profilePicture");

    res.status(200).json(task);
  } catch (error) {
    console.error("Error in updateAccess:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

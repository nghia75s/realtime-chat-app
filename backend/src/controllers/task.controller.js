import Task from "../models/Task.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Group from "../models/Group.js";
import Notification from "../models/Notification.js";
import { emitToUser } from "../lib/socket.js";
import { ENV } from "../lib/env.js";
import mongoose from "mongoose";

const VALID_COMMIT_TYPES = ["commit", "approve", "reject"];


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


const filterCommitsForEmployee = (task, myId) => {
  const myAssignee = task.assignees.find(
    (a) => a.user._id?.toString() === myId.toString() || a.user?.toString() === myId.toString()
  );

  // Nếu không tìm thấy hoặc được phép xem tất cả thì trả về nguyên
  if (!myAssignee || myAssignee.canViewOthers) return task;

  // Lấy tập commit IDs của mình
  const myCommitIds = new Set(
    task.commits
      .filter((c) => {
        const uid = c.userId?._id?.toString() || c.userId?.toString();
        return uid === myId.toString();
      })
      .map((c) => c._id.toString())
  );

  // 1. Lọc commits
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

  // 2. Lọc assignees: chỉ giữ lại chính mình
  task.assignees = task.assignees.filter((a) => {
    const uid = a.user._id?.toString() || a.user?.toString();
    return uid === myId.toString();
  });

  return task;
};

// Helper: Phát sự kiện taskUpdated tới tất cả người liên quan trong thời gian thực
const emitTaskUpdateToAllInvolved = (task) => {
  const creatorId = task.creator._id?.toString() || task.creator?.toString();

  // 1. Gửi cho creator (manager - nhìn thấy tất cả)
  const taskForCreator = task.toObject ? task.toObject({ virtuals: true }) : JSON.parse(JSON.stringify(task));
  emitToUser(creatorId, "taskUpdated", taskForCreator);

  // 2. Gửi cho từng assignee
  task.assignees.forEach((assignee) => {
    const assigneeId = assignee.user._id?.toString() || assignee.user?.toString();
    if (assigneeId === creatorId) return; // Đã gửi ở trên

    const plainTask = task.toObject ? task.toObject({ virtuals: true }) : JSON.parse(JSON.stringify(task));
    const filteredTask = filterCommitsForEmployee(plainTask, assigneeId);
    emitToUser(assigneeId, "taskUpdated", filteredTask);
  });
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

    const assigneesDocs = await User.find({ _id: { $in: allAssigneeIds } });
    const promises = assigneesDocs.map(async (assigneeDoc) => {
      const assigneeId = assigneeDoc._id.toString();
      const dateStr = new Date(deadline).toLocaleDateString("vi-VN");
      const personalNote = assigneeNotes[assigneeId];
      const msgText = `Quản lý ${creatorName} đã giao việc cho ${assigneeDoc.fullname}: "${title}".`;

      const newMessage = new Message({
        senderId: creatorId,
        receiverId: assigneeId,
        messageType: "task_assignment",
        text: msgText,
        taskPayload: {
          taskId: newTask._id,
          title: title,
          description: description,
          deadline: deadline,
          note: personalNote || "",
        },
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
      await newNotif.populate([
        { path: "sender", select: "fullname profilePicture" },
        { path: "taskId", select: "title" }
      ]);
      emitToUser(assigneeId, "newMessage", newMessage);
      emitToUser(creatorId, "newMessage", newMessage); 
      emitToUser(assigneeId, "newNotification", newNotif);
    });

    await Promise.all(promises);

    emitTaskUpdateToAllInvolved(newTask);

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
      await newNotif.populate([
        { path: "sender", select: "fullname profilePicture" },
        { path: "taskId", select: "title" }
      ]);

      emitToUser(task.creator.toString(), "newNotification", newNotif);
    } else if (type === "approve" || type === "reject") {
      if (!req.user.permissions?.approveTasks) {
        return res.status(403).json({ message: "Bạn không có quyền duyệt task" });
      }

      if (!targetCommitId) {
        return res.status(400).json({ message: "Thiếu targetCommitId để thực hiện thao tác" });
      }

      const targetCommit = task.commits.find(
        (c) => c._id.toString() === targetCommitId
      );
      if (!targetCommit) {
        return res.status(400).json({ message: "Không tìm thấy commit được yêu cầu duyệt" });
      }

      const assigneeId = targetCommit.userId;
      const assigneeIndex = task.assignees.findIndex(
        (a) => a.user.toString() === assigneeId.toString()
      );

      if (assigneeIndex === -1) {
        return res.status(400).json({ message: "Người nộp commit không thuộc danh sách người được giao của công việc này" });
      }

      task.assignees[assigneeIndex].status =
        type === "approve" ? "done" : "rejected";
      const msgStatus =
        type === "approve" ? "phê duyệt thành công" : "yêu cầu làm lại";
      
      let msgText = `Quản lý ${req.user.fullname} đã ${msgStatus} phần công việc của bạn trong Task "${task.title}"`;
      let notifMessage = `Quản lý ${req.user.fullname} đã ${
        type === "approve" ? "Duyệt Đạt" : "Yêu cầu làm lại"
      } công việc "${task.title}"`;

      if (type === "reject" && description) {
        msgText += `. Lý do: ${description}`;
        notifMessage += `. Lý do: ${description}`;
      }

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
        message: notifMessage,
      });
      await newNotif.save();
      await newNotif.populate([
        { path: "sender", select: "fullname profilePicture" },
        { path: "taskId", select: "title" }
      ]);

      emitToUser(assigneeId.toString(), "newMessage", newMessage);
      emitToUser(assigneeId.toString(), "newNotification", newNotif);
    }

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

    emitTaskUpdateToAllInvolved(task);

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

    emitTaskUpdateToAllInvolved(task);

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

    emitTaskUpdateToAllInvolved(task);

    res.status(200).json(task);
  } catch (error) {
    console.error("Error in updateAccess:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// this is for storing online users
const userSocketMap = {}; // {userId: Set<socketId>}
const groupSocketMap = {}; // {groupId: [socketIds]}

// Check if a user is online (has at least one active socket connection)
export function getReceiverSocketId(userId) {
  if (userSocketMap[userId] && userSocketMap[userId].size > 0) {
    // Return any socket id (for backward compatibility if needed)
    return Array.from(userSocketMap[userId])[0];
  }
  return null;
}

// Get all socket ids of a user
export function getReceiverSocketIds(userId) {
  return userSocketMap[userId] ? Array.from(userSocketMap[userId]) : [];
}

// Emit event to all sockets of a specific user
export function emitToUser(userId, event, data) {
  const socketIds = userSocketMap[userId];
  if (socketIds) {
    socketIds.forEach((socketId) => {
      io.to(socketId).emit(event, data);
    });
  }
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullname);

  const userId = socket.userId;
  if (!userSocketMap[userId]) {
    userSocketMap[userId] = new Set();
  }
  userSocketMap[userId].add(socket.id);

  // io.emit() is used to send events to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Group chat events
  socket.on("joinGroup", (groupId) => {
    socket.join(`group_${groupId}`);
    if (!groupSocketMap[groupId]) {
      groupSocketMap[groupId] = [];
    }
    if (!groupSocketMap[groupId].includes(socket.id)) {
      groupSocketMap[groupId].push(socket.id);
    }
    console.log(`User ${socket.user.fullname} joined group ${groupId}`);
  });

  socket.on("leaveGroup", (groupId) => {
    socket.leave(`group_${groupId}`);
    if (groupSocketMap[groupId]) {
      groupSocketMap[groupId] = groupSocketMap[groupId].filter(id => id !== socket.id);
      if (groupSocketMap[groupId].length === 0) {
        delete groupSocketMap[groupId];
      }
    }
    console.log(`User ${socket.user.fullname} left group ${groupId}`);
  });

  socket.on("groupMessage", (data) => {
    const { groupId, message } = data;
    // Emit to all members in the group except sender
    socket.to(`group_${groupId}`).emit("newGroupMessage", message);
  });

  socket.on("typing", (data) => {
    const { groupId, isTyping } = data;
    socket.to(`group_${groupId}`).emit("userTyping", {
      userId: socket.userId,
      fullname: socket.user.fullname,
      isTyping
    });
  });

  // with socket.on we listen for events from clients
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullname);
    if (userSocketMap[userId]) {
      userSocketMap[userId].delete(socket.id);
      if (userSocketMap[userId].size === 0) {
        delete userSocketMap[userId];
      }
    }

    // Remove from all groups
    Object.keys(groupSocketMap).forEach(groupId => {
      groupSocketMap[groupId] = groupSocketMap[groupId].filter(id => id !== socket.id);
      if (groupSocketMap[groupId].length === 0) {
        delete groupSocketMap[groupId];
      }
    });

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };

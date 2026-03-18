const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

// Track online users: userId -> Set of socketIds
const onlineUsers = new Map();

const socketManager = (io) => {
  // ─── Auth Middleware ───────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medi@123');
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      socket.userId = user._id.toString();
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // ─── Connection ────────────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`[Socket] User connected: ${userId} (${socket.user.name}) | socketId: ${socket.id}`);

    // Track online presence
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast online status
    socket.broadcast.emit('user:online', { userId, name: socket.user.name });

    // ── Join appointment rooms the user is part of ─────────────────────────
    socket.on('appointment:join', (appointmentId) => {
      if (appointmentId) {
        socket.join(`appointment:${appointmentId}`);
        console.log(`[Socket] ${userId} joined room: appointment:${appointmentId}`);
      }
    });

    // ── Video Call Signaling ────────────────────────────────────────────────
    // When doctor starts a call, notify the patient
    socket.on('video:call:start', ({ appointmentId, meetingId }) => {
      if (appointmentId && meetingId) {
        console.log(`[Socket] Doctor ${userId} started call for appointment:${appointmentId}`);
        socket.to(`appointment:${appointmentId}`).emit('video:call:incoming', {
          appointmentId,
          meetingId,
          doctorName: socket.user.name,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // When call ends, notify the other party
    socket.on('video:call:end', ({ appointmentId }) => {
      if (appointmentId) {
        socket.to(`appointment:${appointmentId}`).emit('video:call:ended', {
          appointmentId,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // ── Doctor-Patient Chat ────────────────────────────────────────────────
    socket.on('chat:send', async (data) => {
      try {
        const { appointmentId, text } = data;
        if (!appointmentId || !text?.trim()) return;

        // Persist message
        const message = new Message({
          appointmentId,
          senderId: userId,
          senderRole: socket.user.role,
          senderName: socket.user.name,
          text: text.trim(),
        });
        await message.save();

        const payload = {
          _id: message._id,
          appointmentId,
          senderId: userId,
          senderRole: socket.user.role,
          senderName: socket.user.name,
          text: message.text,
          createdAt: message.createdAt,
        };

        // Deliver to all in the appointment room
        io.to(`appointment:${appointmentId}`).emit('chat:message', payload);
      } catch (err) {
        console.error('[Socket] chat:send error:', err.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ── Typing Indicator ───────────────────────────────────────────────────
    socket.on('chat:typing', ({ appointmentId, isTyping }) => {
      if (!appointmentId) return;
      socket.to(`appointment:${appointmentId}`).emit('chat:typing', {
        userId,
        name: socket.user.name,
        isTyping,
      });
    });

    // ── Heartbeat / keep-alive ─────────────────────────────────────────────
    socket.on('user:heartbeat', () => {
      socket.emit('user:heartbeat:ack');
    });

    // ── Disconnect ─────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] User disconnected: ${userId} | reason: ${reason}`);
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          socket.broadcast.emit('user:offline', { userId });
        }
      }
    });
  });

  return io;
};

// ─── Helpers (used by REST routes) ──────────────────────────────────────────

/**
 * Emit appointment status change to all clients in that appointment's room.
 * @param {object} io - Socket.io server instance
 * @param {string} appointmentId
 * @param {string} status - new status
 * @param {object} extra - any extra data to include
 */
const emitAppointmentStatus = (io, appointmentId, status, extra = {}) => {
  io.to(`appointment:${appointmentId}`).emit('appointment:statusChanged', {
    appointmentId,
    status,
    ...extra,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send a notification to a specific user (all their connected sockets).
 */
const emitNotification = (io, userId, notification) => {
  io.to(`appointment:${userId}`).emit('notification:new', notification);
  // Also emit globally — client filters by userId
  io.emit('notification:new', { ...notification, targetUserId: userId });
};

/**
 * Check if a user is currently online.
 */
const isUserOnline = (userId) => onlineUsers.has(userId.toString());

module.exports = { socketManager, emitAppointmentStatus, emitNotification, isUserOnline };

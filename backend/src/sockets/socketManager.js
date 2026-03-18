const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

const onlineUsers = new Map();

const socketManager = (io) => {
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      if (!process.env.JWT_SECRET) {
        return next(new Error('Server misconfigured: JWT_SECRET missing'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

  io.on('connection', (socket) => {
    const userId = socket.userId;

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    socket.broadcast.emit('user:online', { userId, name: socket.user.name });

    socket.on('appointment:join', (appointmentId) => {
      if (appointmentId) {
        socket.join(`appointment:${appointmentId}`);
      }
    });

    socket.on('video:call:start', ({ appointmentId, meetingId }) => {
      if (appointmentId && meetingId) {
        socket.to(`appointment:${appointmentId}`).emit('video:call:incoming', {
          appointmentId,
          meetingId,
          doctorName: socket.user.name,
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on('video:call:end', ({ appointmentId }) => {
      if (appointmentId) {
        socket.to(`appointment:${appointmentId}`).emit('video:call:ended', {
          appointmentId,
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on('chat:send', async (data) => {
      try {
        const { appointmentId, text } = data;
        if (!appointmentId || !text?.trim()) return;

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

        io.to(`appointment:${appointmentId}`).emit('chat:message', payload);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('chat:typing', ({ appointmentId, isTyping }) => {
      if (!appointmentId) return;
      socket.to(`appointment:${appointmentId}`).emit('chat:typing', {
        userId,
        name: socket.user.name,
        isTyping,
      });
    });

    socket.on('user:heartbeat', () => {
      socket.emit('user:heartbeat:ack');
    });

    socket.on('disconnect', (reason) => {
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



const emitAppointmentStatus = (io, appointmentId, status, extra = {}) => {
  io.to(`appointment:${appointmentId}`).emit('appointment:statusChanged', {
    appointmentId,
    status,
    ...extra,
    timestamp: new Date().toISOString(),
  });
};


const emitNotification = (io, userId, notification) => {
  io.to(`appointment:${userId}`).emit('notification:new', notification);
  io.emit('notification:new', { ...notification, targetUserId: userId });
};


const isUserOnline = (userId) => onlineUsers.has(userId.toString());

module.exports = { socketManager, emitAppointmentStatus, emitNotification, isUserOnline };

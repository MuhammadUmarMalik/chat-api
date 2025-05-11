import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';

let io;
const onlineUsers = new Map(); // userId -> socketId

function setupSocket(server) {
  io = new Server(server);

  io.on('connection', (socket) => {
    console.log('🟢 Socket connected:', socket.id);

    // User connected: store socket ID
    socket.on('userConnected', ({ userId }) => {
      onlineUsers.set(userId, socket.id);
      io.emit('onlineUsers', Array.from(onlineUsers.keys())); // Broadcast online users
    });

    // User joins a conversation room (1-on-1 or group)
    socket.on('joinRoom', ({ conversationId }) => {
      socket.join(String(conversationId));
      console.log(`Joined room ${conversationId}`);
    });

    // Send message to a conversation room
    socket.on('sendMessage', async ({ conversationId, senderId, content }) => {
      const prisma = new PrismaClient();

      // Save message in DB
      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId,
          content
        },
        include: {
          sender: true
        }
      });

      // Emit message to users in the room
      io.to(String(conversationId)).emit('receiveMessage', message);
    });

    // User disconnected: remove from online users list
    socket.on('disconnect', () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
        }
      }
      io.emit('onlineUsers', Array.from(onlineUsers.keys())); // Update online users
      console.log('🔴 Disconnected:', socket.id);
    });
  });
}

function getIO() {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export { setupSocket, getIO };

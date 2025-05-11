import express from 'express';
import {
  createConversation,
  getMessages,
  sendMessage
} from '../controllers/chatController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Create or get a conversation
router.post('/conversation', authMiddleware, createConversation);

// Get messages for a specific conversation
router.get('/messages/:conversationId', authMiddleware, getMessages);

// Send a message to a conversation (Socket.IO also handles this in real-time)
router.post('/message', authMiddleware, sendMessage);

export default router;

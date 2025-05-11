import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create or get existing conversation between 2 users (for 1-on-1 chat)
export const createConversation = async (req, res) => {
  try {
    const { userAId, userBId, isGroup = false, name } = req.body;

    if (!userAId || !userBId) {
      return res.status(400).json({ 
        message: 'Both userAId and userBId are required' 
      });
    }

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { userAId: Number(userAId), userBId: Number(userBId) },
          { userAId: Number(userBId), userBId: Number(userAId) }
        ]
      },
      include: {
        userA: true,
        userB: true
      }
    });

    if (!conversation) {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          userA: {
            connect: { id: Number(userAId) }
          },
          userB: {
            connect: { id: Number(userBId) }
          },
          isGroup: isGroup || false,
          name: name || null
        },
        include: {
          userA: true,
          userB: true
        }
      });
    }

    return res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return res.status(500).json({ 
      message: 'Failed to create conversation', 
      error: error.message 
    });
  }
};

// Get messages for a specific conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({ message: 'Conversation ID is required' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: parseInt(conversationId) },
      orderBy: { createdAt: 'asc' },
      include: { sender: true }
    });

    return res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch messages', 
      error: error.message 
    });
  }
};

// Send a message to a conversation
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user.userId; // From auth middleware
    
    if (!conversationId || !content) {
      return res.status(400).json({ 
        message: 'Conversation ID and content are required' 
      });
    }
    
    const message = await prisma.message.create({
      data: {
        content,
        sender: { connect: { id: senderId } },
        conversation: { connect: { id: parseInt(conversationId) } }
      },
      include: {
        sender: true
      }
    });
    
    // Get socket.io instance to emit the message in real-time
    // This part would typically be handled by your socket.io implementation
    
    return res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ 
      message: 'Failed to send message', 
      error: error.message 
    });
  }
};

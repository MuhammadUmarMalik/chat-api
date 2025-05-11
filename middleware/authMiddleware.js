// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ message: 'Unauthorized' });
  
    const token = authHeader.split(' ')[1];
  
    try {
      const payload = jwt.verify(token, JWT_SECRET);
  
      // Check token in UserToken table
      const storedToken = await prisma.userToken.findFirst({
        where: {
          token,
          userId: payload.userId,
        },
      });
  
      if (!storedToken)
        return res.status(401).json({ message: 'Token is not valid or has been logged out' });
  
      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export default authMiddleware;
  
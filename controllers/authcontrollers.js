// controllers/authController.js
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    // check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // hash password
    const hashedPassword = await hash(password, 10);

    // create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Registration failed' });
  }
}

export async function login(req, res) {
    const { email, password } = req.body;
  
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });
  
    const isMatch = await compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
  
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  
    // ✅ Store token in the UserToken table
    await prisma.userToken.create({
      data: {
        token,
        userId: user.id,
        username: user.username,
      },
    });
  
    return res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  }

export async function logout(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(400).json({ message: 'No token provided' });
  
    try {
      const payload = jwt.verify(token, JWT_SECRET);
  
      // delete the token from the UserToken table
      await prisma.userToken.deleteMany({
        where: {
          token,
          userId: payload.userId,
        },
      });
  
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
      return res.status(400).json({ message: 'Invalid token' });
    }
  }
  
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import http from "http";
import { setupSocket, getIO } from "./socket.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Create HTTP server and attach socket later
const server = http.createServer(app);

// Socket.IO setup
setupSocket(server); // This will internally create io and manage it

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

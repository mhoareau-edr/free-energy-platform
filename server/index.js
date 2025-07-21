import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import userRoutes from './routes/users.js';
import historyRoutes from './routes/history.js';
import pdfRoutes from './routes/pdf.js';
import visitesRoutes from './routes/visites.js';
import chatRoutes from './routes/chat.js';
import notificationRoutes from './routes/notifications.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import http from 'http';
import serveStatic from 'serve-static';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const connectedUsers = new Map();

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});

app.use(cors());
app.use(express.json());
app.use('/pdf', express.static(path.join(__dirname, 'pdf')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/docs", express.static(path.join(__dirname, "docs")));
app.use('/photos', express.static(path.join(__dirname, 'photos')));
app.use('/users', userRoutes);
app.use('/history', historyRoutes);
app.use('/visites', visitesRoutes);
app.use('/', pdfRoutes);
app.use('/chat', chatRoutes(io));
app.use("/notifications", notificationRoutes(io));

import { sendNotification } from "./utils/notifications.js";

io.on("connection", (socket) => {

  socket.on("joinRoom", ({ userId }) => {
    socket.join(`user-${userId}`);
  });

  socket.on("sendMessage", async (data) => {
    const { senderId, receiverId, content } = data;

    io.to(`user-${receiverId}`).emit("receiveMessage", data);
    io.to(`user-${senderId}`).emit("receiveMessage", data);

    await sendNotification({
      prisma,
      io,
      message: `💬 Nouveau message : ${content.slice(0, 40)}...`,
      target: receiverId.toString(),
      type: "message",
      senderId: senderId,
    });
  });

  socket.on("messageRead", ({ senderId, receiverId }) => {
    io.to(`user-${senderId}`).emit("messageRead", { senderId, receiverId });
  });

  socket.on("disconnect", () => {
    
  });

});

server.listen(5000, '0.0.0.0', () => {
  console.log("Serveur allumé");
});

app.get("/notifications", async (req, res) => {
  const target = req.query.target;

  const notifs = await prisma.notification.findMany({
    where: { target },
    orderBy: { timestamp: 'desc' },
    take: 20
  });

  res.json(notifs);
});
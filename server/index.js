import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client";
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
import fs from 'fs';

dotenv.config();

const persistentDirs = [
  "/mnt/data/uploads",
  "/mnt/data/pdf",
  "/mnt/data/docs",
  "/mnt/data/photos",
];

persistentDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log("📁 Dossier créé :", dir);
  }
});

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

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('/mnt/data/uploads'));
app.use('/pdf', express.static('/mnt/data/pdf'));
app.use('/docs', express.static('/mnt/data/docs'));
app.use('/photos', express.static('/mnt/data/photos'));
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur (avec Socket.io) lancé sur le port ${PORT}`);
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
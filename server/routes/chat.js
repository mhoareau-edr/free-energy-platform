import express from "express";
import { PrismaClient } from "@prisma/client";

const chatRouter = (io) => {
  const router = express.Router();

  const prisma = new PrismaClient();

  router.get("/messages", async (req, res) => {
    const { senderId, receiverId } = req.query;

    try {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: Number(senderId), receiverId: Number(receiverId) },
            { senderId: Number(receiverId), receiverId: Number(senderId) },
          ],
        },
        orderBy: { createdAt: "asc" },
      });

      await prisma.message.updateMany({
        where: {
          senderId: Number(receiverId),
          receiverId: Number(senderId),
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });



      res.json(messages);
    } catch (err) {
      console.error("Erreur récupération messages :", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  router.post("/messages", async (req, res) => {
    const { senderId, receiverId, content } = req.body;

    try {
      const newMessage = await prisma.message.create({
        data: { senderId, receiverId, content },
      });

      const sender = await prisma.user.findUnique({
        where: { id: senderId },
      });

      const messageWithSenderName = {
        ...newMessage,
        senderName: sender?.displayName || sender?.name || "Utilisateur",
      };

      res.status(201).json(messageWithSenderName);

      io.to(`user-${receiverId}`).emit("receiveMessage", messageWithSenderName);
      io.to(`user-${senderId}`).emit("receiveMessage", messageWithSenderName);

    } catch (err) {
      console.error("Erreur création message :", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  router.get("/conversations/:userId", async (req, res) => {
    const userId = Number(req.params.userId);

    try {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
        orderBy: { createdAt: "desc" },
      });

      const uniqueConversations = new Map();

      messages.forEach((msg) => {
        const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        if (!uniqueConversations.has(otherUserId)) {
          uniqueConversations.set(otherUserId, msg);
        }
      });

      const result = await Promise.all([...uniqueConversations.entries()].map(async ([otherUserId, lastMsg]) => {
        const user = await prisma.user.findUnique({ where: { id: otherUserId } });
        return {
          userId: otherUserId,
          userName: user?.displayName || user?.name,
          lastMessage: lastMsg.content,
          lastDate: lastMsg.createdAt,
        };
      }));

      res.json(result);
    } catch (err) {
      console.error("Erreur récupération conversations :", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  router.post("/read", async (req, res) => {
    const { senderId, receiverId } = req.body;

    try {
      await prisma.message.updateMany({
        where: {
          senderId,
          receiverId,
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("Erreur readAt :", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  router.delete("/messages/:id", async (req, res) => {
  const messageId = parseInt(req.params.id, 10);
  try {
    await prisma.message.delete({ where: { id: messageId } });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erreur suppression message :", error);
    res.status(500).json({ error: "Erreur suppression message" });
  }
});


  return router;
};
export default chatRouter;

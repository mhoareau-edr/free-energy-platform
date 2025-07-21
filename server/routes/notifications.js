import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

export default function notificationRoutes(io) {
    router.post("/", async (req, res) => {
        const { message, type, target } = req.body;

        try {
            const notif = await prisma.notification.create({
                data: { message, type, target }
            });

            io.emit("new_notification", notif);

            res.status(201).json(notif);
        } catch (err) {
            console.error("Erreur création notification:", err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    });

    router.get("/", async (req, res) => {
        const { target } = req.query;

        try {
            const notifs = await prisma.notification.findMany({
                where: { target },
                orderBy: { timestamp: "desc" },
                take: 20
            });

            res.json(notifs);
        } catch (err) {
            console.error("Erreur lecture notifs:", err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    });

    router.put("/:id/read", async (req, res) => {
        const { id } = req.params;

        try {
            const notif = await prisma.notification.findUnique({
                where: { id: req.params.id }
            });

            if (!notif) {
                return res.status(404).json({ error: "Notification introuvable" });
            }
            await prisma.notification.update({
                where: { id: req.params.id },
                data: { seen: true },
            });

            res.json(notif);
        } catch (err) {
            console.error("Erreur update notif:", err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    });

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.delete({
      where: { id },
    });
    res.status(204).end();
  } catch (err) {
    console.error("Erreur suppression notif:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


    return router;
}

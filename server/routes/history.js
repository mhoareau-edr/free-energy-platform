import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  const { action, icon, user, visiteId } = req.body;
  try {
    const history = await prisma.history.create({
      data: {
        action,
        icon,
        user,
        visite: visiteId ? { connect: { id: parseInt(visiteId) } } : undefined,
        date: new Date()
      }
    });
    res.status(201).json(history);
  } catch (error) {
    console.error("Erreur création historique :", error);
    res.status(500).json({ error: "Erreur lors de la création de l'activité." });
  }
});

router.get("/", async (req, res) => {
  try {
    const histories = await prisma.history.findMany({
      orderBy: { date: "desc" },
      include: { visite: true }
    });
    res.json(histories);
  } catch (error) {
    console.error("Erreur récupération historique :", error);
    res.status(500).json({ error: "Erreur lors de la récupération des activités." });
  }
});

export default router;

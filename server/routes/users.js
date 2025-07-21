import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        displayName: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error("Erreur API /users :", error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { name, email, password, role, displayName } = req.body;

  try {
    const newUser = await prisma.user.create({
      data: { name, email, password, role, displayName },
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, email, password, role, displayName } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { name, email, password, role, displayName },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/by-name", async (req, res) => {
  const { name } = req.query;

  try {
    const user = await prisma.user.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive"
        }
      }
    });

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.json(user);
  } catch (error) {
    console.error("Erreur recherche utilisateur :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


export default router;

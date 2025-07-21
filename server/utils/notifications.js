import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Enregistre une notification en base et la diffuse via Socket.IO
 * @param {Server} io - L'instance Socket.IO
 * @param {{ message: string, type: string, target: string }} data - Données de la notification
 */
export async function sendNotification({ prisma, io, message, target, type = "info" }) {
  try {
    const newNotif = await prisma.notification.create({
      data: {
        message,
        target,
        type,
        seen: false
      }
    });

    io.to(`user-${target}`).emit("new_notification", newNotif);
  } catch (err) {
    console.error("Erreur lors de la création de la notification :", err);
  }
}

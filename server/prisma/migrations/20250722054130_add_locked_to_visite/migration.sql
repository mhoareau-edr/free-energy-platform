-- AlterTable
ALTER TABLE "Visite" ADD COLUMN     "client_b2b" BOOLEAN DEFAULT false,
ADD COLUMN     "client_b2c" BOOLEAN DEFAULT false,
ADD COLUMN     "date_raccordement" TIMESTAMP(3),
ADD COLUMN     "locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "techniciens_recommandes" INTEGER;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

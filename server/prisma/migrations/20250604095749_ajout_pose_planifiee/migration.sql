/*
  Warnings:

  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Visite" ADD COLUMN     "pose_planifiee" TIMESTAMP(3);

-- DropTable
DROP TABLE "Message";

/*
  Warnings:

  - You are about to drop the column `pose_planifiee` on the `Visite` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Visite" DROP COLUMN "pose_planifiee",
ADD COLUMN     "date_debut_pose" TIMESTAMP(3),
ADD COLUMN     "date_fin_pose" TIMESTAMP(3);

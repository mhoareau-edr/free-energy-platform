/*
  Warnings:

  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Commentaire` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_visiteId_fkey";

-- DropForeignKey
ALTER TABLE "Commentaire" DROP CONSTRAINT "Commentaire_visiteId_fkey";

-- DropTable
DROP TABLE "Activity";

-- DropTable
DROP TABLE "Commentaire";

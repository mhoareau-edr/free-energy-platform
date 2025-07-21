/*
  Warnings:

  - You are about to drop the column `Mail` on the `Visite` table. All the data in the column will be lost.
  - You are about to drop the column `Téléphone` on the `Visite` table. All the data in the column will be lost.
  - You are about to drop the column `nomSite` on the `Visite` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Visite" DROP COLUMN "Mail",
DROP COLUMN "Téléphone",
DROP COLUMN "nomSite";

/*
  Warnings:

  - You are about to drop the column `filePath` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Document` table. All the data in the column will be lost.
  - Added the required column `chemin` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "filePath",
DROP COLUMN "name",
ADD COLUMN     "chemin" TEXT NOT NULL,
ADD COLUMN     "nom" TEXT NOT NULL;

/*
  Warnings:

  - You are about to drop the column `chemin` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `nom` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedAt` on the `Document` table. All the data in the column will be lost.
  - Added the required column `name` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "chemin",
DROP COLUMN "nom",
DROP COLUMN "uploadedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "filePath" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

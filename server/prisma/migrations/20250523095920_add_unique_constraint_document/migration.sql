/*
  Warnings:

  - A unique constraint covering the columns `[visiteId,nom]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Document_visiteId_nom_key" ON "Document"("visiteId", "nom");

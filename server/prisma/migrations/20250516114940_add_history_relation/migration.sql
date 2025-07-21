/*
  Warnings:

  - The `date` column on the `History` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "History" ADD COLUMN     "visiteId" INTEGER,
DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_visiteId_fkey" FOREIGN KEY ("visiteId") REFERENCES "Visite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

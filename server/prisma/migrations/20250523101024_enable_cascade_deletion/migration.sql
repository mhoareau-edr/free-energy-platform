-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_visiteId_fkey";

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_visiteId_fkey" FOREIGN KEY ("visiteId") REFERENCES "Visite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

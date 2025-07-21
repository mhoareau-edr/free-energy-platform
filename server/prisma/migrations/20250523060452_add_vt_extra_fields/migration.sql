-- AlterTable
ALTER TABLE "Visite" ADD COLUMN     "commercial_vt" TEXT,
ADD COLUMN     "non_maintenance" BOOLEAN,
ADD COLUMN     "non_revente" BOOLEAN,
ADD COLUMN     "oui_maintenance" BOOLEAN,
ADD COLUMN     "oui_revente" BOOLEAN,
ADD COLUMN     "stockage_text" TEXT;

-- AlterTable
ALTER TABLE "Visite" ADD COLUMN     "Commentaire2" TEXT,
ADD COLUMN     "Date2" TEXT,
ADD COLUMN     "photos" TEXT[] DEFAULT ARRAY[]::TEXT[];

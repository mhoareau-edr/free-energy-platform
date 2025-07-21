/*
  Warnings:

  - You are about to drop the column `auto_consommation` on the `Visite` table. All the data in the column will be lost.
  - You are about to drop the column `auto_revente` on the `Visite` table. All the data in the column will be lost.
  - You are about to drop the column `borne_a_cocher` on the `Visite` table. All the data in the column will be lost.
  - You are about to drop the column `commentaire_admin` on the `Visite` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Visite` table. All the data in the column will be lost.
  - You are about to drop the column `geo_portail` on the `Visite` table. All the data in the column will be lost.
  - You are about to drop the column `les_photos` on the `Visite` table. All the data in the column will be lost.
  - You are about to drop the column `revente_totale` on the `Visite` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Visite` table. All the data in the column will be lost.
  - You are about to drop the column `type_de_borne` on the `Visite` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Visite" DROP COLUMN "auto_consommation",
DROP COLUMN "auto_revente",
DROP COLUMN "borne_a_cocher",
DROP COLUMN "commentaire_admin",
DROP COLUMN "createdAt",
DROP COLUMN "geo_portail",
DROP COLUMN "les_photos",
DROP COLUMN "revente_totale",
DROP COLUMN "status",
DROP COLUMN "type_de_borne",
ADD COLUMN     "date_vt" TEXT,
ADD COLUMN     "technicien_vt" TEXT,
ALTER COLUMN "adresse_pose" DROP NOT NULL,
ALTER COLUMN "code_postal" DROP NOT NULL,
ALTER COLUMN "Commune" DROP NOT NULL,
ALTER COLUMN "pdfPath" DROP NOT NULL,
ALTER COLUMN "client" DROP NOT NULL,
ALTER COLUMN "demandeur" DROP NOT NULL,
ALTER COLUMN "etape" DROP NOT NULL,
ALTER COLUMN "etape" DROP DEFAULT,
ALTER COLUMN "fonction_interlocuteur" DROP NOT NULL,
ALTER COLUMN "mail_interlocuteur" DROP NOT NULL,
ALTER COLUMN "nom_interlocuteur" DROP NOT NULL,
ALTER COLUMN "tel_interlocuteur" DROP NOT NULL;

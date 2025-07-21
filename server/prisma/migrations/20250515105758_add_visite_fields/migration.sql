-- AlterTable
ALTER TABLE "Visite" ADD COLUMN     "auto_consommation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "auto_revente" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "borne_a_cocher" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "commentaire_admin" TEXT,
ADD COLUMN     "geo_portail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "les_photos" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "puissance_souhaitee" TEXT,
ADD COLUMN     "revente_totale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type_de_borne" TEXT;

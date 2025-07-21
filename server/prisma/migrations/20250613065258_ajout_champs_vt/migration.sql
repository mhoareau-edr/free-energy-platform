-- AlterTable
ALTER TABLE "Visite" ADD COLUMN     "commentaires_connexion_internet" TEXT,
ADD COLUMN     "commentaires_inclinaison" TEXT,
ADD COLUMN     "commentaires_latitude" TEXT,
ADD COLUMN     "commentaires_longitude" TEXT,
ADD COLUMN     "commentaires_orientation" TEXT,
ADD COLUMN     "prise_securisee" TEXT,
ADD COLUMN     "type_abonnement" BOOLEAN,
ADD COLUMN     "type_comptant" BOOLEAN;

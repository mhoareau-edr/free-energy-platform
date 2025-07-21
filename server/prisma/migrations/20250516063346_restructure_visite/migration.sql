/*
  Warnings:

  - You are about to drop the column `nom` on the `Visite` table. All the data in the column will be lost.
  - You are about to drop the column `prenom` on the `Visite` table. All the data in the column will be lost.
  - Added the required column `fonction_interlocuteur` to the `Visite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mail_interlocuteur` to the `Visite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom_interlocuteur` to the `Visite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tel_interlocuteur` to the `Visite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Visite" DROP COLUMN "nom",
DROP COLUMN "prenom",
ADD COLUMN     "etape" TEXT NOT NULL DEFAULT 'Demande de VT',
ADD COLUMN     "fonction_interlocuteur" TEXT NOT NULL,
ADD COLUMN     "mail_interlocuteur" TEXT NOT NULL,
ADD COLUMN     "nom_interlocuteur" TEXT NOT NULL,
ADD COLUMN     "tel_interlocuteur" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "History" (
    "id" SERIAL NOT NULL,
    "user" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visite" (
    "id" SERIAL NOT NULL,
    "nomSite" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "adresse_pose" TEXT NOT NULL,
    "code_postal" TEXT NOT NULL,
    "Commune" TEXT NOT NULL,
    "Téléphone" TEXT NOT NULL,
    "Mail" TEXT NOT NULL,
    "pdfPath" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "demandeur" TEXT NOT NULL,

    CONSTRAINT "Visite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commentaire" (
    "id" SERIAL NOT NULL,
    "auteur" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visiteId" INTEGER NOT NULL,

    CONSTRAINT "Commentaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "visiteId" INTEGER NOT NULL,
    "user" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- AddForeignKey
ALTER TABLE "Commentaire" ADD CONSTRAINT "Commentaire_visiteId_fkey" FOREIGN KEY ("visiteId") REFERENCES "Visite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_visiteId_fkey" FOREIGN KEY ("visiteId") REFERENCES "Visite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

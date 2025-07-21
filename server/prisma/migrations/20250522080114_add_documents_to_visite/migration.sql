-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "chemin" TEXT NOT NULL,
    "visiteId" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_visiteId_fkey" FOREIGN KEY ("visiteId") REFERENCES "Visite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

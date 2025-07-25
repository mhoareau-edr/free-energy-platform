import express from "express";
import multer from "multer";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import fs from "fs";

const router = express.Router();
const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, "..", "uploads");
const storagePhotos = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderPath = path.join("/mnt/data", "photos");
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    cb(null, folderPath);
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const uploadPhotos = multer({ storage: storagePhotos });

const storageDocuments = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempFolder = path.join("/mnt/data", "temp_uploads");
    if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder, { recursive: true });
    cb(null, tempFolder);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});



const uploadDoc = multer({
  storage: storageDocuments,
  fileFilter: function (req, file, cb) {
    const visiteId = req.params?.id || "undefined";

    if (!visiteId || visiteId === "undefined") {
      console.warn("⚠️ visiteId manquant dans fileFilter");
      return cb(null, true);
    }

    const basePath = path.join(UPLOADS_DIR, `visite-${visiteId}`);
    const filePath = path.join(basePath, file.originalname);

    cb(null, true);
  }
});

/* GET ALL VISITES */
router.get("/", async (req, res) => {
  const visites = await prisma.visite.findMany();
  res.json(visites);
});

router.get('/planifiees', async (req, res) => {
  const result = await prisma.visite.findMany({
    where: {
      AND: [
        { date_debut_pose: { not: null } },
        { date_fin_pose: { not: null } }
      ]
    },
    select: {
      id: true,
      client: true,
      nom_interlocuteur: true,
      Commune: true,
      date_debut_pose: true,
      date_fin_pose: true
    }
  });

  res.json(result);
});


/* GET SINGLE VISITE */
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: "ID invalide" });
  }

  try {
    const visite = await prisma.visite.findUnique({
      where: { id },
      select: {
        id: true,
        adresse_pose: true,
        code_postal: true,
        Commune: true,
        nom_interlocuteur: true,
        fonction_interlocuteur: true,
        mail_interlocuteur: true,
        tel_interlocuteur: true,
        puissance_souhaitee: true,
        pdfPath: true,
        type_abonnement: true,
        type_comptant: true,
        data_pdf: true,
        date_debut_pose: true,
        date_fin_pose: true,
        techniciens_recommandes: true,
      }
    });

    if (!visite) {
      return res.status(404).json({ error: "Visite non trouvée" });
    }

    res.json(visite);
  } catch (error) {
    console.error("Erreur récupération visite :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


/* CREATE VISITE */
router.post("/", async (req, res) => {
  const {
    client,
    adresse,
    demandeur,
    pdfPath,
    bonLivraisonPath,
    procesVerbalPath,
    details,
    user,
    type_abonnement,
    type_comptant,
    client_b2b,
    client_b2c
  } = req.body;

  try {
    const newVisite = await prisma.visite.create({
      data: {
        adresse_pose: adresse,
        code_postal: details.code_postal,
        Commune: details.Commune,
        client,
        demandeur,
        nom_interlocuteur: details.nom_interlocuteur,
        fonction_interlocuteur: details.fonction_interlocuteur,
        mail_interlocuteur: details.mail_interlocuteur,
        tel_interlocuteur: details.tel_interlocuteur,
        puissance_souhaitee: details.puissance_souhaitée,
        Date2: null,
        Commentaire2: null,
        photos: [],
        commercial_vt: details.commercial_vt,
        stockage_text: details.stockage_text,
        oui_revente: details.oui_revente,
        non_revente: details.non_revente,
        oui_maintenance: details.oui_maintenance,
        non_maintenance: details.non_maintenance,
        type_abonnement: type_abonnement === true || type_abonnement === "true",
        type_comptant: type_comptant === true || type_comptant === "true",
        client_b2b: client_b2b === true || client_b2b === "true",
        client_b2c: client_b2c === true || client_b2c === "true",
        etape: "Visite Technique"
      }
    });

    const dossierBase = path.join(UPLOADS_DIR, `visite-${newVisite.id}`);

    const dossiers = [
      "1. Pièces Administratives",
      "2. Déclaration admin",
      "2. Déclaration admin/1. Mairie",
      "2. Déclaration admin/2. EDF",
      "2. Déclaration admin/3. Consuel",
      "3. Travaux",
      "4. Livraison",
      "4. Livraison/Photos",
      "5. Photos"
    ];

    dossiers.forEach((relativePath) => {
      const fullPath = path.join(dossierBase, relativePath);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });

    const basePath = path.join("uploads", `visite-${newVisite.id}`, "1. Pièces Administratives");

    const newBonPath = path.join(basePath, "Bon_de_livraison.pdf").replace(/\\/g, "/");
    const newPdfPath = path.join(basePath, "Fiche_Visite_Technique.pdf").replace(/\\/g, "/");
    const newProcesPath = path.join(basePath, "Proces_Verbal_Reception.pdf").replace(/\\/g, "/");


    fs.renameSync(pdfPath, path.join(UPLOADS_DIR, `visite-${newVisite.id}`, "1. Pièces Administratives", "Fiche_Visite_Technique.pdf"));
    fs.renameSync(bonLivraisonPath, path.join(UPLOADS_DIR, `visite-${newVisite.id}`, "1. Pièces Administratives", "Bon_de_livraison.pdf"));
    fs.renameSync(procesVerbalPath, path.join(UPLOADS_DIR, `visite-${newVisite.id}`, "1. Pièces Administratives", "Proces_Verbal_Reception.pdf"));

    console.log("📎 Chemins PDF:", { newPdfPath, newBonPath, newProcesPath });


    await prisma.document.createMany({
      data: [
        {
          nom: "Fiche_Visite_Technique.pdf",
          type: "pdf",
          chemin: newPdfPath,
          path: "/1. Pièces Administratives",
          visiteId: newVisite.id
        },
        {
          nom: "Bon_de_livraison.pdf",
          type: "pdf",
          chemin: newBonPath,
          path: "/1. Pièces Administratives",
          visiteId: newVisite.id
        },
        {
          nom: "Proces_Verbal_Reception.pdf",
          type: "pdf",
          chemin: newProcesPath,
          path: "/1. Pièces Administratives",
          visiteId: newVisite.id
        }
      ]
    });

    await prisma.visite.update({
      where: { id: newVisite.id },
      data: {
        pdfPath: newPdfPath
      }
    });

    await prisma.history.create({
      data: {
        visite: { connect: { id: newVisite.id } },
        user: user || "admin",
        action: `${user || "admin"} a demandé une visite technique pour ${details.nom_interlocuteur}`,
        date: new Date(),
        icon: "FaClipboardList",
        color: "bg-green-500"
      }
    });


    res.status(201).json({
      ...newVisite,
    });

  } catch (error) {
    console.error("Erreur création visite :", error);
    res.status(500).json({ error: "Erreur lors de la création de la visite." });
  }
});

/* DELETE VISITE */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { user } = req.body;

  try {
    const visite = await prisma.visite.findUnique({
      where: { id: parseInt(id) }
    });

    if (!visite) {
      return res.status(404).json({ error: "Visite introuvable" });
    }

    await prisma.history.create({
      data: {
        visite: { connect: { id: visite.id } },
        user: user || "admin",
        action: `${user || "admin"} a supprimé le client ${visite.nom_interlocuteur}`,
        date: new Date(),
        icon: "FaTimesCircle",
        color: "bg-red-500"
      }
    });

    await prisma.visite.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error("Erreur suppression visite :", error);
    res.status(500).json({ error: "Erreur lors de la suppression de la visite." });

  }
});

/* UPDATE PDF */
router.put("/:id/pdf", async (req, res) => {
  const { id } = req.params;
  const { pdfPath, user } = req.body;
  const visite = await prisma.visite.findUnique({
      where: { id: parseInt(id) },
      select: { nom_interlocuteur: true }
    });

  try {
    await prisma.visite.update({
      where: { id: parseInt(id) },
      data: { pdfPath }
    });

    await prisma.document.upsert({
      where: {
        visiteId_nom: {
          visiteId: parseInt(id),
          nom: "Fiche_Visite_Technique.pdf"
        }
      },
      update: {
        chemin: pdfPath,
        updatedAt: new Date(),
        path: "/1. Pièces Administratives"
      },
      create: {
        nom: "Fiche_Visite_Technique.pdf",
        type: "pdf",
        chemin: pdfPath,
        path: "/1. Pièces Administratives",
        visite: { connect: { id: parseInt(id) } }
      }
    });

    await prisma.history.create({
      data: {
        visite: { connect: { id: parseInt(id) } },
        user: user || "admin",
        action: `Mise à jour du PDF de ${visite.nom_interlocuteur}`,
        date: new Date()
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erreur mise à jour PDF :", error);
    res.status(500).json({ error: "Impossible de mettre à jour le PDF." });
  }
});

/* UPDATE TECHNIQUE FIELDS */
router.put("/:id/tech", async (req, res) => {
  const { id } = req.params;
  const {
    Date2,
    Commentaire2,
    user,
    prise_securisee_text,
    commentaires_inclinaison,
    commentaires_orientation,
    commentaires_latitude,
    commentaires_connexion_internet,
    commentaires_longitude
  } = req.body;

  try {
    await prisma.visite.update({
      where: { id: parseInt(id) },
      data: {
        Date2,
        Commentaire2,
        technicien_vt: user || "technicien inconnu",
        date_vt: new Date().toLocaleDateString("fr-FR"),
        prise_securisee_text,
        commentaires_inclinaison,
        commentaires_orientation,
        commentaires_latitude,
        commentaires_connexion_internet,
        commentaires_longitude
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erreur update technique :", error);
    res.status(500).json({ error: "Impossible de mettre à jour les données techniques." });
  }
});


/* UPDATE ÉTAPE */
router.put("/:id/etape", async (req, res) => {
  const { id } = req.params;
  const { etape, user, date_raccordement } = req.body;

  try {
    await prisma.visite.update({
      where: { id: parseInt(id) },
      data: {
        etape,
        ...(date_raccordement && { date_raccordement: new Date(date_raccordement) })
      }
    });

    const visite = await prisma.visite.findUnique({
      where: { id: parseInt(id) }
    });

    const messagesEtapes = {
      "Visite Technique": `Visite technique à faire pour ${visite.nom_interlocuteur}`,
      "DP": `Visite technique validée, en attende de la DP pour ${visite.nom_interlocuteur}`,
      "Demande de DP": `Visite technique validée, en attende de la DP pour ${visite.nom_interlocuteur}`,
      "RAC": `DP validée pour ${visite.nom_interlocuteur}, en attente de la demande de raccordement.`,
      "VAD": `Demande de raccordement validée, en attente de la Validation administrative pour ${visite.nom_interlocuteur}`,
      "Pose": `Validation administrative terminée, pose en cours pour ${visite.nom_interlocuteur}`,
      "Consuel": `Pose terminée, en attente du consuel pour ${visite.nom_interlocuteur}`,
      "EDF": `Consuel validée, en attente de la mise en service d'EDF pour ${visite.nom_interlocuteur}`,
      "Terminé": `Dossier terminé pour ${visite.nom_interlocuteur}`
    };

    const actionMessage = messagesEtapes[etape] || `Changement d'étape vers "${etape}" pour ${visite.nom_interlocuteur}`;

    await prisma.history.create({
      data: {
        visite: { connect: { id: parseInt(id) } },
        user: user || "admin",
        action: actionMessage,
        date: new Date(),
        icon: "FaChartLine",
        color: "bg-blue-500"
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erreur mise à jour de l'étape :", error);
    res.status(500).json({ error: "Impossible de mettre à jour l'étape." });
  }
});

router.put("/:id/permis", async (req, res) => {
  const { id } = req.params;
  const { permisPath, user } = req.body;

  try {
    await prisma.visite.update({
      where: { id: parseInt(id) },
      data: {
        permis_de_construire: permisPath
      }
    });

    const visite = await prisma.visite.findUnique({
      where: { id: parseInt(id) },
      select: { nom_interlocuteur: true }
    });

    await prisma.document.create({
      data: {
        nom: "Permis de Construire",
        type: "pdf",
        chemin: permisPath,
        path: "/2. Déclaration admin/1. Mairie",
        visite: { connect: { id: parseInt(id) } }
      }
    });

    await prisma.history.create({
      data: {
        action: `Permis de construire ajouté pour ${visite.nom_interlocuteur}`,
        icon: "FaFilePdf",
        user: user || "Système",
        visite: { connect: { id: parseInt(id) } }
      }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erreur mise à jour permis :", err);
    res.status(500).json({ error: "Impossible d'enregistrer le permis." });
  }
});

router.put("/:id/data-pdf", async (req, res) => {
  const { id } = req.params;
  const { data_pdf, user } = req.body;
  const visite = await prisma.visite.findUnique({
      where: { id: parseInt(id) },
      select: { nom_interlocuteur: true }
    });

  try {
    await prisma.visite.update({
      where: { id: parseInt(id) },
      data: { data_pdf }
    });

    await prisma.history.create({
      data: {
        visite: { connect: { id: parseInt(id) } },
        user: user || "admin",
        action: `Sauvegarde des données PDF pour ${visite.nom_interlocuteur}`,
        date: new Date()
      }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erreur mise à jour data_pdf :", err);
    res.status(500).json({ error: "Impossible de sauvegarder les données PDF." });
  }
});

/* POST PHOTOS */
router.post("/:id/photos", uploadPhotos.array("photos"), async (req, res) => {
  const { id } = req.params;
  const { user } = req.body;
  const photoPaths = req.files.map(f => `photos/${f.filename}`);

  const livraisonFolder = path.join(UPLOADS_DIR, `visite-${id}`, "4. Livraison", "Photos");
  if (!fs.existsSync(livraisonFolder)) {
    fs.mkdirSync(livraisonFolder, { recursive: true });
  }

  await Promise.all(req.files.map(async (f) => {
    const sourcePath = f.path;
    const destinationPath = path.join(livraisonFolder, f.originalname);

    if (!fs.existsSync(destinationPath)) {
      fs.copyFileSync(sourcePath, destinationPath);
    }

    await prisma.document.upsert({
      where: {
        visiteId_nom: {
          visiteId: parseInt(id),
          nom: f.originalname
        }
      },
      update: {
        chemin: `uploads/visite-${id}/4. Livraison/Photos/${f.originalname}`,
        updatedAt: new Date()
      },
      create: {
        nom: f.originalname,
        type: "image",
        chemin: `uploads/visite-${id}/4. Livraison/Photos/${f.originalname}`,
        path: "/4. Livraison/Photos",
        visite: { connect: { id: parseInt(id) } }
      }
    });
  }));


  try {
    const visite = await prisma.visite.findUnique({ where: { id: parseInt(id) } });
    const existingPhotos = visite.photos || [];

    const newUniquePhotos = photoPaths.filter(p => !existingPhotos.includes(p));

    if (newUniquePhotos.length > 0) {
      await prisma.visite.update({
        where: { id: parseInt(id) },
        data: { photos: [...existingPhotos, ...newUniquePhotos] }
      });
    }

    await prisma.history.create({
      data: {
        visite: { connect: { id: parseInt(id) } },
        user: user || "admin",
        action: `Ajout de ${photoPaths.length} photo(s) pour ${visite.nom_interlocuteur}`,
        date: new Date()
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erreur ajout photo(s) :", error);
    res.status(500).json({ error: "Impossible d'ajouter les photos." });
  }
});

/* POST DOCUMENTS */
router.post("/:id/documents", uploadDoc.single("file"), async (req, res) => {
  const { id } = req.params;
  const subpath = req.body.path || "/";
  const cleanSubpath = subpath.replace(/^\/+/, "").replace(/\/+$/, "");
  console.log("📁 Subpath reçu :", req.body.path);


  if (!req.file) {
    console.error("❌ Aucun fichier reçu. Body :", req.body);
    return res.status(400).json({ error: "Fichier manquant" });
  }

  const extension = path.extname(req.file.originalname).toLowerCase();
  const nomFinal = req.body.nom || req.file.originalname;
  const chemin = path.join("uploads", `visite-${id}`, cleanSubpath, nomFinal).replace(/\\/g, "/");
  console.log("📤 Fichier reçu :", req.file.originalname);
  console.log("➡️  Destination finale : ", chemin);

  const tempPath = req.file.path; // Fichier temporaire
  const absPath = path.join("/mnt/data", chemin);

// Créer le dossier cible si nécessaire
const destinationFolder = path.dirname(absPath);
if (!fs.existsSync(destinationFolder)) fs.mkdirSync(destinationFolder, { recursive: true });

// Déplacer le fichier
fs.renameSync(tempPath, absPath);


  const type = extension === ".pdf"
    ? "pdf"
    : extension === ".docx"
      ? "word"
      : extension === ".xlsx"
        ? "excel"
        : [".jpg", ".jpeg", ".png", ".webp"].includes(extension)
          ? "image"
          : "autre";

  try {
    const wrongPath = path.join(UPLOADS_DIR, `visite-${id}`, nomFinal);
    if (fs.existsSync(wrongPath)) {
      fs.unlinkSync(wrongPath);
    }

    await prisma.document.deleteMany({
      where: {
        visiteId: parseInt(id),
        nom: nomFinal,
        path: "/" + cleanSubpath
      }
    });

    const doc = await prisma.document.create({
      data: {
        nom: nomFinal,
        chemin,
        type,
        path: "/" + cleanSubpath,
        visite: { connect: { id: parseInt(id) } }
      }
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error("❌ Erreur enregistrement document :", err.message, err.stack);
    res.status(500).json({ error: "Erreur enregistrement document." });
  }
});

router.get("/:id/documents", async (req, res) => {
  const { id } = req.params;
  const subpath = req.query.path || "/";
  const basePath = path.join(UPLOADS_DIR, `visite-${id}`, subpath);

  try {
    const docsInDB = await prisma.document.findMany({
      where: {
        visiteId: parseInt(id),
        path: subpath
      },
      orderBy: { id: "desc" }
    });

    const nomsEnBase = docsInDB.map(d => d.nom);

    const filesInFS = fs.existsSync(basePath)
      ? fs.readdirSync(basePath, { withFileTypes: true }).map(entry => {
        const chemin = `uploads/visite-${id}/${subpath}${entry.name}`;
        return {
          nom: entry.name,
          chemin,
          type: entry.isDirectory() ? "folder" : getFileType(entry.name)
        };
      }).filter(file => !nomsEnBase.includes(file.nom))
      : [];

    const allItems = [...docsInDB, ...filesInFS];

    allItems.sort((a, b) => {
      if (a.type === "folder" && b.type !== "folder") return -1;
      if (a.type !== "folder" && b.type === "folder") return 1;
      return a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' });
    });

    res.json(allItems);
  } catch (err) {
    console.error("Erreur récupération documents :", err);
    res.status(500).json({ error: "Impossible de récupérer les documents." });
  }
});

function getFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if ([".pdf"].includes(ext)) return "pdf";
  if ([".docx"].includes(ext)) return "word";
  if ([".xlsx"].includes(ext)) return "excel";
  if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return "image";
  return "autre";
}

router.get("/:id/documents/all-recursive", async (req, res) => {
  const { id } = req.params;
  const baseFolder = path.join(UPLOADS_DIR, `visite-${id}`);

  function readRecursive(dir, base = "") {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      const relativePath = path.join(base, file);
      if (stat && stat.isDirectory()) {
        results = results.concat(readRecursive(filePath, relativePath));
      } else {
        results.push({ name: file, relativePath });
      }
    });
    return results;
  }

  try {
    const files = readRecursive(baseFolder);
    res.json(files);
  } catch (err) {
    console.error("Erreur récursive :", err);
    res.status(500).json({ error: "Impossible de récupérer les fichiers." });
  }
});

router.get("/:id/documents/full-tree", async (req, res) => {
  const { id } = req.params;
  const baseFolder = path.join(UPLOADS_DIR, `visite-${id}`);

  function listRecursive(dir, relative = "") {
    let results = [];

    if (!fs.existsSync(dir)) return results;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    entries.forEach((entry) => {
      const relPath = path.join(relative, entry.name);
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        results.push({ type: "folder", relativePath: relPath });
        results = results.concat(listRecursive(fullPath, relPath));
      } else {
        results.push({ type: "file", relativePath: relPath });
      }
    });

    return results;
  }

  try {
    const items = listRecursive(baseFolder);
    res.json(items);
  } catch (err) {
    console.error("❌ Erreur lors de la lecture récursive :", err);
    res.status(500).json({ error: "Impossible de lister les fichiers." });
  }
});


router.delete("/:id/documents", async (req, res) => {
  const { chemin } = req.body;

  try {
    const fullPath = path.join("/mnt/data", chemin);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true });
      } else {
        fs.unlinkSync(fullPath);
      }
    }

    await prisma.document.deleteMany({
      where: { chemin }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erreur suppression document :", err);
    res.status(500).json({ error: "Impossible de supprimer le fichier." });
  }
});

router.put("/:id/documents/move", async (req, res) => {
  const { id } = req.params;
  const { oldPath, newFolder, nom } = req.body;

  const oldAbs = path.join("/mnt/data", oldPath);
  const newAbs = path.join(UPLOADS_DIR, `visite-${id}`, newFolder, nom);

  try {
    fs.renameSync(oldAbs, newAbs);

    await prisma.document.updateMany({
      where: { chemin: oldPath },
      data: {
        chemin: `uploads/visite-${id}/${newFolder}${nom}`,
        path: `/${newFolder}`
      }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erreur déplacement :", err);
    res.status(500).json({ error: "Déplacement échoué." });
  }
});

router.post("/:id/documents/folder", async (req, res) => {
  const { id } = req.params;
  const { path, name } = req.body;
  const pathModule = await import("path");
  const fullPath = pathModule.join(UPLOADS_DIR, `visite-${id}`, path, name);

  try {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log("✅ Dossier créé :", fullPath);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Erreur création dossier :", err);
    res.status(500).json({ error: "Impossible de créer le dossier" });
  }
});

router.put("/:id/documents/rename", async (req, res) => {
  const { id } = req.params;
  const { oldPath, newName } = req.body;

  if (!oldPath || !newName) {
    return res.status(400).json({ error: "Chemin ou nouveau nom manquant" });
  }

  const oldAbs = path.join("/mnt/data", oldPath);
  const dirPath = path.dirname(oldAbs);
  const newAbs = path.join(dirPath, newName);
  const newChemin = `uploads/visite-${id}/${path.relative(path.join(UPLOADS_DIR, `visite-${id}`), newAbs)}`;

  try {
    if (!fs.existsSync(oldAbs)) {
      return res.status(404).json({ error: "Fichier ou dossier introuvable" });
    }

    fs.renameSync(oldAbs, newAbs);

    const updated = await prisma.document.updateMany({
      where: { chemin: oldPath },
      data: {
        chemin: newChemin,
        nom: newName
      }
    });

    res.status(200).json({ success: true, updated });
  } catch (err) {
    console.error("Erreur renommage :", err);
    res.status(500).json({ error: "Échec du renommage" });
  }
});

router.put("/:id/planifier-pose", async (req, res) => {
  const { id } = req.params;
  const { date_debut_pose, date_fin_pose, heure, user, techniciens_recommandes } = req.body;

  try {
    const start = new Date(date_debut_pose);
    const end = new Date(date_fin_pose);

    const visite = await prisma.visite.findUnique({
      where: { id: parseInt(id) },
      select: { nom_interlocuteur: true }
    });

    const updated = await prisma.visite.update({
      where: { id: parseInt(id) },
      data: {
        date_debut_pose: start,
        date_fin_pose: end,
        techniciens_recommandes: parseInt(techniciens_recommandes),
        history: {
          create: {
            action: `Pose planifiée du ${start.toLocaleDateString("fr-FR")} au ${end.toLocaleDateString("fr-FR")} pour ${visite.nom_interlocuteur}`,
            icon: "FaClipboardList",
            user: user || "admin"
          }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    console.error("Erreur lors de la planification :", error);
    res.status(500).json({ error: "Erreur planification pose" });
  }
});

router.put("/:id/lock", async (req, res) => {
  const { id } = req.params;
  const { locked } = req.body;

  try {
    await prisma.visite.update({
      where: { id: parseInt(id) },
      data: { locked: Boolean(locked) }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erreur verrouillage :", err);
    res.status(500).json({ error: "Erreur lors du verrouillage du dossier." });
  }
});

router.put("/:id/brouillon-tech", async (req, res) => {
  const { id } = req.params;
  const { data, user } = req.body;

  try {
    await prisma.visite.update({
      where: { id: parseInt(id) },
      data: {
        data_pdf: data
      }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erreur brouillon-tech :", err);
    res.status(500).json({ error: "Impossible d'enregistrer le brouillon" });
  }
});


router.put("/:id/transfer", async (req, res) => {
  const { id } = req.params;
  const { newUser, user } = req.body;

  try {
    const updated = await prisma.visite.update({
      where: { id: parseInt(id) },
      data: {
        technicien_vt: newUser
      }
    });
    const visite = await prisma.visite.findUnique({
      where: { id: parseInt(id) },
      select: { nom_interlocuteur: true }
    });

    await prisma.history.create({
      data: {
        visite: { connect: { id: parseInt(id) } },
        user: user || "admin",
        action: `Le dossier de ${visite.nom_interlocuteur} a été transféré à ${newUser}`,
        date: new Date(),
        icon: "FaUserCircle",
        color: "bg-indigo-500"
      }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erreur transfert dossier :", err);
    res.status(500).json({ error: "Erreur lors du transfert du dossier." });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "Technique" },
      select: { id: true, name: true }
    });
    res.json(users);
  } catch (error) {
    console.error("Erreur récupération utilisateurs :", error);
    res.status(500).json({ error: "Erreur récupération utilisateurs." });
  }
});

router.post("/", async (req, res) => {
  try {
    const notif = await Notification.create(req.body);
    io.emit("new_notification", notif);
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ error: "Erreur création notification" });
  }
});

router.get("/", async (req, res) => {
  const { target } = req.query;
  try {
    const notifs = await Notification.find({ target }).sort({ timestamp: -1 });
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: "Erreur récupération notifications" });
  }
});

router.put("/:id/read", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: "Erreur mise à jour" });
  }
});

export default router;
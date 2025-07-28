import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { fileURLToPath } from 'url';
import express from "express";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const upload = multer();

router.post("/generate-pdf", upload.any(), async (req, res) => {
  try {
    let data;

    if (req.headers["content-type"]?.includes("multipart/form-data")) {
      if (!req.body || !req.body.data) {
        return res.status(400).json({ error: "'data' manquant dans FormData" });
      }

      try {
        data = JSON.parse(req.body.data);

      } catch (err) {
        console.error("Erreur parsing JSON dans FormData :", err);
        return res.status(400).json({ error: "Champ 'data' mal formé" });
      }
    } else {
      data = req.body;
    }

    const pdfPathBase = path.join(__dirname, "..", "assets", "formulaire_vt.pdf");
    const pdfBytes = fs.readFileSync(pdfPathBase);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const textFields = [
      "puissance_souhaitée",
      "adresse_pose",
      "code_postal",
      "Commune",
      "nom_interlocuteur",
      "fonction_interlocuteur",
      "mail_interlocuteur",
      "tel_interlocuteur",
      "prise_securisee_text",
      "commentaires_inclinaison",
      "commentaires_orientation",
      "commentaires_latitude",
      "commentaires_longitude",
      "commentaires_connexion_internet",
      "autre_toiture_texte",
      "autre_couverture_texte",
      "age_couverture_texte",
      "age_vis_texte",
      "type_de_vis",
      "autre_charpente_texte",
      "age_etat_charpente_texte",
      "entraxe_de_pannes",
      "commentaires_technique",
      "technicien_vt",
      "commercial_vt",
      "stockage_text",
      "date_de_la_demande",
      "superficie_terrain",
      "ref_cadastrale",
      "connaissance_zone_particuliere",
      "surface_hors_oeuvre"
    ];



    textFields.forEach(name => {
      if (data[name]) form.getTextField(name)?.setText(data[name]);
    });

    const singleChoiceFields = {
      zone_ombre: ["oui_ombre", "non_ombre"],
      accessibilite: ["oui_accessible", "non_accessible"],
      compteur: ["compteur_limite_propriete", "compteur_interieur_batiment"],
      disjoncteur: ["disjoncteur_limite_propriete", "disjoncteur_interieur_batiment"],
      arrivee_edf: ["edf_aerienne", "edf_aero_souterrain", "edf_souterrain"]
    };

    for (const field in singleChoiceFields) {
      const options = singleChoiceFields[field];
      options.forEach(opt => {
        if (data[field] === opt) {
          try {
            form.getCheckBox(opt).check();
          } catch (e) {
            try {
              form.getRadioGroup(field).select(opt);
            } catch (err) {
              console.warn(`Champ introuvable : ${field} ou ${opt}`);
            }
          }
        }
      });
    }

    if (data.commercial_vt) form.getTextField("commercial_vt")?.setText(data.commercial_vt);
    if (data.stockage_text) form.getTextField("stockage_text")?.setText(data.stockage_text);

    if (data.oui_revente) form.getCheckBox("oui_revente")?.check();
    if (data.non_revente) form.getCheckBox("non_revente")?.check();
    if (data.oui_maintenance) form.getCheckBox("oui_maintenance")?.check();
    if (data.non_maintenance) form.getCheckBox("non_maintenance")?.check();
    form.getTextField("date_de_la_demande").setText(data.date_de_la_demande || "");

    if (data.type_abonnement) form.getCheckBox("type_abonnement")?.check();
    if (data.type_comptant) form.getCheckBox("type_comptant")?.check();


    const allCheckboxes = [
      "mono_pente", "bi_pente", "autre_toiture",
      "tole_ondulee", "couverture_nervuree", "autre_couverture",
      "bon_etat_couverture", "moyen_etat_couverture", "age_etat_couverture",
      "bon_etat_vis", "moyen_etat_vis", "age_etat_vis",
      "charpente_metallique", "charpente_bois", "autre_charpente",
      "bon_etat_charpente", "moyen_etat_charpente", "age_etat_charpente",

      "compteur_limite_propriete", "compteur_interieur_batiment",
      "disjoncteur_limite_propriete", "disjoncteur_interieur_batiment",
      "edf_aerienne", "edf_aero_souterrain", "edf_souterrain",

      "photo_facades", "photos_batiment", "photos_toiture",
      "photo_situer_environnement_proche", "photo_situer_paysage_lointain",
      "photo_compteur_disjoncteur", "photo_local_onduleur_retenu",
      "photo_toiture_retenue", "cheminement_retenu",

      "oui_titulaire",
      "non_titulaire",

      "type_batiment_residence_principale",
      "type_batiment_bureau",
      "type_batiment_entrepot",

      "plan_cadastral",
      "plan_de_masse",
      "plan_de_toiture",
      "plan_vue_coupe_elevation_batiment",

      "oui_revente", "non_revente",
      "oui_maintenance", "non_maintenance",
      "type_abonnement", "type_comptant"
    ];

    allCheckboxes.forEach(key => {
      if (Array.isArray(data[key]) && data[key].includes(key)) {
        form.getCheckBox(key).check();
      } else if (data[key] === true || data.photos?.includes(key)) {
        form.getCheckBox(key).check();
      }
    });

    form.flatten();

    const docsDir = path.join("/mnt/data/docs");
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }


    const pdfBytesUpdated = await pdfDoc.save();

    const fileName = `vt-${data.id || "temp"}.pdf`;

    const outputPath = data.outputPath
      ? path.join("/mnt/data", data.outputPath)
      : path.join("/mnt/data/pdf", fileName);

    const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
    fs.writeFileSync(outputPath, pdfBytesUpdated);

    let permisFilePath = null;

    if (req.files && req.files.length > 0) {
      const permisFile = req.files.find(f => f.fieldname === "file");
      if (permisFile) {
        const extension = path.extname(permisFile.originalname);
        const permisFileName = `permis_${Date.now()}${extension}`;
        const fullPath = path.join("/mnt/data/docs", permisFileName);
        fs.writeFileSync(fullPath, permisFile.buffer);
        permisFilePath = `docs/${permisFileName}`;
      }
    }

    async function generateAndSavePDF(inputPath, outputName, dataToFill, fieldNames = []) {
      const pdfBytes = fs.readFileSync(inputPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      fieldNames.forEach(field => {
        if (dataToFill[field]) {
          try {
            form.getTextField(field).setText(dataToFill[field]);
          } catch (e) {
            console.warn(`Champ manquant dans ${outputName}: ${field}`);
          }
        }
      });

      form.flatten();

      const filePath = path.join("/mnt/data/pdf", outputName);
      fs.writeFileSync(filePath, await pdfDoc.save());

      return `pdf/${outputName}`;
    }

    const dataCommon = {
      nom_interlocuteur: data.nom_interlocuteur,
      adresse_pose: data.adresse_pose,
      code_postal: data.code_postal,
      Commune: data.Commune,
      tel_interlocuteur: data.tel_interlocuteur,
      mail_interlocuteur: data.mail_interlocuteur,
      date_de_la_demande: data.date_de_la_demande,
      technicien_vt: data.technicien_vt || "Technicien inconnu"
    };

    const bonLivraisonPath = await generateAndSavePDF(
      path.join(__dirname, "..", "assets", "bon_de_livraison_vt.pdf"),
      `bon-livraison-${data.id || "temp"}.pdf`,
      dataCommon,
      ["nom_interlocuteur", "adresse_pose", "code_postal", "Commune", "tel_interlocuteur", "mail_interlocuteur"]
    );

    const procesVerbalPath = await generateAndSavePDF(
      path.join(__dirname, "..", "assets", "proces_verbal_reception_vt.pdf"),
      `proces-verbal-${data.id || "temp"}.pdf`,
      dataCommon,
      ["technicien_vt", "date_de_la_demande", "nom_interlocuteur", "adresse_pose", "tel_interlocuteur"]
    );

    res.status(200).json({
      pdfPath: data.outputPath || `pdf/${fileName}`,
      bonLivraisonPath,
      procesVerbalPath,
      permisPath: permisFilePath
    });

   console.log("✅ Champs techniques :", {
      inclinaison: data.commentaires_inclinaison,
      orientation: data.commentaires_orientation,
      latitude: data.commentaires_latitude,
      connexion: data.commentaires_connexion_internet
    });

    console.log("🧾 Champs disponibles dans le PDF :");
    form.getFields().forEach(f => console.log(" -", f.getName()));


  } catch (error) {
    console.error("Erreur génération PDF :", error);
    res.status(500).json({ error: "Erreur génération PDF" });
  }
});

export default router;
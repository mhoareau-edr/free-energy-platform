import { useState } from "react";
import toast from "react-hot-toast";
import { useEffect } from "react";

export default function FormulaireTechnique({ visite, onSaved, user }) {
  const [formData, setFormData] = useState({
    type_toiture: [],
    autre_toiture_texte: "",
    type_couverture: [],
    autre_couverture_texte: "",
    etat_couverture: [],
    age_couverture_texte: "",
    etat_vis: [],
    age_vis_texte: "",
    type_de_vis: "",
    type_charpente: [],
    autre_charpente_texte: "",
    etat_charpente: [],
    age_etat_charpente_texte: "",
    entraxe_de_pannes: "",
    zone_ombre: "",
    accessibilite: "",
    compteur: "",
    disjoncteur: "",
    arrivee_edf: "",
    photos: [],
    commentaires_technique: "",
    prise_securisee_text: ""
  });

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
  if (visite?.data_pdf) {
    setFormData((prev) => ({
      ...prev,
      ...visite.data_pdf
    }));
  }
}, [visite]);

  const [section, setSection] = useState(1);

  const toggleCheckbox = (name, value) => {
    const list = formData[name];
    setFormData({
      ...formData,
      [name]: list.includes(value)
        ? list.filter(v => v !== value)
        : [...list, value]
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => {
      const current = prev.photos;
      return {
        ...prev,
        photos: checked ? [...current, name] : current.filter(p => p !== name)
      };
    });
  };

  function buildPdfPayload(formData, visite) {
    const transformed = {
      ...visite,
      id: visite.id,
      puissance_souhaitée: visite.puissance_souhaitee || "",
      date_de_la_demande: new Date(visite.createdAt).toLocaleDateString("fr-FR"),
      adresse_pose: visite.adresse_pose || "",
      code_postal: visite.code_postal || "",
      Commune: visite.Commune || "",
      nom_interlocuteur: visite.nom_interlocuteur || "",
      fonction_interlocuteur: visite.fonction_interlocuteur || "",
      mail_interlocuteur: visite.mail_interlocuteur || "",
      tel_interlocuteur: visite.tel_interlocuteur || "",
      technicien_vt: user?.name || "Technicien inconnu",
      autre_toiture_texte: formData.autre_toiture_texte,
      autre_couverture_texte: formData.autre_couverture_texte,
      age_couverture_texte: formData.age_couverture_texte,
      age_vis_texte: formData.age_vis_texte,
      type_de_vis: formData.type_de_vis,
      autre_charpente_texte: formData.autre_charpente_texte,
      age_etat_charpente_texte: formData.age_etat_charpente_texte,
      entraxe_de_pannes: formData.entraxe_de_pannes,
      zone_ombre: formData.zone_ombre === "oui" ? "oui_ombre" : "non_ombre",
      accessibilite: formData.accessibilite === "oui" ? "oui_accessible" : "non_accessible",
      compteur: formData.compteur,
      disjoncteur: formData.disjoncteur,
      arrivee_edf: formData.arrivee_edf,
      photos: formData.photos,
      commentaires_technique: formData.commentaires_technique,
      commentaires_inclinaison: formData.commentaires_inclinaison,
      commentaires_orientation: formData.commentaires_orientation,
      commentaires_latitude: formData.commentaires_latitude,
      commentaires_connexion_internet: formData.commentaires_connexion_internet,
      commentaires_longitude: formData.commentaires_longitude,

      type_abonnement:
        (visite.type_abonnement === true || visite.type_abonnement === "true") ||
        (visite.data_pdf?.type_abonnement === true || visite.data_pdf?.type_abonnement === "true") || false,

      type_comptant:
        (visite.type_comptant === true || visite.type_comptant === "true") ||
        (visite.data_pdf?.type_comptant === true || visite.data_pdf?.type_comptant === "true") || false,

      prise_securisee_text: formData.prise_securisee_text
    };

    const checkboxGroups = [
      "type_toiture", "type_couverture", "etat_couverture",
      "etat_vis", "type_charpente", "etat_charpente"
    ];

    checkboxGroups.forEach(group => {
      formData[group].forEach(item => {
        transformed[item] = true;
      });
    });
    payload.existingPdfPath = visite.pdfPath;
    return transformed;
  }

  const handleSaveDraft = async () => {
  try {

    const res = await fetch(`${API}/visites/${visite.id}/data-pdf`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: user.name,
        data_pdf: formData
      })
    });

    if (!res.ok) throw new Error("Erreur lors de la sauvegarde du brouillon");

    const resEtape = await fetch(`${API}/visites/${visite.id}/etape`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        etape: "Visite Technique incomplète",
        user: user.name
      })
    });

    if (!resEtape.ok) throw new Error("Erreur lors de la mise à jour de l'étape");

    toast.success("Formulaire sauvegardé");

  } catch (err) {
    console.error(err);
    toast.error("Erreur lors de l'enregistrement partiel");
  }
};



  const handleSubmit = async () => {
    try {
      const resTech = await fetch(`${API}/visites/${visite.id}/tech`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Date2: new Date().toISOString().split("T")[0],
          Commentaire2: formData.commentaires_technique,
          puissance_souhaitee: visite.puissance_souhaitee || "3",
          user: user?.name || "technicien",
          commentaires_inclinaison: formData.commentaires_inclinaison,
          commentaires_orientation: formData.commentaires_orientation,
          commentaires_latitude: formData.commentaires_latitude,
          commentaires_longitude: formData.commentaires_longitude,
          commentaires_connexion_internet: formData.commentaires_connexion_internet
        })
      });

      if (!resTech.ok) throw new Error("Erreur lors de l'enregistrement technique.");
      console.log("DEBUG VISITE TECH", visite);

      const payload = buildPdfPayload(formData, visite);
      payload.outputPath = `visite-${visite.id}/1. Pièces Administratives/Fiche_Visite_Technique.pdf`;

      const resPdf = await fetch(`${API}/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resPdf.ok) throw new Error("Erreur génération PDF");
      const { pdfPath } = await resPdf.json();

      await fetch(`${API}/visites/${visite.id}/pdf`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfPath, user: user?.name || "technicien" })
      });

      await fetch(`${API}/visites/${visite.id}/data-pdf`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: user.name, data_pdf: payload })
      });

      await fetch(`${API}/visites/${visite.id}/etape`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ etape: "DP", user: user.name })
      });

      toast.success("Visite Technique envoyée !");
      if (onSaved) onSaved();

      await fetch(`${API}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `📄 Visite technique réalisée pour ${visite.nom_interlocuteur || "un client"}.`,
          type: "system",
          target: "Administratif",
          senderId: user.id,
          senderName: user.name,
        }),
      });

    } catch (err) {
      console.error(err);
      toast.error("Une erreur s'est produite");
    }
  };

  const saveAndNextSection = async () => {
  try {
    await fetch(`${API}/visites/${visite.id}/brouillon-tech`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: formData, user: user.name }),
    });
    setSection(prev => prev + 1);
  } catch (err) {
    console.error("Erreur de sauvegarde avant passage :", err);
    toast.error("Erreur lors de la sauvegarde automatique");
  }
};

  const prevSection = () => setSection(prev => Math.max(prev - 1, 1));

  const renderRadioGroup = (name, options) => (
    <div className="form-options">
      {options.map(opt => (
        <label key={opt.value} className="form-checkbox-inline">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={formData[name] === opt.value}
            onChange={handleChange}
          /> {opt.label}
        </label>
      ))}
    </div>
  );

  const renderOptions = (options, stateKey, inputIf) => (
    <div className="form-options">
      {options.map(opt => (
        <label key={opt.value} className="form-checkbox-inline">
          <input
            type="checkbox"
            checked={formData[stateKey].includes(opt.value)}
            onChange={() => toggleCheckbox(stateKey, opt.value)}
          /> {opt.label}
        </label>
      ))}
      {inputIf && formData[stateKey].includes(inputIf.key) && (
        <input
          className="form-input ml-2"
          name={inputIf.name}
          placeholder={inputIf.placeholder}
          value={formData[inputIf.name]}
          onChange={handleChange}
        />
      )}
    </div>
  );

  return (
    <div className="form-modal w-full max-w-full overflow-y-auto dark:bg-[#1d2125]">
      <div className="flex justify-between items-center mb-4">
        <h2>Formulaire Visite Technique</h2>
        <a
          href={`${API}/uploads/${visite.pdfPath}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pdf-button"
        >
          Voir PDF  
        </a>
      </div>

      {section === 1 && (
        <div className="form-section">
          <h3 className="form-section-title dark:text-white">BÂTIMENT / HABITATION</h3>
          <div className="form-row">
            <label className="form-label dark:text-white">Type de toiture</label>
            {renderOptions([
              { value: "mono_pente", label: "Mono pente" },
              { value: "bi_pente", label: "Bi pente" },
              { value: "autre_toiture", label: "Autre" }
            ], "type_toiture", {
              key: "autre_toiture",
              name: "autre_toiture_texte",
              placeholder: "Précisez"
            })}
          </div>

          <div className="form-row">
            <label className="form-label dark:text-white">Couverture (type)</label>
            {renderOptions([
              { value: "tole_ondulee", label: "Tôle ondulée" },
              { value: "couverture_nervuree", label: "Nervurée" },
              { value: "autre_couverture", label: "Autre" }
            ], "type_couverture", {
              key: "autre_couverture",
              name: "autre_couverture_texte",
              placeholder: "Précisez"
            })}
          </div>

          <div className="form-row">
            <label className="form-label dark:text-white">État couverture</label>
            {renderOptions([
              { value: "bon_etat_couverture", label: "Bon" },
              { value: "moyen_etat_couverture", label: "Moyen" },
              { value: "age_etat_couverture", label: "Vétuste" }
            ], "etat_couverture", {
              key: "age_etat_couverture",
              name: "age_couverture_texte",
              placeholder: "Précisez"
            })}
          </div>

          <div className="form-row">
            <label className="form-label dark:text-white">État des vis</label>
            {renderOptions([
              { value: "bon_etat_vis", label: "Bon" },
              { value: "moyen_etat_vis", label: "Moyen" },
              { value: "age_etat_vis", label: "Vétuste" }
            ], "etat_vis", {
              key: "age_etat_vis",
              name: "age_vis_texte",
              placeholder: "Précisez"
            })}
          </div>

          <div className="form-row">
            <label className="form-label dark:text-white">Type de vis</label>
            <input
              className="form-input"
              name="type_de_vis"
              value={formData.type_de_vis}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label className="form-label dark:text-white">Type de charpente</label>
            {renderOptions([
              { value: "charpente_metallique", label: "Métallique" },
              { value: "charpente_bois", label: "Bois" },
              { value: "autre_charpente", label: "Autre" }
            ], "type_charpente", {
              key: "autre_charpente",
              name: "autre_charpente_texte",
              placeholder: "Précisez"
            })}
          </div>

          <div className="form-row">
            <label className="form-label dark:text-white">État charpente</label>
            {renderOptions([
              { value: "bon_etat_charpente", label: "Bon" },
              { value: "moyen_etat_charpente", label: "Moyen" },
              { value: "age_etat_charpente", label: "Vétuste" }
            ], "etat_charpente", {
              key: "age_etat_charpente",
              name: "age_etat_charpente_texte",
              placeholder: "Précisez"
            })}
          </div>

          <div className="form-row">
            <label className="form-label dark:text-white">Entraxe de pannes</label>
            <input
              className="form-input"
              name="entraxe_de_pannes"
              value={formData.entraxe_de_pannes}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label className="form-label dark:text-white">Zone d'ombre</label>
            {renderRadioGroup("zone_ombre", [
              { value: "oui", label: "Oui" },
              { value: "non", label: "Non" }
            ])}
          </div>

          <div className="form-row">
            <label className="form-label dark:text-white">Accessibilité</label>
            {renderRadioGroup("accessibilite", [
              { value: "oui", label: "Oui" },
              { value: "non", label: "Non" }
            ])}
          </div>
        </div>
      )}

      {section === 2 && (
        <div className="form-section">
          <h3 className="form-section-title dark:text-white">EMPLACEMENTS</h3>
          <div className="form-row">
            <label className="form-label dark:text-white">Compteur</label>
            {renderRadioGroup("compteur", [
              { value: "compteur_limite_propriete", label: "Limite propriété" },
              { value: "compteur_interieur_batiment", label: "Intérieur bâtiment" }
            ])}
          </div>
          <div className="form-row">
            <label className="form-label dark:text-white">Disjoncteur</label>
            {renderRadioGroup("disjoncteur", [
              { value: "disjoncteur_limite_propriete", label: "Limite propriété" },
              { value: "disjoncteur_interieur_batiment", label: "Intérieur bâtiment" }
            ])}
          </div>
          <div className="form-row">
            <label className="form-label dark:text-white">Arrivée EDF</label>
            {renderRadioGroup("arrivee_edf", [
              { value: "edf_aerienne", label: "Aérienne" },
              { value: "edf_aero_souterrain", label: "Aéro-souterrain" },
              { value: "edf_souterrain", label: "Souterrain" }
            ])}
          </div>
        </div>
      )}

      {section === 3 && (
        <div className="form-section">
          <h3 className="form-section-title dark:text-white">PHOTOS</h3>
          <div className="form-row grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {["photo_facades", "photos_batiment", "photos_toiture", "photo_situer_environnement_proche", "photo_situer_paysage_lointain", "photo_compteur_disjoncteur", "photo_local_onduleur_retenu", "photo_toiture_retenue", "cheminement_retenu"].map(photo => (
              <label key={photo} className="form-checkbox-inline">
                <input
                  type="checkbox"
                  name={photo}
                  checked={formData.photos.includes(photo)}
                  onChange={handlePhotoChange}
                /> {photo.replace(/_/g, ' ')}
              </label>
            ))}
          </div>
        </div>
      )}

      {section === 4 && (
        <div className="form-section">
          <h3 className="form-section-title dark:text-white">COMMENTAIRES TECHNIQUES</h3>

          <div className="form-row">
            <label className="form-label dark:text-white">Prise sécurisée</label>
            <input
              className="form-input"
              name="prise_securisee_text"
              value={formData.prise_securisee_text || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label className="form-label dark:text-white">Inclinaison</label>
            <input
              className="form-input"
              name="commentaires_inclinaison"
              value={formData.commentaires_inclinaison || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label className="form-label dark:text-white">Orientation</label>
            <input
              className="form-input"
              name="commentaires_orientation"
              value={formData.commentaires_orientation || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label className="form-label dark:text-white">Latitude</label>
            <input
              className="form-input"
              name="commentaires_latitude"
              value={formData.commentaires_latitude || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label className="form-label dark:text-white">Longitude</label>
            <input
              className="form-input"
              name="commentaires_longitude"
              value={formData.commentaires_longitude || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label className="form-label dark:text-white">Connexion Internet</label>
            <input
              className="form-input"
              name="commentaires_connexion_internet"
              value={formData.commentaires_connexion_internet || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label className="form-label dark:text-white">Commentaires techniques généraux</label>
            <textarea
              className="form-input w-full"
              rows={6}
              name="commentaires_technique"
              value={formData.commentaires_technique}
              onChange={handleChange}
              placeholder="Ajouter un commentaire technique (facultatif)"
            ></textarea>
          </div>

        </div>
      )}

      <div className="flex justify-between mt-6 gap-4">
        {section > 1 && (
          <button className="primary-button w-full" onClick={prevSection}>
            Revenir à la section précédente
          </button>
        )}
        <button className="primary-button w-full" onClick={handleSaveDraft}>
          Enregistrer pour plus tard
        </button>
        {section < 4 ? (
          <button className="primary-button w-full" onClick={saveAndNextSection}>
            Passer à la section suivante
          </button>
        ) : (
          <button className="primary-button w-full" onClick={handleSubmit}>
            Envoyer la visite technique
          </button>
        )}
      </div>
    </div>
  );
}

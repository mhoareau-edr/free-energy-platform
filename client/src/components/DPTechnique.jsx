import { useState } from "react";
import toast from "react-hot-toast";

export default function DPTechnique({ visite, onSaved, user }) {
  const isTechnicien = user?.role?.toLowerCase() === "technique";
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    superficie_terrain: "",
    ref_cadastrale: "",
    connaissance_zone_particuliere: "",
    titulaire_certificat: [],
    permis_de_construire: null,
    type_batiment: [],
    surface_hors_oeuvre: "",
    plans: []
  });

  const handleCheckbox = (name, value) => {
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, permis_de_construire: file });
  };

  const handleSubmitDP = async () => {
    let pdfPath = null;
    let permisPath = null;

    try {
      const payload = {
        superficie_terrain: formData.superficie_terrain,
        ref_cadastrale: formData.ref_cadastrale,
        connaissance_zone_particuliere: formData.connaissance_zone_particuliere,
        surface_hors_oeuvre: formData.surface_hors_oeuvre,
        user: user.name,
        ...Object.fromEntries(formData.titulaire_certificat.map(key => [key, true])),
        ...Object.fromEntries(formData.type_batiment.map(key => [key, true])),
        ...Object.fromEntries(formData.plans.map(key => [key, true]))
      };

      const oldRes = await fetch(`http://10.10.2.106:5000/visites/${visite.id}`);
      const oldData = await oldRes.json();
      const merged = {
        ...((oldData?.data_pdf && typeof oldData.data_pdf === "object") ? oldData.data_pdf : {}),
        ...payload,
        puissance_souhaitée: oldData?.data_pdf?.puissance_souhaitée || oldData?.puissance_souhaitee || "",
        photos: oldData?.data_pdf?.photos || [],
        commentaires_technique: oldData?.data_pdf?.commentaires_technique || ""
      };

      const formPayload = new FormData();
      formPayload.append("data", JSON.stringify(merged));
      if (formData.permis_de_construire) {
        formPayload.append("file", formData.permis_de_construire);
      }

      const res = await fetch("http://10.10.2.106:5000/generate-pdf", {
        method: "POST",
        body: formPayload
      });
      if (!res.ok) throw new Error("Erreur génération PDF");

      const result = await res.json();
      pdfPath = result.pdfPath;
      permisPath = result.permisPath;

      await fetch(`http://10.10.2.106:5000/visites/${visite.id}/pdf`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfPath, user: user.name })
      });

      if (permisPath) {
        await fetch(`http://10.10.2.106:5000/visites/${visite.id}/permis`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permisPath, user: user.name })
        });
      }

      await fetch(`http://10.10.2.106:5000/visites/${visite.id}/data-pdf`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: user.name, data_pdf: merged })
      });

      await fetch("http://10.10.2.106:5000/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: `Pièces techniques disponibles pour ${visite.nom_interlocuteur}`,
          icon: "FaClipboardList",
          user: user.name,
          visiteId: visite.id
        })
      });

      await fetch(`http://10.10.2.106:5000/visites/${visite.id}/etape`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ etape: "Demande de DP", user: user.name })
      });


      toast.success("Demande de DP envoyée avec succès !");
      if (typeof onSaved === "function") {
        onSaved();
      }

    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la soumission de la DP");
    }
  };

  return (
    <div className="form-section">
      <h3 className="form-section-title">Formulaire DP - Étape {step}</h3>

      {step === 1 && (
        <div className="space-y-4">
          <label className="block">
            Superficie du terrain
            <input
              type="text"
              name="superficie_terrain"
              className="form-input dark:bg-[#1d2125] dark:border-0"
              value={formData.superficie_terrain}
              onChange={handleChange}
            />
          </label>
          <label className="block">
            Réf. Cadastrale
            <input
              type="text"
              name="ref_cadastrale"
              className="form-input dark:bg-[#1d2125] dark:border-0"
              value={formData.ref_cadastrale}
              onChange={handleChange}
            />
          </label>
          <label className="block">
            Connaissance d'une zone particulière (classée...)
            <input
              type="text"
              name="connaissance_zone_particuliere"
              className="form-input dark:bg-[#1d2125] dark:border-0"
              value={formData.connaissance_zone_particuliere}
              onChange={handleChange}
            />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm font-medium">Êtes-vous titulaire d'un certificat d'urbanisme pour ce terrain ?</p>
          <label className="form-checkbox-inline">
            <input
              type="checkbox"
              onChange={() => handleCheckbox("titulaire_certificat", "oui_titulaire")}
              checked={formData.titulaire_certificat.includes("oui_titulaire")}
            /> Oui
          </label>
          <label className="form-checkbox-inline">
            <input
              type="checkbox"
              onChange={() => handleCheckbox("titulaire_certificat", "non_titulaire")}
              checked={formData.titulaire_certificat.includes("non_titulaire")}
            /> Non
          </label>
          <div>
            <label className="block text-sm font-medium mb-1">Joindre le permis de construire :</label>
            <input type="file" onChange={handleFileChange} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm font-medium">Votre type de bâtiment :</p>
          <label className="form-checkbox-inline">
            <input
              type="checkbox"
              onChange={() => handleCheckbox("type_batiment", "type_batiment_residence_principale")}
              checked={formData.type_batiment.includes("type_batiment_residence_principale")}
            /> Résidence principale
          </label>
          <label className="form-checkbox-inline">
            <input
              type="checkbox"
              onChange={() => handleCheckbox("type_batiment", "type_batiment_bureau")}
              checked={formData.type_batiment.includes("type_batiment_bureau")}
            /> Bureau
          </label>
          <label className="form-checkbox-inline">
            <input
              type="checkbox"
              onChange={() => handleCheckbox("type_batiment", "type_batiment_entrepot")}
              checked={formData.type_batiment.includes("type_batiment_entrepot")}
            /> Entrepôt
          </label>
          <label className="block">
            Surface hors oeuvre nette (SHON) en m²
            <input
              type="text"
              name="surface_hors_oeuvre"
              className="form-input dark:bg-[#1d2125] dark:border-0"
              value={formData.surface_hors_oeuvre}
              onChange={handleChange}
            />
          </label>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <p className="text-sm font-medium">Plans :</p>
          {[
            "plan_cadastral",
            "plan_de_masse",
            "plan_de_toiture",
            "plan_vue_coupe_elevation_batiment"
          ].map((plan) => (
            <label key={plan} className="form-checkbox-inline">
              <input
                type="checkbox"
                onChange={() => handleCheckbox("plans", plan)}
                checked={formData.plans.includes(plan)}
              /> {plan.replace(/_/g, " ")}
            </label>
          ))}
        </div>
      )}


      <div className="flex justify-between gap-4 mt-6">
        {step > 1 && (
          <button className="primary-button w-full" onClick={() => setStep(step - 1)}>
            Étape précédente
          </button>
        )}
        {step < 4 ? (
          <button className="primary-button w-full" onClick={() => setStep(step + 1)}>
            Étape suivante
          </button>
        ) : (
          <button className="primary-button w-full" onClick={handleSubmitDP}>Envoyer la demande de DP</button>
        )}
      </div>
    </div>
  );
}

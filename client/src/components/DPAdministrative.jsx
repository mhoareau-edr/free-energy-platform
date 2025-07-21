import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const API_URL = "http://10.10.2.106:5000";

export default function DPAdministrative({ visite, user, onUpdated }) {
  const [numeroDP, setNumeroDP] = useState("");
  const [statut, setStatut] = useState("");
  const [recipisseFile, setRecipisseFile] = useState(null);
  const [dateDP, setDateDP] = useState("");
  const [documentsManquants, setDocumentsManquants] = useState("");

  const handleRecipisseUpload = async () => {
    if (!recipisseFile) return;
    const formData = new FormData();
    formData.append("file", recipisseFile);
    formData.append("path", "2. Déclaration admin/1. Mairie");

    const res = await fetch(`${API_URL}/visites/${visite.id}/documents`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      toast.error("Erreur lors de l'import du récipissé");
      return null;
    }

    toast.success("Récipissé importé avec succès");
    return true;
  };

  const handleValidation = async () => {
    if (!numeroDP.trim()) {
      toast.error("Merci d'entrer le numéro de DP");
      return;
    }

    if (statut === "DP Validée") {
      const success = await handleRecipisseUpload();
      if (!success) return;

      await fetch(`${API_URL}/visites/${visite.id}/etape`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ etape: "RAC", user: user.name })
      });

      toast.success("DP validée");
      await fetch("http://10.10.2.106:5000/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `DP terminée pour ${visite.nom_interlocuteur || "un client"}. En attente de la Demande de Raccordement.`,
          type: "system",
          target: "Administratif",
          senderId: user.id,
          senderName: user.name,
        }),
      });
      onUpdated();
    }
  };

  const handleEnvoyerDocumentsManquants = async () => {
    if (!documentsManquants.trim()) {
      toast.error("Merci d'indiquer les documents manquants");
      return;
    }

    try {

      const resUser = await fetch(`${API_URL}/users/by-name?name=${encodeURIComponent(visite.technicien_vt)}`);
      const userData = await resUser.json();

      if (!resUser.ok || !userData?.id) {
        toast.error("Technicien introuvable");
        return;
      }

      const content = `Documents manquants pour la DP de ${visite.nom_interlocuteur} :\n${documentsManquants}`;

      const resMessage = await fetch(`${API_URL}/chat/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: userData.id,
          content,
        }),
      });

      if (!resMessage.ok) {
        toast.error("Erreur lors de l'envoi du message");
        return;
      }

      // 3. Mettre à jour l'étape
      await fetch(`${API_URL}/visites/${visite.id}/etape`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ etape: "En attente de documents pour la DP", user: user.name }),
      });

      toast.success("Message envoyé au technicien");
      onUpdated();
    } catch (err) {
      console.error("Erreur message DP incomplète :", err);
      toast.error("Erreur lors de l’envoi");
    }
  };

  const handleRecommencer = async () => {
    await fetch(`${API_URL}/visites/${visite.id}/etape`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ etape: "Demande de DP", user: user.name })
    });
    toast.success("DP remise en attente");
    onUpdated();
  };

  const handleAnnuler = async () => {
    const confirm = window.confirm("Confirmer l'annulation définitive de la DP ?");
    if (!confirm) return;
    await fetch(`${API_URL}/visites/${visite.id}/etape`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ etape: "Annulée", user: user.name })
    });
    toast.success("DP marquée comme refusée définitivement");
    onUpdated();
  };

  return (
    <div className="form-section2">
      <h3 className="form-section-title">Suivi de la DP</h3>

      <div className="form-row">
        <label className="form-label dark:text-white">DP lancée le :</label>
        <input
          className="form-input dark:bg-[#1d2125] dark:border-0"
          type="date"
          value={dateDP}
          onChange={(e) => setDateDP(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label className="form-label dark:text-white">Numéro de DP :</label>
        <input
          className="form-input dark:bg-[#1d2125] dark:border-0"
          value={numeroDP}
          onChange={(e) => setNumeroDP(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label className="form-label dark:text-white">Statut de la DP :</label>
        <select
          className="form-input dark:bg-[#1d2125] dark:border-0"
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
        >
          <option value="">-- Choisir --</option>
          <option>DP Validée</option>
          <option>DP Refusée</option>
        </select>
      </div>

      {statut === "DP Validée" && (
        <div className="form-row">
          <label className="form-label dark:text-white">Récipissé (PDF) :</label>
          <input type="file" onChange={(e) => setRecipisseFile(e.target.files[0])} />
        </div>
      )}

      {statut === "DP Incomplète" && (
        <div className="form-column">
          <label className="form-label">Documents manquants :</label>
          <textarea
            className="form-input"
            rows={3}
            value={documentsManquants}
            onChange={(e) => setDocumentsManquants(e.target.value)}
            placeholder="Précisez les documents manquants"
          ></textarea>
          <button className="primary-button mt-2" onClick={handleEnvoyerDocumentsManquants}>
            Envoyer
          </button>
        </div>
      )}

      {statut === "DP Validée" && (
        <div className="form-row mt-4">
          <button className="primary-button" onClick={handleValidation}>
            Valider la DP
          </button>
        </div>
      )}

      {statut === "DP Refusée" && (
        <div className="form-row mt-4 flex gap-4">
          <button className="primary-button bg-yellow-500" onClick={handleRecommencer}>
            Recommencer
          </button>
          <button className="primary-button bg-gray-500" onClick={handleAnnuler}>
            Terminer (Annuler)
          </button>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Dropzone from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function VADSection({ visite, visiteId, onValidated }) {
  const [cnoFile, setCnoFile] = useState(null);
  const [t0File, setT0File] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const uploadFile = async (file, nomSansExtension, dossier) => {
    const extension = file.name.split('.').pop();
    const nom = `${nomSansExtension}.${extension}`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", dossier);
    formData.append("nom", nom);

    return axios.post(`http://10.10.2.106:5000/visites/${visiteId}/documents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  };

  const handleSubmit = async () => {
    if (!cnoFile || !t0File) return;

    setLoading(true);

    try {
      await uploadFile(cnoFile, "CNO", "2. Déclaration admin");
      await uploadFile(t0File, "T0", "2. Déclaration admin");

      await axios.put(`http://10.10.2.106:5000/visites/${visiteId}/etape`, {
        etape: "Pose"
      });

      toast.success("Étape validée : Pose");
      await fetch("http://10.10.2.106:5000/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `📄 Dossier Administratif validé pour ${visite.nom_interlocuteur || "un client"}. En attente de la date de pose.`,
          type: "system",
          target: "Administratif",
          senderId: user.id,
          senderName: user.name,
        }),
      });
      if (onValidated) onValidated();
      navigate("/");
    } catch (err) {
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded mb-4">
        <p className="font-medium mb-2">Des documents sont manquants pour la DP ?</p>
        <p className="text-sm mb-3">Vous pouvez revenir à l'étape précédente pour permettre les corrections nécessaires.</p>
        <button
          className="secondary-button bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded"
          onClick={async () => {
            const confirm = window.confirm("Confirmer le retour à l'étape 'En attente de documents pour la DP' ?");
            if (!confirm) return;

            const res = await fetch(`${API_URL}/visites/${visite.id}/etape`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                etape: "En attente de documents pour la DP",
                user: user.name
              })
            });

            if (res.ok) {
              toast.success("Étape remise à 'DP incomplète'");
              if (refreshVisites) refreshVisites();
              if (refreshActivities) refreshActivities();
              onClose();
            } else {
              toast.error("Erreur lors du changement d'étape");
            }
          }}
        >
          Revenir à l'étape "DP"
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Dropzone onDrop={(acceptedFiles) => setCnoFile(acceptedFiles[0])}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()} className="border p-4 rounded bg-gray-50 cursor-pointer text-center dark:bg-[#1d2125] dark:border-0">
              <input {...getInputProps()} />
              {cnoFile ? <p>✅ {cnoFile.name}</p> : <p>Déposez le fichier CNO ici</p>}
            </div>
          )}
        </Dropzone>

        <Dropzone onDrop={(acceptedFiles) => setT0File(acceptedFiles[0])}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()} className="border p-4 rounded bg-gray-50 cursor-pointer text-center dark:bg-[#1d2125] dark:border-0">
              <input {...getInputProps()} />
              {t0File ? <p>✅ {t0File.name}</p> : <p>Déposez le fichier T0 ici</p>}
            </div>
          )}
        </Dropzone>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!cnoFile || !t0File || loading}
        className="mt-2 dark:text-white"
      >
        {loading ? "Envoi en cours..." : "Passer à la pose"}
      </Button>
    </div>
  );
}
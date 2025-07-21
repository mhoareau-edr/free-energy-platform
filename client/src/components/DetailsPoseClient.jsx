import { useEffect, useState } from "react";
import axios from "axios";

export default function DetailsPoseClient({ visiteId }) {
  const [pose, setPose] = useState(null);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchPose = async () => {
      try {
        const res = await axios.get(`${API}/visites/${visiteId}`);
        setPose(res.data);
      } catch (err) {
        console.error("Erreur récupération détails de pose :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPose();
  }, [visiteId]);

  useEffect(() => {
  const fetchPose = async () => {
    try {
      const res = await axios.get(`${API}/visites/${visiteId}`);
      console.log("👉 Détails visite :", res.data); // <-- ici
      setPose(res.data);
    } catch (err) {
      console.error("Erreur récupération détails de pose :", err);
    } finally {
      setLoading(false);
    }
  };

  fetchPose();
}, [visiteId]);


  if (loading) {
    return <p className="text-sm text-gray-500">Chargement en cours...</p>;
  }

  if (!pose?.date_debut_pose || !pose?.date_fin_pose) {
    return (
      <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded">
        ⏳ Pose pas encore planifiée pour ce client.
      </div>
    );
  }

  const dateDebut = new Date(pose.date_debut_pose);
  const dateFin = new Date(pose.date_fin_pose);

  return (
    <div className="bg-green-100 border border-green-300 text-green-900 p-4 rounded">
      <h3 className="font-semibold text-base mb-1">Pose planifiée :</h3>
      <p className="text-sm">
        Du <strong>{dateDebut.toLocaleDateString("fr-FR")}</strong> à{" "}
        {dateDebut.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} <br />
        au <strong>{dateFin.toLocaleDateString("fr-FR")}</strong> à{" "}
        {dateFin.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
      </p>
      <p className="text-sm mt-2">
        👷‍♂️ Nombre de techniciens recommandés : <strong>{pose.techniciens_recommandes}</strong>
      </p>
    </div>
  );
}

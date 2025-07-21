import { useEffect, useState } from "react";
import axios from "axios";

export default function ListePoses() {
  const [planifications, setPlanifications] = useState([]);

  useEffect(() => {
    const fetchPlanifications = async () => {
      try {
        const res = await axios.get("http://10.10.2.106:5000/visites/planifiees");
        setPlanifications(res.data);
      } catch (err) {
        console.error("Erreur chargement poses :", err);
      }
    };

    fetchPlanifications();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold text-primary mb-4">Rendez-vous de pose planifiés</h2>

      {planifications.length === 0 ? (
        <p className="text-sm text-gray-500">Aucun rendez-vous planifié pour le moment.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {planifications.map((p, idx) => {
            const dateDebut = new Date(p.date_debut_pose);
            const dateFin = new Date(p.date_fin_pose);

            return (
              <li key={idx} className="py-3">
                <div className="font-semibold text-gray-800">{p.nom_interlocuteur}</div>
                <div className="text-sm text-gray-600">
                  Du <b>{dateDebut.toLocaleDateString("fr-FR")}</b> à{" "}
                  {dateDebut.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} <br />
                  au <b>{dateFin.toLocaleDateString("fr-FR")}</b> à{" "}
                  {dateFin.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

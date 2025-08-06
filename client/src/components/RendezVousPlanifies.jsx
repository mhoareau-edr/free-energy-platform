import { useEffect, useState } from "react";
import { FaCalendarCheck } from "react-icons/fa";
import { format } from "date-fns";
import fr from "date-fns/locale/fr";

const API = import.meta.env.VITE_API_URL;

export default function RendezVousPlanifies({ onVoirTout }) {
  const [rdvs, setRdvs] = useState([]);

  useEffect(() => {
    const fetchRendezVous = async () => {
      const res = await fetch(`${API}/visites/planifiees`);
      const data = await res.json();

      const upcoming = [...data]
        .filter(v => v.date_debut_pose)
        .sort((a, b) => new Date(a.date_debut_pose) - new Date(b.date_debut_pose))
        .slice(0, 5);
      setRdvs(upcoming);
    };

    fetchRendezVous();
  }, []);

  return (
    <div className="w-full bg-white rounded-2xl shadow-md p-6 dark:bg-[#1d2125]">
      <div className="flex justify-between items-center mb-4 ">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 dark:text-white">
          Rendez-vous planifiés
        </h2>
        <button
          onClick={onVoirTout}
          className="px-4 py-2 text-sm text-white bg-primary rounded hover:bg-red-600 transition"
        >
          Voir tous les rendez-vous
        </button>
      </div>

      {rdvs.length === 0 ? (
        <p className="text-gray-500 text-sm italic dark:text-white">Aucun rendez-vous planifié.</p>
      ) : (
        <ul className="divide-y divide-gray-100 text-sm">
          {rdvs.map((rdv, i) => (
            <li key={i} className="py-2">
              <div className="font-bold text-gray-700 dark:text-white">{rdv.nom_interlocuteur}</div>
              <div className="text-gray-500 text-xs dark:text-white">
                {rdv.Commune} –{" "}
                {format(new Date(rdv.date_debut_pose), "dd MMMM yyyy", { locale: fr })}
                {" "}
                →{" "}
                {format(new Date(rdv.date_fin_pose), "dd MMMM yyyy", { locale: fr })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
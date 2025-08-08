import { useState } from "react";

const filtresEtapes = [
  "Toutes",
  "Demande de VT",
  "Visite Technique",
  "Visite Technique incomplète",
  "DP",
  "RAC",
  "VAD",
  "Pose",
  "Terminé",
];

export default function ListeDemandes({ visites = [], onSelectClient, onVoirTous, getEtapeStyle, currentUser }) {

  const [filtre, setFiltre] = useState("Toutes");
  const [showLockedPopup, setShowLockedPopup] = useState(false);

  const visitesFiltrees = Array.isArray(visites)
    ? (filtre === "Toutes" ? visites : visites.filter((v) => v.etape === filtre))
  : [];
  
  const affichageLimite = visitesFiltrees.slice(0, 5);

  return (
    <div className="w-full bg-white rounded-2xl shadow-md p-6 dark:bg-[#1d2125]">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Liste des demandes</h2>
          <p className="text-sm text-gray-500">Dernières demandes enregistrées</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500 dark:text-white ">Filtrer par étape :</label>
          <select
            value={filtre}
            onChange={(e) => setFiltre(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm shadow-sm focus:ring-primary focus:border-primary dark:bg-[#353c42] dark:text-white dark:border-0"
          >
            {filtresEtapes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm text-left text-gray-700 dark:text-white ">
          <thead>
            <tr className="text-xs text-black uppercase tracking-wide dark:text-white">
              <th className="pb-3 dark:text-white">Nom</th>
              <th className="pb-3 dark:text-white">Puissance</th>
              <th className="pb-3 dark:text-white">Commune</th>
              <th className="pb-3 dark:text-white">Date</th>
              <th className="pb-3 dark:text-white">Étape</th>
              <th className="pb-3 dark:text-white">CA</th>
              <th className="pb-3 dark:text-white">Type</th>
              <th className="pb-3 dark:text-white">Contrat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {affichageLimite.map((v) => (
              <tr
                key={v.id}
                className={`transition ${currentUser?.role === "Technique" && v.locked && v.technicien_vt !== currentUser.name
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:bg-gray-50 hover:dark:bg-[#2f353a]"
                  }`}
                onClick={() => {
                  if (
                    currentUser?.role === "Technique" &&
                    v.locked &&
                    v.technicien_vt !== currentUser?.name
                  ) {
                    setShowLockedPopup(true);
                    return;
                  }
                  onSelectClient(v);
                }}
              >
                <td className="py-4 font-medium text-gray-900 dark:text-white">{v.nom_interlocuteur}</td>
                <td className="py-4 dark:text-white">{v.puissance_souhaitee} kWc</td>
                <td className="py-4 dark:text-white">{v.Commune}</td>
                <td className="py-4 text-sm text-gray-500 dark:text-white">
                  {new Date(v.createdAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </td>
                <td className="py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${v.etape === "Visite Technique incomplète"
                      ? "bg-orange-100 text-orange-700 border border-orange-300"
                      : getEtapeStyle(v.etape)
                      }`}
                  >
                    {v.etape}
                  </span>
                </td>

                <td className="py-4">{v.technicien_vt}</td>

                <td className="py-4 text-sm">
                  {v.client_b2b ? (
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">BtoB</span>
                  ) : v.client_b2c ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">BtoC</span>
                  ) : (
                    <span className="text-gray-400 italic">Non défini</span>
                  )}
                </td>
                <td className="py-4 text-sm">
                  { (v.type_abonnement ?? v.details?.type_abonnement) ? (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">Abonnement</span>
                  ) : (v.type_comptant ?? v.details?.type_comptant) ? (
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">Comptant</span>
                  ) : (
                    <span className="text-gray-400 italic">Non défini</span>
                  )}
                </td>
                <td className="py-4 font-medium text-gray-900">
                  {currentUser?.role === "Technique" && v.locked && v.technicien_vt !== currentUser?.name && (
                    <span title="Verrouillé">🔒</span>
                  )}
                </td>
              </tr>
            ))}
            {affichageLimite.length === 0 && (
              <tr>
                <td colSpan="8" className="py-4 text-center text-sm text-gray-400 italic">
                  Aucune demande trouvée pour cette étape.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔽 Bouton toujours visible */}
      <div className="flex justify-start mt-4">
        <button
          onClick={onVoirTous}
          className="px-4 py-2 text-sm text-white bg-primary rounded hover:bg-red-600 transition"
        >
          Voir tous les clients
        </button>
      </div>
      {showLockedPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl text-center transform scale-95 animate-pop-in dark:bg-[#1d2125] dark:border-0">
            <h3 className="text-lg font-bold mb-4 text-red-600 dark:text-white">Dossier verrouillé</h3>
            <p className="text-sm text-gray-700 mb-6 dark:text-white">
              Ce dossier est actuellement verrouillé. Seul le technicien assigné peut y accéder ou le modifier.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowLockedPopup(false)}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-red-600 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

  );
}
import { useEffect, useState } from "react";

const VERSION_PATCH = "1.0.0";

export default function PatchNotesModal() {
  const [show, setShow] = useState(true);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const lastSeen = localStorage.getItem("patchNotesVersion");
    if (lastSeen !== VERSION_PATCH) {
      setShow(true);
    }
  }, []);

  const closeModal = () => {
    if (dontShowAgain) {
      localStorage.setItem("patchNotesVersion", VERSION_PATCH);
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-[#1d2125] p-6 rounded-xl shadow-lg w-[90%] max-w-md relative">
        <button
          className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
          onClick={closeModal}
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-primary">🛠️ Mise à jour {VERSION_PATCH}</h2>
        <p className="text-s">Bienvenue sur la nouvelle interface de Free Energy !</p>

        <h2 className="text-3xl font-bold mt-4 text-primary">Global</h2>
        <ul className="list-disc list-inside text-sm space-y-2 text-gray-700 dark:text-white">
          <li>Ajout des étapes : Consuel & EDF.</li>
          <li>Ajout d'une interface pour l'étape "Terminée".</li>
          <li>Ajout d'une messagerie interne (Messages).</li>
          <li>Nouvelle fonctionnalité : Mode Clair/Sombre.</li>
          <li>Nouvelle fonctionnalité : Possibilité de réduire le menu de gauche.</li>
          <li>Bug réglé : Lecture des documents impossible (Onglet "Documents").</li>
          <li>Possibilité de filtrer les clients par types de client (BTOB ou BTOC) sur la page "Clients".</li>
        </ul>

        <h2 className="text-xl font-bold mt-4 text-primary">Administratif</h2>
        <ul className="list-disc list-inside text-sm space-y-2 text-gray-700 dark:text-white">
          <li>Modification du formulaire de demande de VT : Ajout du type de client "BToB" et du "BToC".</li>
          <li>Modification de l'interface de pose.</li>
        </ul>

        <h2 className="text-xl font-bold mt-4 text-primary">Technique</h2>
        <ul className="list-disc list-inside text-sm space-y-2 text-gray-700 dark:text-white">
          <li>Modification de l'interface de pose.</li>
          <li>Ajout de la possibilité de joindre des photos des poses (Onglet "Photos de la pose").</li>
          <li>Nouveauté : "Répartition des dossiers par technicien".</li>
        </ul>
        <label className="text-sm flex items-center gap-2 text-gray-700 dark:text-white mt-2">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={() => setDontShowAgain(!dontShowAgain)}
          />
          Ne plus afficher jusqu'à la prochaine mise à jour
        </label>
      </div>
    </div>
  );
}
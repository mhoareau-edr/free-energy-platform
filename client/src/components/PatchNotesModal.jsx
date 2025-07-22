import { useEffect, useState } from "react";

const VERSION_PATCH = "1.0.0";

export default function PatchNotesModal() {
  const [show, setShow] = useState(true);

  const closeModal = () => {
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

        <h2 className="text-xl font-bold mt-4 text-primary">Global</h2>
        <ul className="list-disc list-inside text-sm space-y-2 text-gray-700 dark:text-white">
          <li>Ajout des étapes : Consuel & EDF</li>
          <li>Ajout d'une interface pour l'étape "Terminée"</li>
        </ul>

        <h2 className="text-xl font-bold mt-4 text-primary">Administratif</h2>
        <ul className="list-disc list-inside text-sm space-y-2 text-gray-700 dark:text-white">
          <li>Modification du formulaire de demande de VT : Ajout du "BToB" et du "BToC"</li>
          <li>Modification de l'interface de pose</li>
        </ul>

        <h2 className="text-xl font-bold mt-4 text-primary">Technique</h2>
        <ul className="list-disc list-inside text-sm space-y-2 text-gray-700 dark:text-white">
          <li>Modification de l'interface de pose</li>
          <li>Ajout de la possibilité de joindre des photos des poses (Onglet "Photos de la pose")</li>
        </ul>
      </div>
    </div>
  );
}
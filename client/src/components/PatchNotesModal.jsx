import { useEffect, useState } from "react";

const VERSION_PATCH = "1.0.0";

export default function PatchNotesModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const lastSeen = localStorage.getItem("patchNotesVersion");
    if (lastSeen !== VERSION_PATCH) {
      setShow(true);
    }
  }, []);

  const closeModal = () => {
    localStorage.setItem("patchNotesVersion", VERSION_PATCH);
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
        <h2 className="text-xl font-bold mb-4 text-primary">🛠️ Mise à jour {VERSION_PATCH}</h2>
        <ul className="list-disc list-inside text-sm space-y-2 text-gray-700 dark:text-white">
          <li>Bienvenue sur la nouvelle interface de Free Energy !</li>
        </ul>
      </div>
    </div>
  );
}
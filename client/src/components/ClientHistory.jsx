import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function ClientHistory({ visiteId }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchClientHistory = async () => {
      try {
        const res = await fetch(`${API}/visites/${visiteId}/historique`);
        const data = await res.json();
        const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
        setHistory(sorted);
      } catch (err) {
        console.error("Erreur chargement historique client :", err);
      }
    };

    fetchClientHistory();
  }, [visiteId]);

  if (history.length === 0) {
    return <p className="text-gray-500 italic dark:text-white">Aucune activité pour ce client.</p>;
  }

  return (
    <div className="bg-white p-4 rounded shadow dark:bg-[#1d2125]">
      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Historique du client</h3>
      <ul className="space-y-3">
        {history.map((item, index) => (
          <li key={index} className="border-b pb-2 text-sm text-gray-700 dark:text-white">
            <p>
              <strong>{item.user}</strong> – <em>{new Date(item.date).toLocaleString("fr-FR")}</em>
            </p>
            <p>{item.action}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

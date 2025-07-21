import { useEffect, useState } from "react";
import { FaClipboardList } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

export default function Historique() {
  const [activities, setActivities] = useState([]);

  const fetchActivities = async () => {
    const res = await fetch(`${API}/history`);
    const data = await res.json();
    const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    setActivities(sorted);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">Historique complet</h1>
      <div className="space-y-4">
        {activities.map((act, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-white p-4 rounded-lg shadow-sm">
            <FaClipboardList className="text-lg text-gray-400" />
            <div>
              <p className="font-medium text-gray-800">{act.action}</p>
              <p className="text-xs text-gray-500">
                {new Date(act.date).toLocaleString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

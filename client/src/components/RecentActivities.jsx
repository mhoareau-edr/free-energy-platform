import { useEffect, useState } from "react";
import {
  FaClipboardList,
  FaTimesCircle,
  FaTrashAlt,
  FaCheckCircle,
  FaFilePdf,
  FaCamera,
  FaWrench
} from "react-icons/fa";

const iconMap = {
  FaTimesCircle: <FaTimesCircle className="text-red-500" />,
  FaTrashAlt: <FaTrashAlt className="text-red-500" />,
  FaClipboardList: <FaClipboardList className="text-blue-500" />,
  FaCheckCircle: <FaCheckCircle className="text-green-500" />,
  FaFilePdf: <FaFilePdf className="text-purple-500" />,
  FaCamera: <FaCamera className="text-yellow-500" />,
  FaWrench: <FaWrench className="text-orange-500" />
};

const API_URL = "http://10.10.2.106:5000";

export default function RecentActivities({ user, onShowHistory }) {
  const [activities, setActivities] = useState([]);
  const STORAGE_KEY = `seenActivities_${user.name}`;

  const [seenActivities, setSeenActivities] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    const fetchActivities = async () => {
      const res = await fetch(`${API_URL}/history`);
      const data = await res.json();
      const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
      setActivities(sorted);
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 2000);
    return () => clearInterval(interval);
  }, []);

  const markAsSeen = (id) => {
    const updated = [...seenActivities, id];
    setSeenActivities(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div>
      <div className="space-y-5 overflow-hidden bg-white rounded-2xl shadow-md p-6 mt-8 dark:bg-[#1d2125]">
        <div className="flex justify-between items-center mb-2">
          <h2 className="section-title ">Activités récentes</h2>
          <button className="px-4 py-2 text-sm text-white bg-primary rounded hover:bg-red-600 transition" onClick={onShowHistory}>
            Voir tout l'historique
          </button>
        </div>
        {activities.slice(0, 6).map((act, idx) => {
          const isNew = !seenActivities.includes(act.id);
          return (
            <div
              key={idx}
              onClick={() => markAsSeen(act.id)}
              className="flex gap-3 items-start bg-white/50 backdrop-blur-md border border-gray-200 rounded-xl shadow-sm p-3 cursor-pointer transition-all hover:scale-[1.02] dark:bg-[#353c42] dark:border-gray-800"
            >
              <div className="bg-white shadow p-2 rounded-full text-xl dark:bg-[#353c42] dark:border-gray-800">
                {iconMap[act.icon] || <FaClipboardList className="text-gray-400 " />}
              </div>

              <div className="text-sm flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-800 dark:text-white">{act.action}</p>
                  {isNew && (
                    <span className="bg-green-500/10 text-green-700 text-[11px] font-medium px-2 py-0.5 rounded-full">
                      Nouveau
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 dark:text-white">
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
          );
        })}
      </div>
    </div>
  );
}
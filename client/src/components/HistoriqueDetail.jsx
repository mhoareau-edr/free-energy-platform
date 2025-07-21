import { useEffect, useState } from "react";
import "../styles/style.css";
import {
  FaUserCircle,
  FaClipboardList,
  FaTimesCircle,
  FaHourglassHalf,
  FaCheckCircle,
  FaChartLine,
  FaTrashAlt,
  FaFilePdf,
  FaCamera,
  FaWrench
} from "react-icons/fa";

const API_URL = "http://10.10.2.106:5000";

const iconMap = {
  FaTimesCircle: <FaTimesCircle className="text-red-500" />,
  FaTrashAlt: <FaTrashAlt className="text-red-500" />,
  FaClipboardList: <FaClipboardList className="text-blue-500" />,
  FaCheckCircle: <FaCheckCircle className="text-green-500" />,
  FaFilePdf: <FaFilePdf className="text-purple-500" />,
  FaCamera: <FaCamera className="text-yellow-500" />,
  FaWrench: <FaWrench className="text-orange-500" />
};

export default function HistoriqueDetail({ onClose, user }) {
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchHistory = async () => {
    const res = await fetch(`${API_URL}/history`);
    const data = await res.json();
    const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    setHistory(sorted);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const STORAGE_KEY = `seenActivities_${user.name}`;

  const [seenActivities, setSeenActivities] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const markAsSeen = (id) => {
    if (!seenActivities.includes(id)) {
      const updated = [...seenActivities, id];
      setSeenActivities(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  return (
    <div className="client-detail-wrapper ">
      <div className="client-detail-container dark:bg-[#121417] dark:text-white dark:border-0">
        {/* CENTER COLUMN */}
        <div className="client-center-column overflow-auto max-h-screen">
          <div className="space-y-4">
            <button onClick={onClose} className="mb-4 w-[300px] bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded">
            ← Revenir à la liste
          </button>
            {currentItems.map((act, index) => (
              <div
                key={index}
                onClick={() => markAsSeen(act.id)}
                className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm cursor-pointer dark:bg-[#353c42] dark:border-gray-800"
              >
                <div className="text-xl">
                  {iconMap[act.icon] || <FaClipboardList className="text-gray-400" />}
                </div>
                <div className="text-sm text-gray-800">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold dark:text-white">{act.action}</p>
                    {!seenActivities.includes(act.id) && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Nouveau</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-white">
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

          {/* PAGINATION AVEC NUMÉROS */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-primary text-white rounded disabled:opacity-50"
              >
                Précédent
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded font-medium ${currentPage === i + 1
                      ? "bg-primary text-white"
                      : "bg-gray-100 hover:bg-gray-200 dark:bg-[#353c42] dark:border-gray-800"
                    }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-primary text-white rounded disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
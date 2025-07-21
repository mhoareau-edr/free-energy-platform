import { useEffect, useState } from "react";
import axios from "axios";

export default function RepartitionParTechnicien({ onSelectTechnicien }) {
  const [stats, setStats] = useState({});
  const [total, setTotal] = useState(0);
  const [nameToDisplayMap, setNameToDisplayMap] = useState({});
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      const [visitesRes, usersRes] = await Promise.all([
        axios.get(`${API}/visites`),
        axios.get(`${API}/users`),
      ]);

      const visites = visitesRes.data;
      const users = usersRes.data;

      const techniciens = users.filter((u) => u.role?.toLowerCase() === "technique");

      const map = {};
      techniciens.forEach((tech) => {
        map[tech.name] = tech.displayName || tech.name;
      });
      setNameToDisplayMap(map);

      const repartition = {};
      techniciens.forEach((tech) => {
        repartition[tech.name] = 0;
      });

      visites.forEach((v) => {
        const nom = v.technicien_vt?.trim();
        if (nom && repartition.hasOwnProperty(nom)) {
          repartition[nom]++;
        } else if (!nom) {
          repartition["Non attribué"] = (repartition["Non attribué"] || 0) + 1;
        }
      });

      setStats(repartition);
      setTotal(visites.length);
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-md dark:bg-[#1d2125]">
      <h3 className="text-lg font-bold mb-6">Répartition des dossiers par technicien</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(stats).map(([nom, count]) => {
          const displayName = nameToDisplayMap[nom] || nom;
          const pourcentage = total ? ((count / total) * 100).toFixed(1) : 0;

          return (
            <div
              key={nom}
              onClick={() => onSelectTechnicien(nom === "Non attribué" ? "" : nom)}
              className="cursor-pointer bg-gray-50 hover:bg-red-50 transition rounded-lg shadow-sm p-4 border border-gray-200 dark:bg-[#353c42] dark:border-gray-800"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-800 dark:text-white">{displayName}</span>
                <span className="text-xs font-medium text-gray-600 dark:text-white">{count} dossier{count > 1 ? "s" : ""}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden ">
                <div
                  className="h-4 bg-gradient-to-r from-blue-500 to-green-400 transition-all duration-300"
                  style={{ width: `${pourcentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
import { useEffect, useState, useRef, useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import { FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";

export default function Clients({ visites, onSelectClient, getEtapeStyle, onClose, etapesFiltrees = [], onEtapeFilterChange, filtreTechnicien, currentUser }) {

  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const searchRef = useRef(null);
  const [filters, setFilters] = useState({
    puissance: "",
    commune: "",
    technicien_vt: "",
    type_client: "",
  });
  if (!Array.isArray(visites)) {
    console.warn("Les visites reçues ne sont pas un tableau :", visites);
    return <p className="text-red-500">Erreur de chargement des données.</p>;
  }

  const [showLockedPopup, setShowLockedPopup] = useState(false);
  const [technicienVerrou, setTechnicienVerrou] = useState("");


  // Collecte des valeurs uniques
  const puissances = [...new Set(visites.map(v => v.puissance_souhaitee).filter(Boolean))];
  const communes = [...new Set(visites.map(v => v.Commune).filter(Boolean))];
  const etapes = [...new Set(visites.map(v => v.etape).filter(Boolean))];
  const techniciens = [...new Set(visites.map(v => v.technicien_vt).filter(Boolean))];

  // Gestion du tri
  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const sorted = useMemo(() => {
    const sortedData = [...visites]
      .filter((v) =>
        [v.nom_interlocuteur, v.client, v.Commune]
          .some((val) => val?.toLowerCase().includes(search.toLowerCase()))
      )
      .filter(v =>
        (!filters.puissance || v.puissance_souhaitee === filters.puissance) &&
        (!filters.commune || v.Commune === filters.commune) &&
        (filters.technicien_vt === "" ||
          (filters.technicien_vt === "__empty__" && !v.technicien_vt) ||
          v.technicien_vt === filters.technicien_vt) &&
        (!filters.type_client ||
          (filters.type_client === "BtoB" && v.client_b2b) ||
          (filters.type_client === "BtoC" && v.client_b2c))
      )
      .filter(v =>
        etapesFiltrees.length === 0 || etapesFiltrees.includes(v.etape)
      );
    // ← filtre par étape venant du dashboard

    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        const aVal = sortConfig.key === "createdAt" ? new Date(a[sortConfig.key]) : a[sortConfig.key]?.toString().toLowerCase();
        const bVal = sortConfig.key === "createdAt" ? new Date(b[sortConfig.key]) : b[sortConfig.key]?.toString().toLowerCase();

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortedData;
  }, [visites, search, filters, sortConfig, etapesFiltrees]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (filtreTechnicien) {
      setFilters((prev) => ({
        ...prev,
        technicien_vt: filtreTechnicien === "Non attribué" ? "__empty__" : filtreTechnicien
      }));
    }
  }, [filtreTechnicien]);

  return (
    <div className="bg-white p-6 shadow-md w-full h-full dark:bg-[#121417] dark:text-white">
      <button onClick={onClose} className="mb-4 w-[300px] bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded">
        ← Revenir à la liste
      </button>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Tous les clients</h2>
      </div>

      <div ref={searchRef} className="relative">
        <input
          type="text"
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-primary dark:bg-[#353c42] dark:border-gray-600 dark:text-white"
        />
        <FaSearch className="absolute top-3 right-3 text-gray-400 text-sm" />
      </div>

      <div className="overflow-x-auto my-8">
        <table className="w-full table-auto text-sm text-left text-gray-700">
          <thead>
            <tr className="text-xs text-black uppercase tracking-wide">
              <th className="pb-3 pr-2 text-left cursor-pointer align-middle" onClick={() => handleSort("nom_interlocuteur")}>
                <span className="font-semibold dark:text-white">Nom & Prénom</span>
              </th>
              <th className="pb-3 pr-2">
                <select
                  onChange={(e) => setFilters(f => ({ ...f, puissance: e.target.value }))}
                  className="px-2 py-1 text-sm border-none rounded-md dark:bg-[#353c42] dark:text-white"
                >
                  <option value="">Puissance</option>
                  {puissances.map(p => <option key={p} value={p}>{p} kWc</option>)}
                </select>
              </th>
              <th className="pb-3 pr-2">
                <select
                  onChange={(e) => setFilters(f => ({ ...f, commune: e.target.value }))}
                  className="px-2 py-1 text-sm border-none rounded-md dark:bg-[#353c42] dark:text-white"
                >
                  <option value="">Commune</option>
                  {communes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </th>
              <th className="pb-3 pr-2 text-left cursor-pointer align-middle" onClick={() => handleSort("createdAt")}>
                <span className="font-semibold dark:text-white">Demandée le</span>
              </th>
              <th className="pb-3 pr-2">
                <select
                  onChange={(e) => onEtapeFilterChange(e.target.value)}
                  className="px-2 py-1 text-sm border-none rounded-md dark:bg-[#353c42] dark:text-white"
                >
                  <option value="">Étape</option>
                  {etapes.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </th>
              <th className="pb-3">
                <select
                  onChange={(e) => setFilters(f => ({ ...f, technicien_vt: e.target.value }))}
                  className="px-2 py-1 text-sm border-none rounded-md dark:bg-[#353c42] dark:text-white"
                >
                  <option value="">Chargé d'affaires</option>
                  {techniciens.map(t => (
                    <option key={t || "__empty__"} value={t || "__empty__"}>
                      {t || "Non attribué"}
                    </option>
                  ))}

                </select>
              </th>
              <th className="pb-3">
                <select
                  onChange={(e) => setFilters(f => ({ ...f, type_client: e.target.value }))}
                  className="px-2 py-1 text-sm border-none rounded-md dark:bg-[#353c42] dark:text-white"
                >
                  <option value="">Type</option>
                  <option value="BtoB">BtoB</option>
                  <option value="BtoC">BtoC</option>
                </select>
              </th>

            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {sorted.map((v) => (
              <tr
                key={v.id}
                className={`transition ${currentUser?.role === "Technique" && v.locked && v.technicien_vt !== currentUser.name
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:bg-gray-50 hover:dark:bg-[#2f353a]"
                  }`}

                onClick={() => {
                  if (currentUser?.role === "Technique" && v.locked && v.technicien_vt !== currentUser.name) {
                    setTechnicienVerrou(v.technicien_vt || "technicien assigné");
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
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEtapeStyle(v.etape)}`}>
                    {v.etape}
                  </span>
                </td>
                <td className="py-4 dark:text-white">{v.technicien_vt}</td>
                <td className="py-4 text-sm">
                  {v.client_b2b ? (
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">BtoB</span>
                  ) : v.client_b2c ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">BtoC</span>
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
            {sorted.length === 0 && (
              <tr>
                <td colSpan="6" className="py-4 text-center text-sm text-gray-400 italic">
                  Aucun client ne correspond à votre recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showLockedPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl text-center transform scale-95 animate-pop-in dark:bg-[#1d2125]">
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

import {
  FaUserCircle,
  FaTachometerAlt,
  FaHistory,
  FaRegCalendarAlt,
  FaBars,
  FaUsers,
  FaChevronLeft,
  FaChartBar
} from "react-icons/fa";
import { FiMessageSquare } from "react-icons/fi";
import logo from "../assets/logo.png";
import NotificationBell from "./NotificationBell";
import ThemeToggleButton from "./ThemeToggleButton";
import { useState } from "react";

export default function Header({
  user,
  searchRef,
  searchTerm,
  setSearchTerm,
  showSuggestions,
  setShowSuggestions,
  visites,
  getEtapeStyle,
  setSelectedClient,
  showHistoryDetail,
  showPlanningPose,
  setShowHistoryDetail,
  setShowPlanningPose,
  showAllClients,
  setShowAllClients,
  setShowSettingsPopup,
  onLogout,
  setFiltreEtapes,
  setShowForm,
  showMessages,
  setShowMessages
}) {
  const [collapsed, setCollapsed] = useState(false);
  const handleCollapse = () => setCollapsed(!collapsed);

  return (
    <aside
      className={`transition-all duration-500 ease-in-out h-screen bg-white dark:bg-[#121417] shadow-md flex flex-col border-r dark:border-gray-700 ${collapsed ? "w-[64px]" : "w-64"
        }`}
    >
      {/* Top logo + toggle */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <img
            src={logo}
            alt="Logo"
            className="h-8 transition-opacity duration-300 ease-in-out"
          />
        )}
        <button
          onClick={handleCollapse}
          className="text-gray-600 dark:text-gray-300 text-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {collapsed ? <FaBars /> : <FaChevronLeft />}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div ref={searchRef} className="relative px-4 py-4">
          <input
            type="text"
            placeholder="🔍 Rechercher..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="form-input w-full border rounded px-3 py-2 text-sm shadow-sm dark:bg-gray-800 dark:text-white"
          />
          {showSuggestions && searchTerm && (
            <div className="absolute z-50 mt-1 w-[600px] bg-white border dark:bg-gray-800 dark:text-white dark:border-gray-600 shadow rounded max-h-80 overflow-auto">
              {visites
                .filter(
                  (v) =>
                    v.nom_interlocuteur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    v.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    v.Commune?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .slice(0, 6)
                .map((v) => (
                  <div
                    key={v.id}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm flex justify-between"
                    onClick={() => {
                      setSelectedClient(v);
                      setSearchTerm("");
                      setShowSuggestions(false);
                      setShowAllClients(false);
                      setShowPlanningPose(false);
                      setShowHistoryDetail(false);
                      setShowMessages(false);
                    }}
                  >
                    <span>
                      {v.nom_interlocuteur}
                      <br />
                      <span className="text-xs text-gray-500">{v.Commune}</span>
                    </span>
                    <span className={`text-xs px-5 py-1 flex items-center rounded-full ${getEtapeStyle(v.etape)}`}>
                      {v.etape}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-2 flex-1">
        <ul className="space-y-2 px-2">
          <SidebarItem icon={<FaChartBar />} label="Tableau de bord" collapsed={collapsed} active={!showHistoryDetail && !showPlanningPose && !showAllClients && !showMessages} onClick={() => { setSelectedClient(null); setShowHistoryDetail(false); setShowPlanningPose(false); setShowAllClients(false); setShowMessages(false); }} />
          <SidebarItem icon={<FaUsers />} label="Clients" collapsed={collapsed} active={showAllClients} onClick={() => { setSelectedClient(null); setShowHistoryDetail(false); setShowPlanningPose(false); setShowAllClients(true); setShowMessages(false); setFiltreEtapes([]); }} />
          <SidebarItem icon={<FaRegCalendarAlt />} label="Planning" collapsed={collapsed} active={showPlanningPose} onClick={() => { setSelectedClient(null); setShowHistoryDetail(false); setShowAllClients(false); setShowPlanningPose(true); setShowMessages(false); }} />
          <SidebarItem icon={<FaHistory />} label="Historique" collapsed={collapsed} active={showHistoryDetail} onClick={() => { setSelectedClient(null); setShowPlanningPose(false); setShowAllClients(false); setShowHistoryDetail(true); setShowMessages(false); }} />
          <SidebarItem icon={<FiMessageSquare />} label="Messages" collapsed={collapsed} active={showMessages} onClick={() => { setSelectedClient(null); setShowPlanningPose(false); setShowAllClients(false); setShowHistoryDetail(false); setShowMessages(true); }} />
        </ul>
      </nav>

      {/* Footer toujours en bas */}
      <div className="px-4 py-4 border-t dark:border-gray-70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FaUserCircle className="text-gray-500 text-2xl" />
            {!collapsed && (
              <div className="text-xs">
                <p className="font-bold text-sm text-primary dark:text-white">{user.name}</p>
                <p className="text-gray-500 dark:text-gray-400">Bienvenue</p>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="flex items-center">
              <ThemeToggleButton />
              <NotificationBell user={user} />

            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={onLogout}
            className="text-red-600 bg-red-100 hover:bg-red-200 px-4 py-2 w-full mt-2 rounded text-sm font-medium"
          >
            Se déconnecter
          </button>
        )}
      </div>

    </aside>
  );
}

function SidebarItem({ icon, label, collapsed, active, onClick }) {
  return (
    <li
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-3 rounded-lg cursor-pointer transition-colors group ${active
          ? "bg-primary text-white"
          : "text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
        }`}
    >
      <div className="text-lg pl-0.5">{icon}</div>
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
    </li>
  );
}

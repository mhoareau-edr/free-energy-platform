import { useEffect, useState } from "react";
import {
  FaClipboardList,
  FaTimesCircle,
  FaCheckCircle,
  FaTrashAlt,
  FaFilePdf,
  FaCamera,
  FaWrench,
} from "react-icons/fa";
import HistoriqueDetail from "../components/HistoriqueDetail";
import "../styles/style.css";
import PlanningPose from "../components/PlanningPose";
import RecentActivities from "../components/RecentActivities";
import DashboardStats from "../components/DashboardStats";
import Header from "@/components/Header";
import { useRef } from "react";
import ClientDetail from "../components/ClientDetail";
import ListeDemandes from "../components/ListeDemandes";
import RendezVousPlanifies from "../components/RendezVousPlanifies";
import Clients from "../components/Clients";
import ChatFullScreen from "@/components/Chat/ChatFullScreen";
import CamembertStats from "../components/CamembertStats";
import WelcomeBanner from "../components/WelcomeBanner";
import { socket } from "../socket";
import RepartitionParTechnicien from "../components/RepartitionParTechnicien";
import ChatWidget from "@/components/Chat/ChatWidget";
import PatchNotesModal from "@/components/PatchNotesModal";

export default function DashboardTechnique({ user, onLogout }) {
  const [visites, setVisites] = useState([]);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [showHistoryDetail, setShowHistoryDetail] = useState(false);
  const [activities, setActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filtreTechnicien, setFiltreTechnicien] = useState(null);
  const [showAllClients, setShowAllClients] = useState(false);

  const [showPlanningPose, setShowPlanningPose] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const STORAGE_KEY = `seenActivities_${user.name}`;
  const [filtreEtapes, setFiltreEtapes] = useState([]);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFullChat, setShowFullChat] = useState(false);
  const [selectedMiniChatUser, setSelectedMiniChatUser] = useState(null);


  const API = import.meta.env.VITE_API_URL;

  const fetchVisites = async () => {
    const res = await fetch(`${API}/visites`);
    const data = await res.json();
    const sortedData = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setVisites(sortedData);
  };

  const fetchActivities = async () => {
    const res = await fetch(`${API}/history`);
    const data = await res.json();
    const sortedActivities = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    setActivities(sortedActivities);
  };

  const filteredVisites = visites.filter(v =>
    v.nom_interlocuteur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.Commune?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchVisites();
    fetchActivities();

    const visitesInterval = setInterval(fetchVisites, 2000);
    const activitiesInterval = setInterval(fetchActivities, 2000);

    return () => {
      clearInterval(visitesInterval);
      clearInterval(activitiesInterval);
    };
  }, []);

  const searchRef = useRef(null);

  const [seenActivities, setSeenActivities] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const markAsSeen = (id) => {
    const updated = [...seenActivities, id];
    setSeenActivities(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSelectClient = async (v) => {
    if (v.etape === "Demande de VT") {
      await fetch(`${API}/visites/${v.id}/etape`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ etape: "Visite Technique", user: user.name })
      });
      v.etape = "Visite Technique";
    }
    setSelectedClient(v);
  };

  const handleVoirTous = () => {
    setShowAllClients(true);
  };

  const refreshVisites = async () => {
    const res = await fetch(`${API}/visites`);
    const data = await res.json();
    setVisites(data);
  };

  useEffect(() => {
    if (!user?.id) return;

    socket.connect();

    socket.emit("joinRoom", { userId: user.id });

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReceiveMessage = (message) => {
    const isCurrentConversation =
      selectedUser &&
      (message.senderId === selectedUser.id || message.receiverId === selectedUser.id);

    if (isCurrentConversation) {
      setMessages((prev) => [...prev, message]);
    }
  };

  useEffect(() => {
    if (showMessages) {
      document.title = "Free Energy App";
    }
  }, [showMessages]);

  const getEtapeStyle = (etape) => {
    switch (etape) {
      case "Demande de VT": return "bg-yellow-100 text-yellow-800";
      case "Visite Technique": return "bg-orange-100 text-orange-800";
      case "DP": return "bg-blue-100 text-blue-800";
      case "RAC": return "bg-purple-100 text-purple-800";
      case "VAD": return "bg-green-100 text-green-800";
      case "Pose": return "bg-teal-100 text-teal-800";
      case "Terminé": return "bg-green-600 text-white";
      case "Annulée": return "bg-red-800 text-white";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const dossiersNonCommences = visites.filter(v => v.etape === "Demande de VT").length;
  const dossiersEnCours = visites.filter(v =>
    ["Visite Technique", "EDF", "Consuel", "DP", "RAC", "VAD", "Pose", "En attente de documents pour la DP"].includes(v.etape)
  ).length;
  const dossiersTermines = visites.filter(v => v.etape === "Terminé").length;

  const prochainRdv = visites
    .filter(v => v.date_debut_pose && v.date_fin_pose)
    .sort((a, b) => new Date(a.date_debut_pose) - new Date(b.date_debut_pose))[0];

  return (
    <div className="dashboard-container">
      <PatchNotesModal />
      <Header
        user={user}
        searchRef={searchRef}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        visites={visites}
        getEtapeStyle={getEtapeStyle}
        setSelectedClient={setSelectedClient}
        showHistoryDetail={showHistoryDetail}
        showPlanningPose={showPlanningPose}
        setShowHistoryDetail={setShowHistoryDetail}
        setShowPlanningPose={setShowPlanningPose}
        showAllClients={showAllClients}
        setShowAllClients={setShowAllClients}
        setShowSettingsPopup={setShowSettingsPopup}
        onLogout={onLogout}
        setFiltreEtapes={setFiltreEtapes}
        showMessages={showMessages}
        setShowMessages={setShowMessages}
      />

      <main className="dashboard-main">
        {showHistoryDetail ? (
          <HistoriqueDetail user={user} onClose={() => setShowHistoryDetail(false)} />
        ) : selectedClient ? (
          <ClientDetail
            visite={selectedClient}
            user={user}
            onClose={() => setSelectedClient(null)}
            refreshVisites={fetchVisites}
            refreshActivities={fetchActivities}
          />
        ) : showPlanningPose ? (
          <PlanningPose user={user} onClose={() => setShowPlanningPose(false)} />
        ) : showAllClients ? (
          <Clients
            visites={visites}
            onSelectClient={handleSelectClient}
            getEtapeStyle={getEtapeStyle}
            onClose={() => setShowAllClients(false)}
            etapesFiltrees={filtreEtapes}
            onEtapeFilterChange={(etape) => {
              if (etape === "") {
                setFiltreEtapes([]);
              } else {
                setFiltreEtapes([etape]);
              }
            }}
            filtreTechnicien={filtreTechnicien}
            currentUser={user}
          />

        ) : showMessages ? (
          <ChatFullScreen user={user} onClose={() => setShowMessages(false)} />
        ) : (
          <div className="dashboard-content">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Tableau de bord</h2>
              {prochainRdv ? (
                <div
                  onClick={() => setShowPlanningPose(true)}
                  className="bg-white/70 w-[350px] backdrop-blur-lg shadow rounded-xl px-5 py-3 text-sm text-gray-800 cursor-pointer dark:bg-[#353c42] dark:border-gray-800">
                  <p className="font-semibold mb-1 dark:text-white">Prochain rendez-vous :</p>
                  <p>
                    <span className="text-primary font-medium dark:text-white">{prochainRdv.nom_interlocuteur}</span>
                    <span className="ml-1 text-gray-600 dark:text-white">à {prochainRdv.Commune}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Du{" "}
                    <strong>
                      {new Date(prochainRdv.date_debut_pose).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </strong>{" "}
                    au{" "}
                    <strong>
                      {new Date(prochainRdv.date_fin_pose).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </strong>
                  </p>
                </div>
              ) : (
                <div className="bg-white/70 backdrop-blur-lg shadow rounded-xl px-5 py-3 text-sm text-gray-600 italic">
                  Aucun rendez-vous planifié
                </div>
              )}
            </div>
            <div className="flex justify-between items-center my-6">
              <WelcomeBanner user={user} />
            </div>
            <DashboardStats
              total={visites.length}
              nonCommences={dossiersNonCommences}
              enCours={dossiersEnCours}
              termines={dossiersTermines}
              onFilterClick={(filtre) => {
                setFiltreEtapes(filtre);
                setShowAllClients(true);
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">
              {/* Colonne 1 : Liste des demandes */}
              <div>
                <ListeDemandes
                  visites={visites}
                  onSelectClient={handleSelectClient}
                  getEtapeStyle={getEtapeStyle}
                  onVoirTous={() => setShowAllClients(true)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Colonne 2 : Activités récentes */}
              <div className="flex flex-col">
                  <RecentActivities user={user} onShowHistory={() => setShowHistoryDetail(true)} />
              </div>
              <div>
                <CamembertStats
                  nonCommences={dossiersNonCommences}
                  enCours={dossiersEnCours}
                  termines={dossiersTermines}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">
              <div>
                <RendezVousPlanifies onVoirTout={() => setShowPlanningPose(true)} />
              </div>
            </div>
          </div>
        )}

      </main>

      <ChatWidget
        user={user}
        showMessages={showMessages}
        onSelectChat={(id, name) => {
          setSelectedMiniChatUser({ id, name });
          setShowFullChat(true);
        }}
      />

      {showFullChat && (
        <div className="fixed bottom-24 right-6 w-[420px] h-[520px] z-50 shadow-xl">
          <div className="bg-white rounded-xl h-full overflow-hidden border">
            <ChatFullScreen
              user={user}
              forcedUser={selectedMiniChatUser}
            />
          </div>
        </div>
      )}

      {showSettingsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] h-[90%] overflow-auto relative">
            <button
              onClick={() => setShowSettingsPopup(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
            >
              x
            </button>
            <h2 className="text-2xl font-bold text-primary mb-4">Paramètres</h2>
            <div className="space-y-4 text-sm">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-700">Nom d'utilisateur :</p>
                <p className="text-gray-900">{user.name}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-700">Email :</p>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl flex justify-between items-center">
                <span className="text-gray-700 font-semibold">Mode clair / sombre</span>
                <button className="bg-primary text-white px-4 py-1 rounded">Changer</button>
              </div>
              <div className="pt-6">
                <button
                  onClick={onLogout}
                  className="text-red-600 bg-red-100 hover:bg-red-200 px-4 py-2 rounded"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
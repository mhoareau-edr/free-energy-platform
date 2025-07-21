import { useEffect, useState, useRef } from "react";
import {
  FaClipboardList,
  FaTimesCircle,
  FaCheckCircle,
  FaTrashAlt,
  FaFilePdf,
  FaCamera,
  FaWrench,
} from "react-icons/fa";
import toast from "react-hot-toast";
import io from "socket.io-client";
import ClientDetail from "../components/ClientDetail";
import HistoriqueDetail from "../components/HistoriqueDetail";
import PlanningPose from "../components/PlanningPose";
import RecentActivities from "../components/RecentActivities";
import DashboardStats from "../components/DashboardStats";
import ListeDemandes from "../components/ListeDemandes";
import RendezVousPlanifies from "../components/RendezVousPlanifies";
import Clients from "../components/Clients";
import CamembertStats from "../components/CamembertStats";
import WelcomeBanner from "../components/WelcomeBanner";
import ChatFullScreen from "@/components/Chat/ChatFullScreen";
import Header from "@/components/Header";
import RepartitionParTechnicien from "../components/RepartitionParTechnicien";
const API = import.meta.env.VITE_API_URL;

const socket = io(API);

export default function DashboardAdministratif({ user, onLogout }) {
  const [visites, setVisites] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [showPlanningPose, setShowPlanningPose] = useState(false);
  const [showAllClients, setShowAllClients] = useState(false);
  const [showHistoryDetail, setShowHistoryDetail] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filtreEtapes, setFiltreEtapes] = useState([]);
  const [filtreTechnicien, setFiltreTechnicien] = useState(null);
  const searchRef = useRef(null);
  

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Administratif");

  const fetchVisites = async () => {
    const res = await fetch(`${API}/visites`);
    const data = await res.json();
    setVisites(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const fetchUsers = async () => {
    const res = await fetch(`${API}/users`);
    const data = await res.json();
    setUsers(data);
  };

  const dossiersNonCommences = visites.filter(v => v.etape === "Demande de VT").length;
  const dossiersEnCours = visites.filter(v => ["Visite Technique", "DP", "RAC", "VAD", "Pose"].includes(v.etape)).length;
  const dossiersTermines = visites.filter(v => v.etape === "Terminé").length;

  useEffect(() => {
    fetchVisites();
    fetchUsers();

    const interval = setInterval(fetchVisites, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateUser = async () => {
    const newUser = { name, displayName, email, password, role };
    const res = await fetch(`${API}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      toast.success("Utilisateur créé !");
      fetchUsers();
      setName(""); setEmail(""); setPassword(""); setDisplayName(""); setRole("Administratif");
      setShowForm(false);
    } else {
      toast.error("Erreur lors de la création");
    }
  };

  return (
    <div className="dashboard-container">
      <Header
        user={user}
        searchRef={searchRef}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        visites={visites}
        getEtapeStyle={() => ""}
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
        ) : showPlanningPose ? (
          <PlanningPose user={user} onClose={() => setShowPlanningPose(false)} />
        ) : selectedClient ? (
          <ClientDetail
            visite={selectedClient}
            onClose={() => setSelectedClient(null)}
            user={user}
            refreshVisites={fetchVisites}
            refreshActivities={() => { }}
          />
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
            filtreTechnicien={filtreTechnicien} // 👈 ici !
          />
        ) : showMessages ? (
          <ChatFullScreen user={user} onClose={() => setShowMessages(false)} />
        ) : (
          <div className="dashboard-content">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Tableau de bord</h2>
              <button onClick={() => setShowForm(true)} className="demandevt">
                Créer un utilisateur
              </button>
            </div>

            <div className="flex justify-between items-center my-6">
              <WelcomeBanner user={user} />
            </div>

            <DashboardStats
              total={visites.length}
              nonCommences={dossiersNonCommences}
              enCours={dossiersEnCours}
              termines={dossiersTermines}
              onFilterClick={(f) => {
                setFiltreEtapes(f);
                setShowAllClients(true);
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="flex flex-col">
                <ListeDemandes
                  visites={visites}
                  onSelectClient={setSelectedClient}
                  getEtapeStyle={() => ""}
                  onVoirTous={() => setShowAllClients(true)}
                />
                <RendezVousPlanifies onVoirTout={() => setShowPlanningPose(true)} />
                <div className="mt-6">
                  <RecentActivities user={user} onShowHistory={() => setShowHistoryDetail(true)} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow border">
                <h2 className="text-xl font-semibold mb-4">Liste des utilisateurs</h2>
                {users.length === 0 ? (
                  <p className="text-gray-500">Aucun utilisateur.</p>
                ) : (
                  <ul className="space-y-3 text-sm">
                    {users.map((u) => (
                      <li
                        key={u.id}
                        className="bg-gray-50 p-3 rounded-lg shadow-sm border flex justify-between items-center"
                      >
                        <div>
                          <strong>{u.name}</strong> – {u.email} ({u.role})
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="my-3">
                  <RepartitionParTechnicien
                    onSelectTechnicien={(nom) => {
                      setFiltreTechnicien(nom);
                      setShowAllClients(true);
                    }}
                  />
                </div>
                <CamembertStats
                                  nonCommences={dossiersNonCommences}
                                  enCours={dossiersEnCours}
                                  termines={dossiersTermines}
                                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de création utilisateur */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] md:w-[500px] max-h-[90vh] overflow-auto relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-primary mb-4">Créer un utilisateur</h2>
            <div className="space-y-4">
              <input className="form-input w-full" placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="form-input w-full" placeholder="Pseudo (ex: Auréla)" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              <input className="form-input w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="form-input w-full" placeholder="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <select className="form-input w-full" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Administratif">Administratif</option>
                <option value="Technique">Technicien</option>
              </select>
              <button onClick={handleCreateUser} className="primary-button w-full">Ajouter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

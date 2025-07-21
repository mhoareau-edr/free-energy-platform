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
import toast from "react-hot-toast";
import { useRef } from "react";
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
import { socket } from "../socket";
import ChatWidget from "@/components/Chat/ChatWidget";

const iconMap = {
  FaTimesCircle: <FaTimesCircle className="text-red-500" />,
  FaTrashAlt: <FaTrashAlt className="text-red-500" />,
  FaClipboardList: <FaClipboardList className="text-blue-500" />,
  FaCheckCircle: <FaCheckCircle className="text-green-500" />,
  FaFilePdf: <FaFilePdf className="text-purple-500" />,
  FaCamera: <FaCamera className="text-yellow-500" />,
  FaWrench: <FaWrench className="text-orange-500" />
};

const defaultColor = "bg-gray-400";

const API = import.meta.env.VITE_API_URL;

export default function DashboardUtilisateur({ user, onLogout }) {

  const [client, setClient] = useState("");
  const [adresse, setAdresse] = useState("");
  const [details, setDetails] = useState({
    puissance_souhaitée: "",
    code_postal: "",
    Commune: "",
    nom_interlocuteur: "",
    fonction_interlocuteur: "",
    mail_interlocuteur: "",
    tel_interlocuteur: "",
    commercial_vt: "",
    stockage_text: "",
    oui_revente: false,
    non_revente: false,
    oui_maintenance: false,
    non_maintenance: false,
    type_abonnement: false,
    type_comptant: false,
    commentaires_technique: "",
    client_b2b: false,
    client_b2c: false
  });
  const [visites, setVisites] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [activities, setActivities] = useState([]);
  const [showHistorique, setShowHistorique] = useState(false);
  const [showHistoryDetail, setShowHistoryDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPlanningPose, setShowPlanningPose] = useState(false);
  const [showAllClients, setShowAllClients] = useState(false);
  const [filtreEtapes, setFiltreEtapes] = useState([]);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFullChat, setShowFullChat] = useState(false);
  const [selectedMiniChatUser, setSelectedMiniChatUser] = useState(null);


  const fetchVisites = async () => {
    const res = await fetch(`${API}/visites`);
    const data = await res.json();
    const sortedData = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setVisites(sortedData);
  };

  const searchRef = useRef(null);


  const fetchActivities = async () => {
    const res = await fetch(`${API}/history`);
    const data = await res.json();
    const sortedActivities = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    setActivities(sortedActivities);
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

  const handleReceiveMessage = (message) => {
    const isCurrentConversation =
      selectedUser &&
      (message.senderId === selectedUser.id || message.receiverId === selectedUser.id);

    if (isCurrentConversation) {
      setMessages((prev) => [...prev, message]);
    }

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

  const [seenActivities, setSeenActivities] = useState(() => {
    const stored = localStorage.getItem("seenActivities");
    return stored ? JSON.parse(stored) : [];
  });


  const dossiersNonCommences = visites.filter(v => v.etape === "Demande de VT").length;
  const dossiersEnCours = visites.filter(v =>
    ["Visite Technique", "EDF", "Consuel", "DP", "RAC", "VAD", "Pose", "En attente de documents pour la DP"].includes(v.etape)
  ).length;
  const dossiersTermines = visites.filter(v => v.etape === "Terminé").length;
  const dateFormatee = new Date().toLocaleDateString("fr-FR");

  const demanderVT = async (visite) => {
    const payload = {
      nomSite: client,
      ...visites,
      id: visite.id,
      date_de_la_demande: dateFormatee,
      puissance_souhaitée: details.puissance_souhaitée,
      adresse_pose: adresse,
      code_postal: details.code_postal,
      Commune: details.Commune,
      nom_interlocuteur: details.nom_interlocuteur,
      fonction_interlocuteur: details.fonction_interlocuteur,
      mail_interlocuteur: details.mail_interlocuteur,
      tel_interlocuteur: details.tel_interlocuteur,
      commercial_vt: details.commercial_vt,
      stockage_text: details.stockage_text,
      oui_revente: details.oui_revente,
      non_revente: details.non_revente,
      oui_maintenance: details.oui_maintenance,
      non_maintenance: details.non_maintenance,
      type_abonnement: details.type_abonnement,
      type_comptant: details.type_comptant,
      commentaires_technique: details.commentaires_technique
    };


    const pdfRes = await fetch(`${API}/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (pdfRes.ok) {
      const { pdfPath, bonLivraisonPath, procesVerbalPath } = await pdfRes.json();
      toast.success("Visite Technique demandée !");

      const res = await fetch(`${API}/visites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client,
          adresse,
          demandeur: user.name,
          pdfPath,
          bonLivraisonPath,
          procesVerbalPath,
          details,
          user: user.name,
          type_abonnement: details.type_abonnement,
          type_comptant: details.type_comptant,
          client_b2b: details.client_b2b,
          client_b2c: details.client_b2c
        })
      });

      if (res.ok) {
        const newVisite = await res.json();

        setClient("");
        setAdresse("");
        setDetails({
          puissance_souhaitée: "",
          code_postal: "",
          Commune: "",
          nom_interlocuteur: "",
          fonction_interlocuteur: "",
          mail_interlocuteur: "",
          tel_interlocuteur: "",
          commercial_vt: "",
          stockage_text: "",
          oui_revente: false,
          non_revente: false,
          oui_maintenance: false,
          non_maintenance: false,
          type_abonnement: false,
          type_comptant: false,
          commentaires_technique: "",
          client_b2b: false,
          client_b2c: false
        });

        await fetch("`${API}/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `Visite Technique demandée pour ${visite.nom_interlocuteur || "un client"}.`,
            type: "system",
            target: "Technique",
            senderId: user.id,
            senderName: user.name,
          }),
        });

        setShowForm(false);
        fetchVisites();
        fetchActivities();
        setSelectedClient(newVisite);
      }

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
        ) : showPlanningPose ? (
          <PlanningPose user={user} onClose={() => setShowPlanningPose(false)} />
        ) : selectedClient ? (
          <ClientDetail
            visite={selectedClient}
            onClose={() => setSelectedClient(null)}
            user={user}
            refreshVisites={fetchVisites}
            refreshActivities={fetchActivities}
          />
        ) : showAllClients ? (
          <Clients
            visites={visites}
            onSelectClient={handleSelectClient}
            onClose={() => setShowAllClients(false)}
            getEtapeStyle={getEtapeStyle}
            etapesFiltrees={filtreEtapes}
            onEtapeFilterChange={(etape) => {
              if (etape === "") {
                setFiltreEtapes([]);
              } else {
                setFiltreEtapes([etape]);
              }
            }}
          />
        ) : showMessages ? (
          <ChatFullScreen user={user} onClose={() => setShowMessages(false)} />
        ) : (
          <div className="dashboard-content">

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold dark:text-white">Tableau de bord</h2>

              <button onClick={() => setShowForm(true)} className="demandevt">
                Demander une Visite Technique
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
              onFilterClick={(filtre) => {
                setFiltreEtapes(filtre);
                setShowAllClients(true);
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Colonne 1 : Liste des demandes */}
              <div className="flex flex-col">
                <ListeDemandes
                  visites={visites}
                  onSelectClient={handleSelectClient}
                  getEtapeStyle={getEtapeStyle}
                  onVoirTous={() => setShowAllClients(true)}
                />
                <RendezVousPlanifies onVoirTout={() => setShowPlanningPose(true)} />
              </div>

              {/* Colonne 2 : Activités récentes */}
              <div>
                <CamembertStats
                  nonCommences={dossiersNonCommences}
                  enCours={dossiersEnCours}
                  termines={dossiersTermines}
                />
                <RecentActivities user={user} onShowHistory={() => setShowHistoryDetail(true)} />
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FORMULAIRE MODAL + PARAMETRES POPUP INCHANGEES */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 ">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] md:w-[600px] max-h-[90vh] overflow-auto relative dark:bg-[#1d2125] dark:text-white">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold dark:text-white"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-primary mb-4 dark:text-white">Demander une VT</h2>

            <div className="space-y-8 text-sm ">

              {/* 🧾 INFOS GÉNÉRALES */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2 dark:text-white">Informations du client</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="form-input dark:bg-[#1d2125] dark:border-[#363b41]" placeholder="Nom du commercial *" required value={details.commercial_vt} onChange={e => setDetails({ ...details, commercial_vt: e.target.value })} />
                  <input className="form-input dark:bg-[#1d2125] dark:border-[#363b41]" placeholder="Nom du client *" required value={details.nom_interlocuteur} onChange={e => setDetails({ ...details, nom_interlocuteur: e.target.value })} />
                  <input className="form-input dark:bg-[#1d2125] dark:border-[#363b41]" placeholder="Email du client *" required value={details.mail_interlocuteur} onChange={e => setDetails({ ...details, mail_interlocuteur: e.target.value })} />
                  <input className="form-input dark:bg-[#1d2125] dark:border-[#363b41]" placeholder="Téléphone du client *" required value={details.tel_interlocuteur} onChange={e => setDetails({ ...details, tel_interlocuteur: e.target.value })} />
                  <input className="form-input dark:bg-[#1d2125] dark:border-[#363b41]" placeholder="Adresse de pose *" required value={adresse} onChange={e => setAdresse(e.target.value)} />
                  <input className="form-input dark:bg-[#1d2125] dark:border-[#363b41]" placeholder="Code postal *" required value={details.code_postal} onChange={e => setDetails({ ...details, code_postal: e.target.value })} />
                  <input className="form-input dark:bg-[#1d2125] dark:border-[#363b41]" placeholder="Commune *" required value={details.Commune} onChange={e => setDetails({ ...details, Commune: e.target.value })} />
                  <input className="form-input dark:bg-[#1d2125] dark:border-[#363b41]" placeholder="Puissance souhaitée *" required value={details.puissance_souhaitée} onChange={e => setDetails({ ...details, puissance_souhaitée: e.target.value })} />
                </div>
              </div>

              {/* 📄 TYPE DE CONTRAT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Type de contrat *</label>
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={details.type_abonnement} onChange={e => setDetails({ ...details, type_abonnement: e.target.checked, type_comptant: !e.target.checked })} />
                      Abonnement
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={details.type_comptant} onChange={e => setDetails({ ...details, type_comptant: e.target.checked, type_abonnement: !e.target.checked })} />
                      Comptant
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Revente du surplus *</label>
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={details.oui_revente} onChange={e => setDetails({ ...details, oui_revente: e.target.checked, non_revente: !e.target.checked })} />
                      Oui
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={details.non_revente} onChange={e => setDetails({ ...details, non_revente: e.target.checked, oui_revente: !e.target.checked })} />
                      Non
                    </label>
                  </div>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Contrat de maintenance *</label>
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={details.oui_maintenance} onChange={e => setDetails({ ...details, oui_maintenance: e.target.checked, non_maintenance: !e.target.checked })} />
                      Oui
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={details.non_maintenance} onChange={e => setDetails({ ...details, non_maintenance: e.target.checked, oui_maintenance: !e.target.checked })} />
                      Non
                    </label>
                  </div>
                </div>
                {/* 🆕 TYPE DE CLIENT */}
                <div>
                  <label className="font-semibold block mb-1">Type de client *</label>
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={details.client_b2b}
                        onChange={e =>
                          setDetails({
                            ...details,
                            client_b2b: e.target.checked,
                            client_b2c: !e.target.checked
                          })
                        }
                      />
                      BtoB
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={details.client_b2c}
                        onChange={e =>
                          setDetails({
                            ...details,
                            client_b2c: e.target.checked,
                            client_b2b: !e.target.checked
                          })
                        }
                      />
                      BtoC
                    </label>
                  </div>
                </div>
              </div>
              {/* ⚙️ DONNÉES TECHNIQUES */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2 dark:text-white">Informations techniques</h3>
                <input className="form-input mt-4  dark:bg-[#1d2125] dark:border-[#363b41]" placeholder="Batterie (stockage) *" required value={details.stockage_text} onChange={e => setDetails({ ...details, stockage_text: e.target.value })} />
                <textarea className="form-input mt-4 w-full  dark:bg-[#1d2125] dark:border-[#363b41]" rows={3} placeholder="Commentaires techniques (facultatif)" value={details.commentaires_technique} onChange={e => setDetails({ ...details, commentaires_technique: e.target.value })} />
              </div>

              <button onClick={demanderVT} className="primary-button w-full mt-4">Envoyer la demande</button>
            </div>
          </div>
        </div>
      )}

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
              ×
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

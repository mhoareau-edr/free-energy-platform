import { useState, useEffect } from "react";
import EtapesTracker from "../components/EtapesTracker";
import DPTechnique from "../components/DPTechnique";
import DocumentsClient from "../components/DocumentsClient";
import VADSection from "../components/VADSection";
import "../styles/style.css";
import toast from "react-hot-toast";
import CalendarPose from "../components/CalendarPose";
import FormulaireTechnique from "./FormulaireTechnique";
import DPAdministrative from "./DPAdministrative";
import ListePoses from "./ListePoses";
import DetailsPoseClient from "./DetailsPoseClient";
import UploaderPhotosPose from "./UploaderPhotosPose";
import moment from "moment";
import confetti from "canvas-confetti";
import ClientHistory from "../components/ClientHistory";

export default function ClientDetail({ visite, onClose, user, refreshVisites, refreshActivities }) {
  const [activeTab, setActiveTab] = useState("suivi");
  const [pdfTimestamp] = useState(Date.now());
  const currentEtape = visite.etape || "Demande de VT";

  const [docRefreshFlag, setDocRefreshFlag] = useState(false);
  const [fichePDFUrl, setFichePDFUrl] = useState(null);
  const [dateRaccordement, setDateRaccordement] = useState(visite.date_raccordement || "");
  const [locked, setLocked] = useState(visite.locked || false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedNewUser, setSelectedNewUser] = useState("");
  const [posePhotos, setPosePhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [consuelUrl, setConsuelUrl] = useState(null);
  const start = moment(visite.createdAt);
  const end = moment(visite.date_fin_pose);
  const duration = moment.duration(end.diff(start));

  const API = import.meta.env.VITE_API_URL;

  const months = Math.floor(duration.asMonths());
  const days = duration.subtract(months, 'months').days();

  const triggerDocumentRefresh = () => setDocRefreshFlag(prev => !prev);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Voulez-vous vraiment supprimer ce client ?");
    if (!confirmDelete) return;

    const res = await fetch(`${API}/visites/${visite.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user: user.name
      })
    });

    if (res.ok) {
      toast.success("Client supprimé avec succès");
      if (refreshVisites) refreshVisites();
      if (refreshActivities) refreshActivities();
      onClose();
    } else {
      toast.error("Erreur lors de la suppression");
    }
  };

  const refreshClient = async () => {
    const res = await fetch(`${API}/visites/${visite.id}`);
    const updated = await res.json();
    Object.assign(visite, updated);
  };

  useEffect(() => {
    const fetchMainPDF = async () => {
      const res = await fetch(`${API}/visites/${visite.id}/documents?path=/1. Pièces Administratives`);
      const docs = await res.json();
      const fichePDF = docs.find(d =>
        d.nom === "Fiche Visite Technique" || d.nom === "Fiche_Visite_Technique.pdf"
      );

      if (fichePDF) {
        setFichePDFUrl(`${API}/${fichePDF.chemin}`);
      }
    };

    fetchMainPDF();
  }, [visite]);

  return (
    <div className="client-detail-wrapper">
      <div className="client-detail-container dark:bg-[#121417] dark:border-0 ">
        {/* LEFT COLUMN */}
        <div className="client-left-column p-4 bg-white shadow-sm text-sm text-gray-800 dark:bg-[#121417] dark:border-0 ">
          <div className="flex flex-col gap-4 flex-grow">
            <button onClick={onClose} className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded">
              ← Revenir à la liste
            </button>

            <h2 className="text-lg font-bold text-blue-700 flex items-center gap-2 dark:text-white">
              Infos client
            </h2>

            <div className="space-y-3">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span>👤</span>
                  <div>
                    <p className="text-gray-600 font-medium dark:text-white">Nom du client</p>
                    <p className="dark:text-white">{visite.nom_interlocuteur || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span>📍</span>
                  <div>
                    <p className="text-gray-600 font-medium dark:text-white">Adresse de pose</p>
                    <p className="dark:text-white">{visite.adresse_pose || "—"}</p>
                    <p className="dark:text-white">{visite.code_postal || "—"} {visite.Commune || ""}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span>✉️</span>
                  <div>
                    <p className="text-gray-600 font-medium dark:text-white">Email</p>
                    <p className="dark:text-white">{visite.mail_interlocuteur || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span>📞</span>
                  <div>
                    <p className="text-gray-600 font-medium dark:text-white">Téléphone</p>
                    <p className="dark:text-white">{visite.tel_interlocuteur || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span>🏷️</span>
                  <div>
                    <p className="text-gray-600 font-medium dark:text-white">Type de client</p>
                    <span className={`inline-block text-xs font-semibold px-4 py-1 my-1 rounded-full 
          ${visite.client_b2b ? "bg-purple-100 text-purple-700"
                        : visite.client_b2c ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"}`}>
                      {visite.client_b2b ? "BtoB" : visite.client_b2c ? "BtoC" : "Non précisé"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span>📝</span>
                  <div>
                    <p className="text-gray-600 font-medium dark:text-white">Demandée par</p>
                    <p className="dark:text-white">{visite.demandeur || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <a
              href={`${API}${visite.pdfPath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded"
            >
              📄 Voir / Télécharger le PDF
            </a>

            {user.role === "Technique" && (
              <>
                <button
                  className={`w-full font-semibold py-2 rounded ${locked ? "bg-red-500 text-white" : "bg-blue-500 text-white"}`}
                  onClick={async () => {
                    const res = await fetch(`${API}/visites/${visite.id}/lock`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ locked: !locked })
                    });
                    if (res.ok) {
                      toast.success(locked ? "Dossier déverrouillé" : "Dossier verrouillé");
                      setLocked(!locked);
                    } else {
                      toast.error("Erreur lors du verrouillage");
                    }
                  }}
                >
                  {locked ? "🔓 Déverrouiller le dossier" : "🔒 Verrouiller le dossier"}
                </button>

                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded"
                  onClick={async () => {
                    const res = await fetch(`${API}/users`);
                    const data = await res.json();
                    if (Array.isArray(data)) {
                      setAvailableUsers(data.filter(u => u.role === "Technique" && u.name !== user.name));
                    } else {
                      console.warn("Format inattendu des utilisateurs :", data);
                      setAvailableUsers([]);
                    }
                    setShowTransferModal(true);
                  }}
                >
                  🔁 Transférer le dossier
                </button>
              </>
            )}

            <button
              onClick={handleDelete}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded"
            >
              🗑️ Supprimer le client
            </button>
          </div>
        </div>


        {/* CENTER COLUMN */}
        <div className="client-center-column">
          <div className="client-tabs">
            {["suivi", "photos", "documents", "historique"].map((tab) => (
              <button
                key={tab}
                className={`client-tab-button dark:text-white ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "suivi"
                  ? "Suivi de dossier"
                  : tab === "photos"
                  ? "Photos de la pose"
                  : tab === "documents"
                  ? "Documents"
                  : "Historique du client"}
              </button>
            ))}

          </div>


          <div className="tab-content ">
            {activeTab === "suivi" && (
              <div className="suivi-section">
                <h3 className="etat-statut">{`État actuel : ${currentEtape}`}</h3>
                <EtapesTracker status={currentEtape} />

                {/* Rendu spécifique TECHNIQUE */}
                {user.role?.toLowerCase() === "technique" ? (
                  <>
                    {["Visite Technique", "Visite Technique incomplète"].includes(currentEtape) && (
                      <FormulaireTechnique
                        visite={visite}
                        user={user}
                        onSaved={() => {
                          refreshVisites();
                          refreshActivities();
                          onClose();
                        }}
                      />
                    )}

                    {currentEtape === "Demande de VT" && (
                      <div className="form-section2">
                        <h3 className="form-section-title">Demande de Visite Technique</h3>
                        <p className="text-blue-600 text-sm mt-2">PDF généré lors de la demande.</p>
                        {fichePDFUrl && (
                          <iframe
                            src={fichePDFUrl}
                            title="PDF Client"
                            className="pdf-viewer mt-4"
                          />
                        )}
                      </div>
                    )}

                    {currentEtape === "Terminé" && (
                      <div className="mt-6 space-y-8 text-gray-800 dark:text-white pr-6">
                        {/* Bannière principale */}
                        <div className="bg-green-100 border border-green-300 p-6 rounded shadow dark:bg-[#1d2125] dark:border-0">
                          <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                            <span
                              onClick={() => {
                                const duration = 2000;
                                const animationEnd = Date.now() + duration;
                                const defaults = {
                                  startVelocity: 30,
                                  spread: 360,
                                  ticks: 60,
                                  zIndex: 1000,
                                };

                                const interval = setInterval(() => {
                                  const timeLeft = animationEnd - Date.now();

                                  if (timeLeft <= 0) {
                                    clearInterval(interval);
                                    return;
                                  }

                                  const particleCount = Math.floor(Math.random() * (100 - 50 + 1)) + 50;

                                  confetti({
                                    ...defaults,
                                    particleCount,
                                    origin: {
                                      x: Math.random(),
                                      y: Math.random() - 0.2
                                    }
                                  });
                                }, 275);
                              }}
                              className="inline-block cursor-pointer"
                              title="Clique !"
                            >
                              🎉
                            </span>{" "}
                            Projet terminé avec succès !
                          </h3>
                          <p className="text-sm">
                            Félicitations ! Toutes les étapes ont été validées. Le projet est officiellement clôturé. Vous pouvez consulter les documents, les photos et l’historique à tout moment.
                          </p>
                          <button
                          onClick={async () => {
                            const JSZip = (await import("jszip")).default;
                            const { saveAs } = await import("file-saver");

                            const zip = new JSZip();

                            const allItems = await fetch(`${API}/visites/${visite.id}/documents/full-tree`)
                              .then(res => res.json());

                            await Promise.all(
                              allItems.map(async (item) => {
                                const pathInZip = item.relativePath;

                                if (item.type === "folder") {
                                  zip.folder(pathInZip); // crée le dossier même vide
                                } else {
                                  try {
                                    const url = `${API}/uploads/visite-${visite.id}/${item.relativePath}`;
                                    const response = await fetch(url);
                                    if (!response.ok) return;
                                    const blob = await response.blob();
                                    zip.file(pathInZip, blob);
                                  } catch (err) {
                                    console.warn(`⚠️ Erreur pour ${item.relativePath}`, err);
                                  }
                                }
                              })
                            );

                            const content = await zip.generateAsync({ type: "blob" });
                            saveAs(content, `Rapport_${visite.nom_interlocuteur || "client"}.zip`);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-4 rounded shadow mt-6"
                        >
                          Exporter un rapport global du projet
                        </button>

                        </div>

                        {/* Récap informations */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-white dark:bg-[#1d2125] border p-4 rounded shadow space-y-2">
                            <h4 className="font-semibold text-primary mb-2 dark:text-white">📋 Informations client</h4>
                            <p><strong>👤 Nom :</strong> {visite.nom_interlocuteur || "—"}</p>
                            <p><strong>📍 Adresse :</strong> {visite.adresse_pose || "—"}, {visite.Commune || ""}</p>
                            <p><strong>📞 Téléphone :</strong> {visite.tel_interlocuteur || "—"}</p>
                            <p><strong>✉️ Email :</strong> {visite.mail_interlocuteur || "—"}</p>
                            <p><strong>💡 Type :</strong> {visite.client_b2b ? "BtoB" : visite.client_b2c ? "BtoC" : "Non précisé"}</p>
                            <a
                              href={`${API}/${visite.pdfPath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full text-center bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold"
                            >
                              Télécharger la fiche Visite Technique
                            </a>
                          </div>

                          <div className="bg-white dark:bg-[#1d2125] border p-4 rounded shadow space-y-2">
                            <h4 className="font-semibold text-primary mb-2 dark:text-white">📅 Dates importantes</h4>
                            <p><strong>Date de la demande :</strong> {new Date(visite.createdAt).toLocaleDateString("fr-FR")}</p>
                            {visite.date_debut_pose && (
                              <p><strong>Début pose :</strong> {new Date(visite.date_debut_pose).toLocaleDateString("fr-FR")}</p>
                            )}
                            {visite.date_fin_pose && (
                              <p><strong>Fin pose :</strong> {new Date(visite.date_fin_pose).toLocaleDateString("fr-FR")}</p>
                            )}
                            {visite.createdAt && visite.date_fin_pose && (
                              <div className="bg-white dark:bg-[#1d2125] border p-4 rounded shadow space-y-1 dark:border-gray-600">
                                <h4 className="font-semibold text-primary mb-1 dark:text-white">⏳ Durée totale du projet</h4>
                                <p className="text-sm text-gray-800 dark:text-white">
                                  {months > 0 && `${months} mois`} {days > 0 && `${days} jours`}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Accès aux documents & photos */}
                        <div className="grid md:grid-cols-1 gap-6">
                          <div className="bg-white dark:bg-[#1d2125] border p-4 rounded shadow col-span-1">
                            <h4 className="font-semibold mb-2 text-primary dark:text-white">🖼️ Photos de la pose</h4>
                            {visite.photos?.length > 0 ? (
                              <>
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                  {visite.photos.slice(0, 6).map((photo, index) => (
                                    <img
                                      key={index}
                                      src={`${API}/${photo}`}
                                      alt={`Photo ${index + 1}`}
                                      className="w-full h-full object-cover rounded shadow cursor-pointer hover:scale-105 transition-transform"
                                      onClick={() => setActiveTab("photos")}
                                    />
                                  ))}
                                </div>
                                <button
                                  onClick={() => setActiveTab("photos")}
                                  className="text-sm text-white bg-red-600 hover:bg-red-700 py-2 px-4 rounded font-medium mt-1 w-full"
                                >
                                  Voir toutes les photos
                                </button>
                              </>
                            ) : (
                              <p className="text-gray-400 italic">Aucune photo n'a été enregistrée.</p>
                            )}
                          </div>

                        </div>
                      </div>
                    )}

                    {currentEtape === "DP" && (
                      <DPTechnique
                        visite={visite}
                        user={user}
                        onSaved={() => {
                          refreshVisites();
                          refreshActivities();
                          onClose();
                        }}
                      />
                    )}

                    {currentEtape === "Demande de DP" && (
                      <DPAdministrative
                        visite={visite}
                        user={user}
                        onUpdated={() => {
                          refreshVisites();
                          refreshActivities();
                          onClose();
                        }}
                      />
                    )}

                    {currentEtape === "En attente de documents pour la DP" && (
                      <DPTechnique
                        visite={visite}
                        user={user}
                        onSaved={() => {
                          refreshVisites();
                          refreshActivities();
                          onClose();
                        }}
                      />
                    )}

                    {currentEtape === "VAD" && (
                      <VADSection
                        visiteId={visite.id}
                        onValidated={() => {
                          refreshVisites();
                          refreshActivities();
                          onClose();
                        }}
                      />
                    )}

                    {currentEtape === "RAC" && (
                      <div className="form-section2 dark:text-white">
                        <p className="text-sm text-gray-700 mb-3 dark:text-white">
                          Étape actuelle : <strong>Raccordement</strong>
                        </p>

                        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded mb-4">
                          <p className="font-medium mb-2">Des documents sont manquants pour la DP ?</p>
                          <p className="text-sm mb-3">Vous pouvez revenir à l'étape précédente pour permettre les corrections nécessaires.</p>
                          <button
                            className="secondary-button bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded"
                            onClick={async () => {
                              const confirm = window.confirm("Confirmer le retour à l'étape 'En attente de documents pour la DP' ?");
                              if (!confirm) return;

                              const res = await fetch(`${API}/visites/${visite.id}/etape`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  etape: "En attente de documents pour la DP",
                                  user: user.name
                                })
                              });

                              if (res.ok) {
                                toast.success("Étape remise à 'DP incomplète'");
                                if (refreshVisites) refreshVisites();
                                if (refreshActivities) refreshActivities();
                                onClose();
                              } else {
                                toast.error("Erreur lors du changement d'étape");
                              }
                            }}
                          >
                            Revenir à l'étape "DP"
                          </button>
                        </div>
                        <DocumentsClient
                          visiteId={visite.id}
                          visite={visite}
                          refreshTrigger={docRefreshFlag}
                          onUpdateDocuments={triggerDocumentRefresh}
                        />
                      </div>
                    )}

                    {currentEtape === "Pose" && (
                      <div className="mt-6 space-y-4">
                        <DetailsPoseClient visiteId={visite.id} />
                        <UploaderPhotosPose onFilesReady={setPosePhotos} />
                        {(!visite.date_debut_pose || !visite.date_fin_pose) ? (
                          <div className="form-section2">
                            <CalendarPose
                              visite={visite}
                              user={user}
                              onDateSelected={(date) => {
                                toast.success(`Client prévu le ${new Date(date).toLocaleDateString("fr-FR")}`);
                              }}
                            />
                          </div>
                        ) : (

                          <button
                            onClick={async () => {
                              const confirm = window.confirm("Confirmer que la pose est terminée et passer à l'étape 'Consuel' ?");
                              if (!confirm) return;

                              if (posePhotos.length > 0) {
                                const formData = new FormData();
                                posePhotos.forEach(file => formData.append("photos", file));
                                formData.append("user", user.name);

                                await fetch(`${API}/visites/${visite.id}/photos`, {
                                  method: "POST",
                                  body: formData
                                });
                              }

                              await fetch(`${API}/visites/${visite.id}/etape`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ etape: "Consuel", user: user.name }),
                              });

                              toast.success("Étape suivante : Consuel !");
                              refreshVisites();
                              refreshActivities();
                              onClose();
                            }}

                            className="primary-button"
                          >
                            Pose terminée
                          </button>
                        )}
                      </div>
                    )}

                    {currentEtape === "Consuel" && (
                      <div className="mt-6 space-y-6">
                        <p className="text-sm text-gray-700">
                          Étape actuelle : <strong>Consuel</strong>
                        </p>

                        <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 space-y-4 shadow dark:bg-[#1d2125] dark:border-0">
                          <p className="text-sm text-gray-800 dark:text-white">
                            Cette étape correspond à l’attente ou à la validation du <strong>Consuel</strong>. Vous pouvez déposer le document reçu ici, puis valider l'étape.
                          </p>

                          {/* Zone de dépôt stylisée */}
                          <label className="block w-full cursor-pointer">
                            <span className="block text-gray-600 font-medium mb-2 dark:text-white">Ajouter le document Consuel (PDF)</span>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                const formData = new FormData();
                                formData.append("file", file);
                                formData.append("nom", file.name);
                                formData.append("path", "2. Déclaration admin/3. Consuel");

                                try {
                                  const res = await fetch(`${API}/visites/${visite.id}/documents`, {
                                    method: "POST",
                                    body: formData
                                  });

                                  if (res.ok) {
                                    toast.success("📄 Consuel ajouté avec succès");
                                    setDocRefreshFlag(prev => !prev);
                                  } else {
                                    toast.error("Erreur lors de l'ajout du Consuel");
                                  }
                                } catch (err) {
                                  console.error("Erreur upload Consuel :", err);
                                  toast.error("Échec de l'envoi");
                                }
                              }}
                              className="block cursor-pointer w-full text-sm text-gray-500 border border-gray-300 rounded-lg shadow-sm p-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                            />
                          </label>

                          {/* Bouton valider */}
                          <div className="flex justify-start">
                            <button
                              onClick={async () => {
                                const confirm = window.confirm("Passer à l'étape suivante ?");
                                if (!confirm) return;

                                await fetch(`${API}/visites/${visite.id}/etape`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ etape: "EDF", user: user.name }),
                                });
                                refreshVisites();
                                refreshActivities();
                                onClose();
                              }}
                              className="bg-red-600 text-white font-semibold px-6 py-2 rounded hover:bg-red-700 shadow"
                            >
                              Valider le Consuel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentEtape === "EDF" && (
                      <div className="mt-6 space-y-4">
                        <p className="text-sm text-gray-700">
                          Étape actuelle : <strong>Demande de mise en service EDF</strong>
                        </p>

                        <div className="bg-blue-100 border border-blue-300 p-4 rounded">
                          <p className="text-sm mb-3 dark:text-black">
                            Cette étape concerne la demande de mise en service auprès d'EDF.
                          </p>

                          <button
                            onClick={async () => {
                              const confirm = window.confirm("Valider la mise en service ?");
                              if (!confirm) return;

                              await fetch(`${API}/visites/${visite.id}/etape`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ etape: "Terminé", user: user.name }),
                              });

                              toast.success("Projet marqué comme terminé !");
                              refreshVisites();
                              refreshActivities();
                              onClose();
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                          >
                            Valider la mise en service EDF
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Rendu spécifique ADMINISTRATIF
                  <div className="mt-6">
                    {currentEtape === "Consuel" && (
                      <div className="mt-6 space-y-6">
                        <p className="text-sm text-gray-700">
                          Étape actuelle : <strong>Consuel</strong>
                        </p>

                        <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 space-y-4 shadow dark:bg-[#1d2125] dark:border-0">
                          <p className="text-sm text-gray-800 dark:text-white">
                            Cette étape correspond à l’attente ou à la validation du <strong>Consuel</strong>. Vous pouvez déposer le document reçu ici, puis valider l'étape.
                          </p>

                          {/* Zone de dépôt stylisée */}
                          <label className="block w-full cursor-pointer">
                            <span className="block text-gray-600 font-medium mb-2 dark:text-white">Ajouter le document Consuel (PDF)</span>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                const formData = new FormData();
                                formData.append("file", file);
                                formData.append("nom", file.name);
                                formData.append("path", "2. Déclaration admin/3. Consuel");

                                try {
                                  const res = await fetch(`${API}/visites/${visite.id}/documents`, {
                                    method: "POST",
                                    body: formData
                                  });

                                  if (res.ok) {
                                    toast.success("📄 Consuel ajouté avec succès");
                                    setDocRefreshFlag(prev => !prev);
                                  } else {
                                    toast.error("Erreur lors de l'ajout du Consuel");
                                  }
                                } catch (err) {
                                  console.error("Erreur upload Consuel :", err);
                                  toast.error("Échec de l'envoi");
                                }
                              }}
                              className="block cursor-pointer w-full text-sm text-gray-500 border border-gray-300 rounded-lg shadow-sm p-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                            />
                          </label>

                          {/* Bouton valider */}
                          <div className="flex justify-start">
                            <button
                              onClick={async () => {
                                const confirm = window.confirm("Passer à l'étape suivante ?");
                                if (!confirm) return;

                                await fetch(`${API}/visites/${visite.id}/etape`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ etape: "EDF", user: user.name }),
                                });
                                refreshVisites();
                                refreshActivities();
                                onClose();
                              }}
                              className="bg-red-600 text-white font-semibold px-6 py-2 rounded hover:bg-red-700 shadow"
                            >
                              Valider le Consuel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentEtape === "Terminé" && (
                      <div className="mt-6 space-y-8 text-gray-800 dark:text-white pr-6">
                        {/* Bannière principale */}
                        <div className="bg-green-100 border border-green-300 p-6 rounded shadow dark:bg-[#1d2125] dark:border-0">
                          <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                            <span
                              onClick={() => {
                                const duration = 2000;
                                const animationEnd = Date.now() + duration;
                                const defaults = {
                                  startVelocity: 30,
                                  spread: 360,
                                  ticks: 60,
                                  zIndex: 1000,
                                };

                                const interval = setInterval(() => {
                                  const timeLeft = animationEnd - Date.now();

                                  if (timeLeft <= 0) {
                                    clearInterval(interval);
                                    return;
                                  }

                                  const particleCount = Math.floor(Math.random() * (100 - 50 + 1)) + 50;

                                  confetti({
                                    ...defaults,
                                    particleCount,
                                    origin: {
                                      x: Math.random(),
                                      y: Math.random() - 0.2
                                    }
                                  });
                                }, 275);
                              }}
                              className="inline-block cursor-pointer"
                              title="Clique !"
                            >
                              🎉
                            </span>{" "}
                            Projet terminé avec succès !
                          </h3>
                          <p className="text-sm">
                            Félicitations ! Toutes les étapes ont été validées. Le projet est officiellement clôturé. Vous pouvez consulter les documents, les photos et l’historique à tout moment.
                          </p>
                          <button
                          onClick={async () => {
                            const JSZip = (await import("jszip")).default;
                            const { saveAs } = await import("file-saver");

                            const zip = new JSZip();

                            const allItems = await fetch(`${API}/visites/${visite.id}/documents/full-tree`)
                              .then(res => res.json());

                            await Promise.all(
                              allItems.map(async (item) => {
                                const pathInZip = item.relativePath;

                                if (item.type === "folder") {
                                  zip.folder(pathInZip); // crée le dossier même vide
                                } else {
                                  try {
                                    const url = `${API}/uploads/visite-${visite.id}/${item.relativePath}`;
                                    const response = await fetch(url);
                                    if (!response.ok) return;
                                    const blob = await response.blob();
                                    zip.file(pathInZip, blob);
                                  } catch (err) {
                                    console.warn(`⚠️ Erreur pour ${item.relativePath}`, err);
                                  }
                                }
                              })
                            );

                            const content = await zip.generateAsync({ type: "blob" });
                            saveAs(content, `Rapport_${visite.nom_interlocuteur || "client"}.zip`);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-4 rounded shadow mt-6"
                        >
                          Exporter un rapport global du projet
                        </button>

                        </div>

                        {/* Récap informations */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-white dark:bg-[#1d2125] border p-4 rounded shadow space-y-2">
                            <h4 className="font-semibold text-primary mb-2 dark:text-white">📋 Informations client</h4>
                            <p><strong>👤 Nom :</strong> {visite.nom_interlocuteur || "—"}</p>
                            <p><strong>📍 Adresse :</strong> {visite.adresse_pose || "—"}, {visite.Commune || ""}</p>
                            <p><strong>📞 Téléphone :</strong> {visite.tel_interlocuteur || "—"}</p>
                            <p><strong>✉️ Email :</strong> {visite.mail_interlocuteur || "—"}</p>
                            <p><strong>💡 Type :</strong> {visite.client_b2b ? "BtoB" : visite.client_b2c ? "BtoC" : "Non précisé"}</p>
                            <a
                              href={`${API}/${visite.pdfPath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full text-center bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold"
                            >
                              Télécharger la fiche Visite Technique
                            </a>
                          </div>

                          <div className="bg-white dark:bg-[#1d2125] border p-4 rounded shadow space-y-2">
                            <h4 className="font-semibold text-primary mb-2 dark:text-white">📅 Dates importantes</h4>
                            <p><strong>Date de la demande :</strong> {new Date(visite.createdAt).toLocaleDateString("fr-FR")}</p>
                            {visite.date_debut_pose && (
                              <p><strong>Début pose :</strong> {new Date(visite.date_debut_pose).toLocaleDateString("fr-FR")}</p>
                            )}
                            {visite.date_fin_pose && (
                              <p><strong>Fin pose :</strong> {new Date(visite.date_fin_pose).toLocaleDateString("fr-FR")}</p>
                            )}
                            {visite.createdAt && visite.date_fin_pose && (
                              <div className="bg-white dark:bg-[#1d2125] border p-4 rounded shadow space-y-1 dark:border-gray-600">
                                <h4 className="font-semibold text-primary mb-1 dark:text-white">⏳ Durée totale du projet</h4>
                                <p className="text-sm text-gray-800 dark:text-white">
                                  {months > 0 && `${months} mois`} {days > 0 && `${days} jours`}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Accès aux documents & photos */}
                        <div className="grid md:grid-cols-1 gap-6">
                          <div className="bg-white dark:bg-[#1d2125] border p-4 rounded shadow col-span-1">
                            <h4 className="font-semibold mb-2 text-primary dark:text-white">🖼️ Photos de la pose</h4>
                            {visite.photos?.length > 0 ? (
                              <>
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                  {visite.photos.slice(0, 6).map((photo, index) => (
                                    <img
                                      key={index}
                                      src={`${API}/${photo}`}
                                      alt={`Photo ${index + 1}`}
                                      className="w-full h-full object-cover rounded shadow cursor-pointer hover:scale-105 transition-transform"
                                      onClick={() => setActiveTab("photos")}
                                    />
                                  ))}
                                </div>
                                <button
                                  onClick={() => setActiveTab("photos")}
                                  className="text-sm text-white bg-red-600 hover:bg-red-700 py-2 px-4 rounded font-medium mt-1 w-full"
                                >
                                  Voir toutes les photos
                                </button>
                              </>
                            ) : (
                              <p className="text-gray-400 italic">Aucune photo n'a été enregistrée.</p>
                            )}
                          </div>

                        </div>
                      </div>
                    )}


                    {currentEtape === "EDF" && (
                      <div className="mt-6 space-y-4">
                        <p className="text-sm text-gray-700">
                          Étape actuelle : <strong>Demande de mise en service EDF</strong>
                        </p>

                        <div className="bg-blue-100 border border-blue-300 p-4 rounded">
                          <p className="text-sm mb-3 dark:text-black">
                            Cette étape concerne la demande de mise en service auprès d'EDF.
                          </p>

                          <button
                            onClick={async () => {
                              const confirm = window.confirm("Valider la mise en service ?");
                              if (!confirm) return;

                              await fetch(`${API}/visites/${visite.id}/etape`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ etape: "Terminé", user: user.name }),
                              });

                              toast.success("Projet marqué comme terminé !");
                              refreshVisites();
                              refreshActivities();
                              onClose();
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                          >
                            Valider la mise en service EDF
                          </button>
                        </div>
                      </div>
                    )}

                    {currentEtape === "DP" && user.role === "Administratif" && (
                      <div className="form-section2">
                        <h3 className="form-section-title">Déclaration Préalable</h3>
                        <p className="text-blue-600 text-sm mt-2">En attente des documents pour la demande de DP.</p>
                        {fichePDFUrl && (
                          <iframe
                            src={fichePDFUrl}
                            title="PDF Client"
                            className="pdf-viewer mt-4"
                          />
                        )}
                      </div>
                    )}

                    {currentEtape === "Demande de DP" && user.role === "Administratif" && (
                      <p>En attente du retour de la DP.</p>
                    )}

                    {currentEtape === "En attente de documents pour la DP" && user.role === "Administratif" && (
                      <p>En attente du retour de la DP.</p>
                    )}

                    {currentEtape === "Visite Technique" && (
                      <div className="form-section2">
                        <h3 className="form-section-title">Visite Technique</h3>
                        <p className="text-blue-600 text-sm mt-2">En attente de la visite technique</p>
                        {fichePDFUrl && (
                          <iframe
                            src={fichePDFUrl}
                            title="PDF Client"
                            className="pdf-viewer mt-4 dark:border-0 dark:pr-2"
                          />
                        )}

                      </div>
                    )}
                    {currentEtape === "VAD" && (
                      <VADSection
                        visiteId={visite.id}
                        onValidated={async () => {
                          await refreshClient();
                          if (refreshVisites) refreshVisites();
                          if (refreshActivities) refreshActivities();
                          onClose();
                        }}
                      />
                    )}
                    {currentEtape === "RAC" && (
                      <div className="form-section2">
                        <p className="text-sm text-gray-700 mb-3">
                          Étape actuelle : <strong>Raccordement</strong>
                        </p>

                        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded mb-4">
                          <p className="font-medium mb-2">Des documents sont manquants pour la DP ?</p>
                          <p className="text-sm mb-3">Vous pouvez revenir à l'étape précédente pour permettre les corrections nécessaires.</p>
                          <button
                            className="secondary-button bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded"
                            onClick={async () => {
                              const confirm = window.confirm("Confirmer le retour à l'étape 'En attente de documents pour la DP' ?");
                              if (!confirm) return;

                              const res = await fetch(`${API}/visites/${visite.id}/etape`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  etape: "En attente de documents pour la DP",
                                  user: user.name
                                })
                              });

                              if (res.ok) {
                                toast.success("Étape remise à 'DP incomplète'");
                                if (refreshVisites) refreshVisites();
                                if (refreshActivities) refreshActivities();
                                onClose();
                                await fetch(`${API}/notifications`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    message: `📄 DP Incomplète pour ${visite.nom_interlocuteur || "un client"}. En attente des documents et du retour de la DP.`,
                                    type: "system",
                                    target: "Technique",
                                    senderId: user.id,
                                    senderName: user.name,
                                  }),
                                });
                              } else {
                                toast.error("Erreur lors du changement d'étape");
                              }
                            }}
                          >
                            Revenir à l'étape "DP"
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                            Demande de raccordement faite le :
                          </label>
                          <input
                            type="date"
                            className="form-input dark:bg-[#1d2125] dark:border-0"
                            value={dateRaccordement}
                            onChange={(e) => setDateRaccordement(e.target.value)}
                          />
                        </div>

                        <div className="flex justify-end mt-4">
                          <button
                            onClick={async () => {
                              const confirm = window.confirm("Valider la demande de raccordement ?");
                              if (!confirm) return;

                              const res = await fetch(`${API}/visites/${visite.id}/etape`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  etape: "VAD",
                                  user: user.name,
                                  date_raccordement: dateRaccordement
                                })
                              });


                              if (res.ok) {
                                toast.success("Demande de raccordement validée");
                                if (refreshVisites) refreshVisites();
                                if (refreshActivities) refreshActivities();
                                onClose();
                              } else {
                                toast.error("❌ Erreur lors de la validation");
                              }
                            }}
                            className="primary-button"
                          >
                            Valider la demande de raccordement
                          </button>
                        </div>
                      </div>
                    )}

                    {currentEtape === "Pose" ? (
                      <CalendarPose
                        visite={visite}
                        user={user}
                        onDateSelected={(date) => {
                          toast.success(`Client prévu le ${new Date(date).toLocaleDateString("fr-FR")}`);
                        }}
                      />

                    ) : (

                      <iframe

                      ></iframe>

                    )}


                  </div>
                )}
              </div>
            )}

            {activeTab === "photos" && (
              <div className="mt-4">
                {visite.photos && visite.photos.length > 0 ? (
                  <>
                    <div className="flex justify-start mb-4">
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold"
                        onClick={async () => {
                          const JSZip = (await import("jszip")).default;
                          const { saveAs } = await import("file-saver");

                          const zip = new JSZip();

                          await Promise.all(
                            visite.photos.map(async (photo) => {
                              const response = await fetch(`${API}/${photo}`);
                              const blob = await response.blob();
                              const filename = photo.split("/").pop();
                              zip.file(filename, blob);
                            })
                          );

                          const content = await zip.generateAsync({ type: "blob" });
                          saveAs(content, `Photos_${visite.nom_interlocuteur || "client"}.zip`);
                        }}
                      >
                        Tout télécharger
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {visite.photos.map((photo, index) => (
                        <div key={index} className="w-40 h-40 border rounded overflow-hidden shadow">
                          <img
                            onClick={() => setSelectedPhoto(index)}
                            src={`${API}/${photo}`}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 italic">Aucune photo disponible pour ce client.</p>
                )}
              </div>
            )}

            {showTransferModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded shadow w-[400px]">
                  <h3 className="text-lg font-bold mb-4">Transférer ce dossier</h3>
                  <select
                    className="form-input w-full mb-4"
                    value={selectedNewUser}
                    onChange={(e) => setSelectedNewUser(e.target.value)}
                  >
                    <option value="">Choisir un utilisateur</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-end space-x-2">
                    <button
                      className="px-4 py-2 bg-gray-300 rounded"
                      onClick={() => setShowTransferModal(false)}
                    >
                      Annuler
                    </button>
                    <button
                      className="px-4 py-2 bg-primary text-white rounded"
                      onClick={async () => {
                        const res = await fetch(`${API}/visites/${visite.id}/transfer`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            newUser: selectedNewUser,
                            user: user.name
                          })
                        });

                        if (res.ok) {
                          toast.success("Dossier transféré !");
                          setShowTransferModal(false);
                          refreshVisites();
                          onClose();
                        } else {
                          toast.error("Erreur lors du transfert");
                        }
                      }}
                    >
                      Transférer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <DocumentsClient
                visiteId={visite.id}
                visite={visite}
                refreshTrigger={docRefreshFlag}
                onUpdateDocuments={triggerDocumentRefresh}
              />
            )}

            {activeTab === "historique" && (
              <div className="mt-4">
                <ClientHistory visiteId={visite.id} />
              </div>
            )}

            {selectedPhoto !== null && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                <div className="relative flex items-center gap-4">
                  {/* Bouton gauche */}
                  <button
                    onClick={() => {
                      setSelectedPhoto((prev) => Math.max(prev - 1, 0));
                    }}
                    className="text-white text-3xl px-4 py-2  rounded-full"
                    disabled={selectedPhoto === 0}
                  >
                    ◀
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setSelectedPhoto(null)}
                      className="absolute top-2 right-2 bg-white text-black rounded-full px-3 py-1 shadow"
                    >
                      ✕
                    </button>

                    <img
                      src={`${API}/${visite.photos[selectedPhoto]}`}
                      alt="Aperçu"
                      className="max-w-[60vw] max-h-[60vh] rounded"
                    />

                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `${API}/${visite.photos[selectedPhoto]}`;
                        link.download = visite.photos[selectedPhoto].split("/").pop();
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="block w-full text-center bg-red-700 text-white mt-4 px-4 py-2 rounded shadow hover:bg-red-800 font-semibold"
                    >
                      Télécharger cette photo
                    </button>
                  </div>

                  {/* Bouton droite */}
                  <button
                    onClick={() => {
                      setSelectedPhoto((prev) => Math.min(prev + 1, visite.photos.length - 1));
                    }}
                    className="text-white text-3xl px-4 py-2 rounded-full"
                    disabled={selectedPhoto === visite.photos.length - 1}
                  >
                    ▶
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
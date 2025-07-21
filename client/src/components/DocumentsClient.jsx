import { useEffect, useState } from "react";
import { FaFolder, FaFileAlt, FaFilePdf, FaTrash, FaUpload, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";

const API_URL = "http://10.10.2.106:5000";

export default function DocumentsClient({ visiteId, visite, refreshTrigger, onUpdateDocuments }) {
  const [path, setPath] = useState("/");
  const [items, setItems] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  if (!visiteId) return <p className="text-red-600">❌ Aucun client sélectionné.</p>;

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "document-updated") {
        setRefresh((prev) => !prev);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (!visiteId) return;

    const fetchItems = async () => {
      try {
        const res = await fetch(`${API_URL}/visites/${visiteId}/documents?path=${path}`);
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur récupération documents:", err);
        setItems([]);
      }
    };

    fetchItems();
  }, [visiteId, path, refresh, refreshTrigger]);

  const goToFolder = (folderName) => {
    setPath((prev) => (prev.endsWith("/") ? prev + folderName : prev + "/" + folderName));
  };

  const goBack = () => {
    const parts = path.split("/").filter(Boolean);
    if (parts.length > 0) {
      parts.pop();
      setPath("/" + parts.join("/"));
    }
  };

  const handleUpload = async (e) => {
    console.log("📤 handleUpload appelé", e.target.files);

    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);
    const res = await fetch(`${API_URL}/visites/${visiteId}/documents`, {
      method: "POST",
      body: formData
    });
    setUploading(false);
    if (res.ok) {
      toast.success("Fichier importé !");
      setRefresh(!refresh);
      onUpdateDocuments?.();
    } else {
      toast.error("Échec de l'import");
    }
  };

  const handleCreateFolder = async () => {
    console.log("🚀 handleCreateFolder déclenché", { newFolderName, path });
    if (!newFolderName.trim()) {
      toast.error("❗ Le nom du dossier est vide");
      return;
    }

    const res = await fetch(`${API_URL}/visites/${visiteId}/documents/folder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, name: newFolderName.trim() })
    });

    if (res.ok) {
      toast.success("Dossier créé !");
      setNewFolderName("");
      setRefresh(!refresh);
      localStorage.setItem("document-updated", Date.now().toString());
    } else {
      toast.error("Erreur lors de la création du dossier");
    }
  };


  const handleContextMenu = (e, item) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, item });
  };

  const handleSelect = () => {
    if (contextMenu) setSelectedDoc(contextMenu.item);
    setContextMenu(null);
  };

  const handleDelete = async () => {
    if (!contextMenu) return;
    const confirmDelete = window.confirm("Supprimer ce fichier ?");
    if (!confirmDelete) return;

    const res = await fetch(`${API_URL}/visites/${visiteId}/documents`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chemin: contextMenu.item.chemin })
    });

    if (res.ok) {
      toast.success(
        contextMenu.item.type === "folder"
          ? "Dossier supprimé avec succès"
          : "Fichier supprimé avec succès"
      );
      localStorage.setItem("document-updated", Date.now().toString());

      setRefresh(!refresh);
      setSelectedDoc(null);
      setContextMenu(null);
    }
  };

  const handleDoubleClick = (item) => {
    if (item.type === "folder") {
      goToFolder(item.nom);
    } else {

      window.open(`${API_URL}/${item.chemin}`, "_blank");
    }
  };

  const handleConfirmCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("❗ Le nom du dossier est vide");
      return;
    }

    const res = await fetch(`${API_URL}/visites/${visiteId}/documents/folder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, name: newFolderName.trim() })
    });

    if (res.ok) {
      toast.success("Dossier créé !");
      setRefresh(!refresh);
    } else {
      toast.error("Erreur lors de la création du dossier");
    }

    setNewFolderName("");
    setShowFolderModal(false);
    localStorage.setItem("document-updated", Date.now().toString());

  };


  const handleOpen = () => {
    const item = contextMenu?.item;
    if (!item) return;

    if (item.type === "folder") {
      goToFolder(item.nom);
    } else if (item.chemin) {
      window.open(`${API_URL}/${item.chemin}`, "_blank");

    }

    setContextMenu(null);
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, target) => {
    e.preventDefault();
    if (!draggedItem || target.type !== "folder") return;

    const res = await fetch(`${API_URL}/visites/${visiteId}/documents/move`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oldPath: draggedItem.chemin,
        newFolder: `${path}${target.nom}/`,
        nom: draggedItem.nom
      })
    });

    if (res.ok) {
      toast.success("Document déplacé avec succès");
      setDraggedItem(null);
      setRefresh(!refresh);
      localStorage.setItem("document-updated", Date.now().toString());

    }
  };
  const handleRename = async () => {
    if (!renameValue.trim()) {
      toast.error("Le nom ne peut pas être vide");
      return;
    }

    const res = await fetch(`${API_URL}/visites/${visiteId}/documents/rename`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oldPath: selectedDoc.chemin,
        newName: renameValue.trim()
      })
    });

    if (res.ok) {
      toast.success("Nom modifié avec succès");
      setRefresh(!refresh);
      localStorage.setItem("document-updated", Date.now().toString());
    } else {
      toast.error("Échec du renommage");
    }

    setShowRenameModal(false);
    setRenameValue("");
    setSelectedDoc(null);
  };


  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const staticDocs = [
    visite?.pdfPath && {
      nom: "Fiche Visite Technique.pdf",
      chemin: visite.pdfPath,
      type: "pdf"
    },
    visite?.bonLivraisonPath && {
      nom: "Bon de Livraison.pdf",
      chemin: visite.bonLivraisonPath,
      type: "pdf"
    },
    visite?.procesVerbalPath && {
      nom: "Procès-Verbal de Réception.pdf",
      chemin: visite.procesVerbalPath,
      type: "pdf"
    },
    visite?.permis_de_construire && {
      nom: "Permis de Construire.pdf",
      chemin: visite.permis_de_construire,
      type: "pdf"
    }
  ].filter(Boolean);


  const allItems = [...items];

  return (
    <div className="mt-4 relative">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 dark:text-white">🗂️ Explorateur de fichiers </h3>

      <div className="flex items-center gap-4 mb-4">
        <button onClick={goBack} className="bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 dark:bg-[#353c42]">
          ⬅️ Retour
        </button>
        <span className="text-sm text-gray-600">{path}</span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setShowFolderModal(true)}
          className="bg-primary text-white px-3 py-1 rounded hover:bg-primary"
        >
          <FaPlus className="inline mr-1" /> Nouveau dossier
        </button>


        <label className="cursor-pointer bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
          <FaUpload className="inline mr-1" /> Importer
          <input type="file" onChange={handleUpload} className="hidden" />
        </label>

        <button
          disabled={!selectedDoc}
          onClick={async () => {
            const confirmDelete = window.confirm("Supprimer ce fichier ?");
            if (!confirmDelete) return;

            const res = await fetch(`${API_URL}/visites/${visiteId}/documents`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chemin: selectedDoc.chemin })
            });

            if (res.ok) {
              setRefresh(!refresh);
              setSelectedDoc(null);
              localStorage.setItem("document-updated", Date.now().toString());

            }
          }}
          className={`px-3 py-1 rounded text-white transition ${selectedDoc ? "bg-red-600 hover:bg-red-700" : "bg-gray-300 cursor-not-allowed dark:bg-[#353c42]"
            }`}
        >
          🗑️ Supprimer
        </button>
        <button
          disabled={!selectedDoc}
          onClick={() => {
            setRenameValue(selectedDoc.nom);
            setShowRenameModal(true);
          }}
          className={`px-3 py-1 rounded text-white transition ${selectedDoc ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-300 cursor-not-allowed dark:bg-[#353c42]"
            }`}
        >
          ✏️ Renommer
        </button>

      </div>

      {showFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md dark:bg-[#353c42]">
            <h2 className="text-lg font-semibold mb-4 ">Créer un nouveau dossier</h2>
            <input
              className="form-input w-full mb-4 dark:bg-[#353c42] dark:border-gray-800"
              placeholder="Nom du dossier"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmCreateFolder();
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowFolderModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-[#454e55]"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmCreateFolder}
                className="px-4 py-2 rounded bg-primary text-white hover:bg-primary"
              >
                Créer
              </button>

            </div>
          </div>
        </div>
      )}



      {uploading && <p className="text-sm text-yellow-600">⏳ Importation en cours...</p>}

      {allItems.length === 0 ? (
  <p className="text-gray-500 italic mt-4 dark:text-white">📁 Ce dossier est vide.</p>
) : (
  <div className="grid grid-cols-1 md:grid-cols-1 gap-4 ">
    {allItems.map((item, idx) => (
      <div
        key={idx}
        draggable
        onDragStart={(e) => handleDragStart(e, item)}
        onDragOver={(e) => handleDragOver(e)}
        onDrop={(e) => handleDrop(e, item)}
        className={`shadow p-4 rounded-lg flex items-center justify-between transition cursor-pointer 
          ${selectedDoc?.chemin === item.chemin ? "bg-red-50 dark:bg-[#202427] " : "bg-white hover:bg-red-50 dark:bg-[#353c42]"}`}
        onClick={() => {
          setSelectedDoc((prev) => (prev?.chemin === item.chemin ? null : item));
        }}
        onDoubleClick={() => handleDoubleClick(item)}
        onContextMenu={(e) => handleContextMenu(e, item)}
      >
        <div className="flex items-center gap-3">
          {item.type === "folder" ? (
            <FaFolder className="text-yellow-500 text-xl" />
          ) : item.nom?.endsWith(".pdf") ? (
            <FaFilePdf className="text-red-500 text-xl" />
          ) : (
            <FaFileAlt className="text-gray-500 text-xl" />
          )}
          <p className="font-medium text-gray-800 truncate max-w-[450px] select-none dark:text-white">
            {item.nom || "Nom inconnu"}
          </p>
        </div>
      </div>
    ))}
  </div>
)}


      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-4">Renommer {selectedDoc?.type === "folder" ? "le dossier" : "le fichier"}</h2>
            <input
              className="form-input w-full mb-4"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRenameModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={handleRename}
                className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
              >
                Renommer
              </button>
            </div>
          </div>
        </div>
      )}


      {contextMenu && (
        <div
          className="fixed bg-white border shadow-md rounded z-50 w-48"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
        >
          {contextMenu.item.chemin && (
            <button
              onClick={handleOpen}
              className="block w-full text-left px-4 py-2 hover:bg-red-100 text-sm text-gray-700"
            >
              Ouvrir
            </button>
          )}
          <button
            onClick={handleSelect}
            className="block w-full text-left px-4 py-2 hover:bg-red-100 text-sm text-gray-700"
          >
            Sélectionner
          </button>
          <button
            onClick={handleDelete}
            className="block w-full text-left px-4 py-2 hover:bg-red-100 text-sm text-gray-700"
          >
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useRef } from "react";
import { FaBell } from "react-icons/fa";
import { io } from "socket.io-client";
import { socket } from "../socket";
import { useNavigate } from "react-router-dom";
import "../styles/style.css";

export default function NotificationBell({ user }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const notificationSound = useRef(null);
  const [sonActif, setSonActif] = useState(() => {
    const saved = localStorage.getItem("notifSound");
    return saved ? saved === "true" : true;
  });
  const sonActifRef = useRef(sonActif);
  const [flashMessages, setFlashMessages] = useState([]);

  const toggleSon = () => {
    const newValue = !sonActif;
    setSonActif(newValue);
    localStorage.setItem("notifSound", newValue.toString());
  };


  useEffect(() => {
    notificationSound.current = new Audio("/sounds/notification.mp3");
    notificationSound.current.volume = 1;
  }, []);

  useEffect(() => {
    sonActifRef.current = sonActif;
  }, [sonActif]);


  useEffect(() => {
    socket.connect();

    socket.emit("joinRoom", { userId: user.id });

    fetch(`http://10.10.2.106:5000/notifications?target=${user.role}`)
      .then(res => res.json())
      .then(setNotifications)
      .catch(err => console.error("Erreur chargement notifs", err));

    socket.on("new_notification", (notif) => {
      if (notif.target === user.role || notif.target === user.id.toString()) {
        setNotifications(prev => [notif, ...prev]);

        if (sonActifRef.current && notificationSound.current) {
          notificationSound.current.play().catch(err => console.warn("Erreur audio :", err));
        }
        const msgId = Date.now();
        setFlashMessages(prev => [...prev, { id: msgId, text: notif.message, type: notif.type }]);
        setTimeout(() => {
          setFlashMessages(prev => prev.filter(m => m.id !== msgId));
        }, 4000);
      }
    });


    return () => {
      socket.off("new_notification");
    };
  }, [user.role, user.id]);


  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleDropdown = () => setShowDropdown(prev => !prev);

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setShowDropdown(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://10.10.2.106:5000/notifications/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error("Erreur suppression notification :", err);
    }
  };


  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch(`http://10.10.2.106:5000/notifications?target=${user.id}`)
      .then(res => res.json())
      .then(setNotifications)
      .catch(err => console.error("Erreur chargement notifs", err));

    const socket = io("http://10.10.2.106:5000");
    socket.on("new_notification", (notif) => {
      if (notif.target === user.id.toString()) {
        setNotifications(prev => [notif, ...prev]);
      }
    });

    return () => socket.disconnect();
  }, [user.id]);

  const markAsRead = async (notif) => {

    const res = await fetch(`http://10.10.2.106:5000/notifications/${notif.id}/read`, {
      method: "PUT",
    });

    const data = await res.json();

    if (res.ok) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, seen: true } : n))
      );

      setShowDropdown(false);

      if (notif.type === "message" && notif.senderId) {
        navigate(`/messages/${notif.senderId}`);
      }
    }
  };

  return (
    <div className="relative " ref={dropdownRef}>
      <button onClick={toggleDropdown} className="relative p-2">
        <FaBell className="text-xl text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>
      {Array.isArray(flashMessages) && flashMessages.map(msg => (
        <div
          key={msg.id}
          className={`fixed right-4 px-16 py-4 rounded shadow-lg z-[9999]  animate-fade-in-out
            ${msg.type === "message" ? "bg-red-100 border-red-400 text-red-800"
              : msg.type === "system" ? "bg-blue-100 border-blue-400 text-blue-800"
                : "bg-gray-100 border-gray-400 text-gray-800"}`}
          style={{
            bottom: `${4 + flashMessages.findIndex(m => m.id === msg.id) * 60}px`
          }}
        >
          {msg.text}
        </div>
      ))}

      {showDropdown && (
        <div className="absolute left-0 bottom-full mb-2 w-[320px] bg-white border border-gray-200 rounded shadow-lg z-50 dark:bg-[#1d2125] dark:border-0">
          <div className="p-4 flex items-center justify-between font-semibold text-gray-800 border-b dark:text-white">
            <span>Notifications</span>
            <button
              onClick={toggleSon}
              className="text-sm text-gray-500 hover:text-gray-800"
              title={sonActif ? "Désactiver le son" : "Activer le son"}
            >
              {sonActif ? "🔊" : "🔇"}
            </button>
          </div>


          <ul>
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className={`relative p-3 text-sm border-b hover:bg-gray-50 cursor-pointer dark:text-white dark:hover:bg-gray-700 ${notif.seen ? "text-gray-500" : "text-black font-medium"
                  }`}
                onClick={() => {
                  markAsRead(notif);
                  if (notif.type === "message" && notif.senderId) {
                    navigate(`/messages/${notif.senderId}`);
                  }
                }}
              >
                {notif.message}
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(notif.timestamp).toLocaleString("fr-FR")}
                </div>

                {/* ❌ Bouton supprimer */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notif.id);
                  }}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  title="Supprimer la notification"
                >
                  ×
                </button>
              </li>

            ))}
          </ul>

        </div>
      )}
    </div>
  );
}

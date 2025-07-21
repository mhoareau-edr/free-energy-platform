import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { MessageSquarePlus } from "lucide-react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import socket from "../../socket";


export default function ChatFullScreen({ user, onClose, forcedUserId, isMini = false }) {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const bottomRef = useRef(null);
    const [conversations, setConversations] = useState([]);
    const [showUserSelector, setShowUserSelector] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [conversationSearch, setConversationSearch] = useState("");
    const [receiver, setReceiver] = useState(null);
    const { id } = useParams();
    const selectedUserRef = useRef(null);
    const API = import.meta.env.VITE_API_URL;

    const fetchMessages = async () => {
        if (!selectedUser || !user?.id) return;

        try {
            const res = await axios.get(`${API}/chat/messages`, {
                params: {
                    senderId: user.id,
                    receiverId: selectedUser.id,
                },
            });
            setMessages(res.data);

            const docMessage = res.data.find((msg) =>
                msg.content.includes("Documents manquants pour la DP de")
            );
            if (docMessage) {

            };

        } catch (err) {
            console.error("Erreur lors du chargement des messages :", err);
        }
    };

    useEffect(() => {
        if (!user?.id) return;

        socket.connect();

        socket.emit("joinRoom", { userId: user.id });

        return () => {
            socket.disconnect();
        };
    }, [user?.id]);



    useEffect(() => {
        const fetchConversations = async () => {
            if (!user?.id) return;

            try {
                const res = await axios.get(`${API}/chat/conversations/${user.id}`);
                setConversations(res.data);
            } catch (err) {
                console.error("Erreur chargement conversations :", err);
            }
        };

        fetchConversations();
    }, [user]);


    useEffect(() => {
        const fetchUsers = async () => {
            if (!user?.id) return;

            try {
                const res = await axios.get(`${API}/users`);
                setUsers(res.data.filter((u) => u.id !== user.id));
            } catch (err) {
                console.error("Erreur chargement utilisateurs :", err);
            }
        };

        fetchUsers();
    }, [user]);

    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);


    useEffect(() => {
        fetchMessages();
    }, [selectedUser, user?.id]);

    useEffect(() => {
        if (!selectedUser || !user?.id) return;

        const markMessagesAsRead = async () => {
            try {
                await axios.post(`${API}/chat/read`, {
                    senderId: selectedUser.id,
                    receiverId: user.id
                });

                socket.emit("messageRead", {
                    senderId: selectedUser.id,
                    receiverId: user.id
                });
            } catch (err) {
                console.error("Erreur lors de la mise à jour readAt :", err);
            }
        };

        markMessagesAsRead();
    }, [selectedUser, user]);

    useEffect(() => {
        if (forcedUserId) {
            fetch(`${API}/users/${forcedUserId}`)
                .then(res => res.json())
                .then(user => {
                    setSelectedUser({
                        id: user.id,
                        name: user.name,
                        displayName: user.displayName,
                    });
                    console.log("✅ Utilisateur sélectionné via notification :", user);
                })
                .catch(err => console.error("Erreur chargement destinataire", err));
        }
    }, [forcedUserId]);

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedUser) return;

        const msg = {
            senderId: user.id,
            receiverId: selectedUser.id,
            content: newMessage,
        };

        try {
            const res = await axios.post(`${API}/chat/messages`, msg);
            socket.emit("sendMessage", res.data);
            setNewMessage("");
        } catch (err) {
            console.error("Erreur lors de l'envoi du message :", err);
        }
    };

    const handleDeleteMessage = async (messageId) => {


        try {
            await axios.delete(`${API}/chat/messages/${messageId}`);
            setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
            toast.success("Message supprimé");
        } catch (err) {
            console.error("Erreur suppression message :", err);
            toast.error("Erreur lors de la suppression");
        }
    };



    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!users || !conversations) return;

        const contactedUserIds = new Set(conversations.map((c) => c.userId));

        const newUsers = users
            .filter((u) => !contactedUserIds.has(u.id))
            .filter((u) =>
                (u.displayName || u.name || "")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            );

        setFilteredUsers(newUsers);
    }, [users, conversations, searchTerm]);

    useEffect(() => {
        if (!user?.id) return;

        const handleReceiveMessage = (message) => {
            const selected = selectedUserRef.current;

            const isCurrentConversation =
                selected &&
                (message.senderId === selected.id || message.receiverId === selected.id);

            if (isCurrentConversation) {
                setMessages((prev) => {
                    if (prev.some(m => m.id === message.id || m.createdAt === message.createdAt)) return prev;
                    return [...prev, message];
                });
            }



            if (message.senderId !== user.id && !isCurrentConversation) {
                toast(`${message.senderName || "Message"} : ${message.content}`, {
                    icon: "💬",
                    duration: 5000,
                });
            }
        };

        socket.on("receiveMessage", handleReceiveMessage);

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, [user?.id]);


    return (
        <div className={`w-full h-full flex flex-col ${isMini ? "text-sm" : "p-6"}`}>
            {!isMini && (
                <>
                    <button onClick={onClose} className="mb-4 w-[300px] bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded">
                        ← Revenir à la liste
                    </button>
                    <h2 className="text-xl font-bold text-primary mb-1 dark:text-white">Messagerie privée</h2>

                </>
            )}

            <div className="flex h-[90vh] overflow-auto p-3">
                {/* Utilisateurs */}
                <aside className="w-1/4 pr-4 border-r">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">Conversations récentes</h3>
                        <button
                            onClick={() => setShowUserSelector(true)}
                            className="p-1 rounded hover:bg-gray-100"
                            title="Nouveau message"
                        >
                            <MessageSquarePlus className="w-5 h-5 text-primary dark:text-white" />
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="Rechercher une conversation..."
                        value={conversationSearch}
                        onChange={(e) => setConversationSearch(e.target.value)}
                        className="w-full border rounded px-3 py-3 mb-2 text-sm dark:bg-[#353c42]"
                    />

                    <div className="space-y-2 overflow-auto max-h-full ">
                        {conversations
                            .filter((conv) =>
                                (conv.userName || "")
                                    .toLowerCase()
                                    .includes(conversationSearch.toLowerCase())
                            )
                            .map((conv) => {
                                const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.userName)}&background=random`;

                                return (
                                    <div
                                        key={conv.userId}
                                        className={`flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-100 ${selectedUser?.id === conv.userId ? "bg-gray-200 dark:bg-gray-700" : ""
                                            }`}
                                        onClick={() =>
                                            setSelectedUser({ id: conv.userId, name: conv.userName })
                                        }
                                    >
                                        <img
                                            src={avatarUrl}
                                            alt={`avatar ${conv.userName}`}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold truncate">{conv.userName}</div>
                                            <div className="text-sm text-gray-500 truncate">
                                                {conv.lastMessage}
                                            </div>
                                            <div className="text-xs text-gray-400 truncate">
                                                {new Date(conv.lastDate).toLocaleString("fr-FR", {
                                                    dateStyle: "short",
                                                    timeStyle: "short",
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                    </div>

                </aside>

                {/* Chat principal */}
                <div className="flex-1 flex flex-col px-4 ">
                    <div className="border-b pb-2 mb-2 font-medium">
                        {selectedUser
                            ? `Conversation avec ${selectedUser.displayName || selectedUser.name}`
                            : "Sélectionnez un membre pour commencer"}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-auto space-y-2 mb-4 p-2 border rounded bg-gray-50 dark:bg-[#353c42]">
                        {messages.map((msg, idx) => {
                            const isSender = msg.senderId === user.id;
                            const isDocumentMessage = msg.content.startsWith("Documents manquants pour la DP de");

                            const showStatus = isSender && idx === messages.length - 1;
                            const senderName = isSender ? "Moi" : selectedUser?.displayName || selectedUser?.name || "Utilisateur";
                            const createdAt = new Date(msg.createdAt);
                            const sentDate = createdAt.toLocaleDateString("fr-FR");
                            const sentTime = createdAt.toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                            });
                            const readAt = msg.readAt ? new Date(msg.readAt) : null;
                            const readDate = readAt?.toLocaleDateString("fr-FR");
                            const readTime = readAt?.toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                            });

                            const avatarSrc = isSender
                                ? user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "Moi")}`
                                : selectedUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser?.name || "Contact")}`;

                            return (
                                <div
                                    key={idx}
                                    className={`flex w-full mb-2 ${isSender ? "justify-end" : "justify-start"}`}
                                >

                                    {/* Message reçu : avatar gauche / envoyé : avatar droite */}
                                    {!isSender && (
                                        <img
                                            src={avatarSrc}
                                            alt="avatar"
                                            className="w-8 h-8 rounded-full mr-2 self-end"
                                        />
                                    )}
                                    {isSender && (
                                        <button
                                            onClick={() => handleDeleteMessage(msg.id)}
                                            className="ml-2 text-red-500 hover:text-red-700 text-xs"
                                            title="Supprimer ce message"
                                        >
                                            🗑
                                        </button>
                                    )}

                                    <div
                                        className={`flex flex-col max-w-[75%] px-4 py-2 rounded shadow-sm ${isDocumentMessage
                                            ? "bg-yellow-100 border-l-4 border-yellow-500 items-start"
                                            : isSender
                                                ? "bg-red-100 items-end"
                                                : "bg-gray-200 items-start"
                                            }`}
                                    >
                                        <span className="text-xs text-gray-600 font-semibold">{senderName}</span>
                                        <p className={`text-sm whitespace-pre-wrap dark:text-black ${isDocumentMessage ? "text-yellow-900 font-medium flex gap-2 items-start" : ""}`}>
                                            {isDocumentMessage ? (
                                                <div
                                                    onClick={() => handleNotificationClick(msg.content)}
                                                    className="cursor-pointer hover:underline"
                                                    title="Voir les documents du client"
                                                >
                                                    {msg.content}
                                                </div>
                                            ) : (
                                                msg.content
                                            )}
                                        </p>

                                        <span className="text-[11px] text-gray-500 mt-1">
                                            Message envoyé le {sentDate} à {sentTime}
                                            {showStatus && readAt && (
                                                <>
                                                    <br />
                                                    👁 Vu le {readDate} à {readTime}
                                                </>
                                            )}
                                        </span>
                                    </div>


                                    {isSender && (
                                        <img
                                            src={avatarSrc}
                                            alt="avatar"
                                            className="w-8 h-8 rounded-full ml-2 self-end"
                                        />
                                    )}
                                </div>
                            );
                        })}
                        <div ref={bottomRef}></div>
                    </div>

                    {/* Saisie */}
                    {selectedUser && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Écrire un message..."
                                className="flex-1 border rounded px-3 py-2 dark:bg-[#353c42] dark:text-white"
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            />
                            <button
                                onClick={handleSend}
                                className="bg-primary text-white px-4 rounded"
                            >
                                Envoyer
                            </button>
                        </div>
                    )}
                    {showUserSelector && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 ">
                            <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-lg p-4 dark:bg-[#353c42]">
                                <div className="flex justify-between items-center border-b pb-3">
                                    <h3 className="text-lg font-semibold">Nouveau message</h3>
                                    <button
                                        onClick={() => setShowUserSelector(false)}
                                        className="text-xl font-bold text-gray-500 hover:text-red-600"
                                    >
                                        ×
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    placeholder="Rechercher un membre..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full border rounded px-3 py-2 mt-4 mb-2 dark:bg-[#353c42] dark:border-gray-800"
                                />

                                <div className="max-h-64 overflow-y-auto">
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((u) => (
                                            <div
                                                key={u.id}
                                                onClick={() => {
                                                    setSelectedUser(u);
                                                    setShowUserSelector(false);
                                                    setSearchTerm("");
                                                }}
                                                className="cursor-pointer p-3 hover:bg-gray-100 rounded transition hover:dark:bg-[#252a2e]"
                                            >
                                                <div className="font-medium">{u.displayName || u.name}</div>
                                                <div className="text-sm text-gray-500">Nouveau message</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-gray-400 p-3">
                                            Aucun utilisateur trouvé ou tous déjà contactés.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
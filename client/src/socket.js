import { io } from "socket.io-client";
const API = import.meta.env.VITE_API_URL;
export const socket = io(`${API}`, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ["websocket"],
});

export default socket;
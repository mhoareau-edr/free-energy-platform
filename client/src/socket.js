import { io } from "socket.io-client";

export const socket = io("http://10.10.2.106:5000", {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ["websocket"],
});

export default socket;
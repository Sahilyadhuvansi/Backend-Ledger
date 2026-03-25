import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [lastUpdate, setLastUpdate] = useState(() => Date.now());
  const [socket, setSocket] = useState(null);
  const [isSocketReady, setIsSocketReady] = useState(false);

  useEffect(() => {
    // Determine the correct backend URL for Socket.io
    const backendUrl = import.meta.env.DEV
      ? `http://${window.location.hostname}:3002`
      : "https://backend-ledger-ijt0.onrender.com";

    // If no user, cleanup happens via the return function of the effect.
    if (!user?._id) {
      setIsSocketReady(false);
      return;
    }

    console.log("🔌 Initializing new socket connection...");

    // Switch to websocket transport only to avoid polling floods on Render
    const socketInstance = io(backendUrl, {
      withCredentials: true,
      query: { userId: user._id },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected via WebSocket");
      socketInstance.emit("register_user", user._id);
      setIsSocketReady(true);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
      // If websocket fails, it won't flood polling anymore.
      setIsSocketReady(false);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsSocketReady(false);
    });

    socketInstance.on("new_transaction", (data) => {
      setLastUpdate(Date.now());
      toast.success(data.message, {
        duration: 6000,
        position: "top-right",
        icon: "💰",
        style: {
          borderRadius: "10px",
          background: "#f0fdf4",
          color: "#166534",
          border: "1px solid #bbf7d0",
          fontWeight: "bold",
        },
      });
    });

    socketInstance.on("transaction_sent", (data) => {
      setLastUpdate(Date.now());
      toast.success(data.message, {
        duration: 6000,
        position: "top-right",
        icon: "💸",
        style: {
          borderRadius: "10px",
          background: "#fef2f2",
          color: "#991b1b",
          border: "1px solid #fecaca",
          fontWeight: "bold",
        },
      });
    });

    return () => {
      console.log("🧹 Cleaning up socket connection...");
      socketInstance.disconnect();
      setSocket(null);
      setIsSocketReady(false);
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider
      value={{ socket, isReady: isSocketReady, lastUpdate }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);

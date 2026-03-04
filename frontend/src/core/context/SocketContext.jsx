import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [lastUpdate, setLastUpdate] = useState(() => Date.now());
  const socketRef = useRef(null);
  const [isSocketReady, setIsSocketReady] = useState(false);

  useEffect(() => {
    // Determine the correct backend URL for Socket.io
    const backendUrl = import.meta.env.DEV
      ? "http://localhost:3002"
      : "https://backend-ledger-ijt0.onrender.com";

    // If no user, disconnect and clean up
    if (!user) {
      if (socketRef.current) {
        console.log("🔌 Disconnecting socket (no user)");
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsSocketReady(false);
      }
      return;
    }

    // Only create a new socket if we don't have one
    if (socketRef.current) return;

    console.log("🔌 Initializing new socket connection...");
    const socketInstance = io(backendUrl, {
      withCredentials: true,
      query: { userId: user._id },
      transports: ["websocket", "polling"], // Allow both
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected");
      socketInstance.emit("register_user", user._id);
      setIsSocketReady(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // the server has forcefully disconnected the socket, let's reconnect manually
        socketInstance.connect();
      }
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

    socketRef.current = socketInstance;

    return () => {
      if (socketRef.current) {
        console.log("🧹 Cleaning up socket connection...");
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsSocketReady(false);
      }
    };
  }, [user?._id]); // Only re-run if user ID changes, NOT on AuthProvider re-renders

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, isReady: isSocketReady, lastUpdate }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

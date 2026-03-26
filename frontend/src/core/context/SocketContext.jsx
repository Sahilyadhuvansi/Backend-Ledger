// ─── Commit: Socket.io Client Engine ───
// What this does: Loads 'socket.io-client', our library for real-time, two-way communication.
// Why it exists: Normal websites use "Request-Response" (you ask for data, the server gives it). WebSockets allow the server to "Push" data to the user instantly (like a WhatsApp message).
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

// ─── Commit: Real-Time Channel initialization ───
// Pattern: "Observer Pattern" (The frontend listens for server events).
const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [lastUpdate, setLastUpdate] = useState(() => Date.now()); // Triggers UI re-renders on new data
  const [socket, setSocket] = useState(null);
  const [isSocketReady, setIsSocketReady] = useState(false);

  // ─── Commit: Managed Side-Effect (Live Connection) ───
  // How it works: 1. Checks if a user is logged in. 2. Opens the tunnel to the server. 3. Listens for "Money received" events.
  // Interview insight: Why an Effect? Because opening a socket is a "Side Effect" outside of normal React rendering logic.
  useEffect(() => {
    // Stage 1: Dynamic Environment Mapping (Local vs Prod)
    const backendUrl = import.meta.env.DEV
      ? `http://${window.location.hostname}:3002`
      : "https://backend-ledger-ijt0.onrender.com";

    // Stop if not logged in (to avoid anonymous connections)
    if (!user?._id) {
      setIsSocketReady(false);
      return;
    }

    console.log("🔌 Initializing real-time websocket channel...");

    // Stage 2: Tunnel Configuration
    // Beginner note: 'transports: ["websocket"]' is critical. It avoids expensive "Long Polling" and uses the modern WebSocket protocol directly.
    const socketInstance = io(backendUrl, {
      withCredentials: true,
      query: { userId: user._id },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
    });

    setSocket(socketInstance);

    // Stage 3: Event Listeners (The "Ears" of our App)
    socketInstance.on("connect", () => {
      console.log("✅ WebSocket established with server");
      // Tell the server "Hey, I'm user X" so it knows where to send our private money alerts.
      socketInstance.emit("register_user", user._id);
      setIsSocketReady(true);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("❌ WebSocket handshake error:", err.message);
      setIsSocketReady(false);
    });

    /**
     * Listener: Money Received Alert
     * What it does: Shows a green toast when someone sends you money.
     */
    socketInstance.on("new_transaction", (data) => {
      setLastUpdate(Date.now()); // Signal that data in the DB has changed
      toast.success(data.message, {
        duration: 6000,
        icon: "💰",
      });
    });

    /**
     * Listener: Money Sent Alert
     * What it does: Shows a red toast confirming your payment went through.
     */
    socketInstance.on("transaction_sent", (data) => {
      setLastUpdate(Date.now());
      toast.success(data.message, {
        duration: 6000,
        icon: "💸",
      });
    });

    // Stage 4: Garbage Collection (Cleanup)
    // Why it exists: If you log out or close the tab, we MUST close the socket. If we don't, the server stays busy looking for a person who isn't there (Memory Leak).
    return () => {
      console.log("🧹 Tearing down real-time channel...");
      socketInstance.disconnect();
      setSocket(null);
      setIsSocketReady(false);
    };
  }, [user?._id]); // Only re-run if the user changes (e.g. login/logout)

  return (
    <SocketContext.Provider
      value={{ socket, isReady: isSocketReady, lastUpdate }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// ─── Commit: Custom Socket Hook ───
export const useSocket = () => useContext(SocketContext);

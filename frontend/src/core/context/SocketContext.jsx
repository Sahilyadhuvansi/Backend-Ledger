import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(() => Date.now());

  useEffect(() => {
    // Determine the correct backend URL for Socket.io
    const backendUrl = import.meta.env.DEV
      ? "http://localhost:3002"
      : "https://backend-ledger-ijt0.onrender.com";

    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Only create a new socket if we don't have one
    // We use the 'socket' state directly since it's only modified here
    if (socket) return;

    const socketInstance = io(backendUrl, {
      withCredentials: true,
      query: { userId: user._id },
    });

    socketInstance.on("connect", () => {
      socketInstance.emit("register_user", user._id);
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

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [user]); // CRITICAL: Only depend on 'user', NOT 'socket' to avoid loop

  return (
    <SocketContext.Provider value={{ socket, lastUpdate }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

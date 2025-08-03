import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Change the URL as appropriate for your backend!
const SOCKET_URL = "http://localhost:5001";
const SocketContext = createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const socketRef = useRef(null);

  useEffect(() => {
    // Only connect once
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      // auth: { token: localStorage.getItem('token') }, // Uncomment if needed
    });

    // Cleanup on unmount
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // Expose the socket instance via Context
  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

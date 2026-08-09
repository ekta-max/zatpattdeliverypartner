// src/context/NotificationContext.jsx
import React, { createContext, useState, useCallback } from "react";

export const NotificationContext = createContext({
  addNotification: () => {},
});

export function NotificationProvider({ children }) {
  const [message, setMessage] = useState(null);

  const addNotification = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      {message && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-4 py-2 rounded-lg shadow-lg z-[9999]">
          {message}
        </div>
      )}
    </NotificationContext.Provider>
  );
}
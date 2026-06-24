// useAnnouncement.js
import { useState, useEffect } from "react";

export function useAnnouncement(userId) {
  const SESSION_KEY = `qy_announcement_seen_${userId}`;
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!userId) return; // espera a tener el userId
    const alreadySeen = sessionStorage.getItem(SESSION_KEY);
    if (!alreadySeen) {
      setIsOpen(true);
    }
  }, [userId, SESSION_KEY]);

  const close = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setIsOpen(false);
  };

  return { isOpen, close };
}

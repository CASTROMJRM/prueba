import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, type User } from "./AuthContext";
import { showAlert, showLogoutConfirmAlert } from "../utils/feedback";

const INACTIVITY_LIMIT_MS = 15 * 60_000; // 15 minutos

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const inactivityTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current !== null) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const setUser = useCallback((next: User | null) => {
    setUserState(next);
    if (next) localStorage.setItem("user", JSON.stringify(next));
    else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUserState(null);
    clearInactivityTimer();
    navigate("/login", { replace: true });
  }, [clearInactivityTimer, navigate]);

  const requestLogout = useCallback(async () => {
    const result = await showLogoutConfirmAlert();

    if (!result.isConfirmed) {
      return false;
    }

    logout();
    return true;
  }, [logout]);

  const startInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    inactivityTimerRef.current = window.setTimeout(() => {
      void showAlert({
        title: "Sesion cerrada por inactividad",
        text: "Por seguridad, tu sesion se cerro automaticamente.",
        icon: "warning",
      });
      logout();
    }, INACTIVITY_LIMIT_MS);
  }, [clearInactivityTimer, logout]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserState(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
        setUserState(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!user) {
      clearInactivityTimer();
      return;
    }

    startInactivityTimer();

    const resetTimer = () => startInactivityTimer();
    const events = [
      "click",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ] as const;

    events.forEach((eventName) =>
      window.addEventListener(eventName, resetTimer),
    );

    return () => {
      events.forEach((eventName) =>
        window.removeEventListener(eventName, resetTimer),
      );
      clearInactivityTimer();
    };
  }, [user, startInactivityTimer, clearInactivityTimer]);

  if (isLoading) return null;

  return (
    <AuthContext.Provider value={{ user, setUser, logout, requestLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

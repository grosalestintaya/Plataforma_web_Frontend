// src/context/AuthContext.jsx (o donde lo tengas)
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { http } from "@/services/analitics/http"; // ajusta alias o ruta relativa

const AuthContext = createContext(null);

const normalizeUserFromJwt = (decoded) => ({
  id: decoded.id,
  username: decoded.username,
  is_active: Boolean(decoded.is_active ?? decoded.isactive ?? false),
  role: decoded.role ?? decoded.rol ?? null,
});

const normalizeUserFromMe = (me) => ({
  id: me.id ?? me.id_user ?? me.idUser,
  username: me.username,
  is_active: Boolean(me.is_active ?? me.isactive ?? false),
  role: me.role ?? me.rol ?? me?.Rol?.name ?? null,
  style: me.style ?? "green",
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    if (!saved || saved === "undefined") return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [loadingAuth, setLoadingAuth] = useState(true);

  const persistAuth = (nextToken, nextUser) => {
    if (nextToken) localStorage.setItem("token", nextToken);
    else localStorage.removeItem("token");

    if (nextUser) localStorage.setItem("user", JSON.stringify(nextUser));
    else localStorage.removeItem("user");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    persistAuth(null, null);
  };

  const checkSession = async (tk = token) => {
    if (!tk || tk === "undefined") return false;

    try {
      // Opción A: usar http y dejar que el interceptor ponga el token
      // Pero aquí queremos validar un token específico (tk), así que lo mandamos explícito
      const { data } = await http.get("/api/user/check-session", {
        headers: { Authorization: `Bearer ${tk}` },
      });
      return Boolean(data?.valid);
    } catch {
      return false;
    }
  };

  const fetchMe = async (tk = token) => {
    if (!tk || tk === "undefined") throw new Error("No token");

    const { data } = await http.get("/api/user/me", {
      headers: { Authorization: `Bearer ${tk}` },
    });

    const me = data?.user ?? data;
    return normalizeUserFromMe(me);
  };

  const syncMe = async () => {
    if (!token || token === "undefined") return null;
    const meUser = await fetchMe(token);
    setUser(meUser);
    persistAuth(token, meUser);
    return meUser;
  };

  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem("token");
      if (!savedToken || savedToken === "undefined") {
        setLoadingAuth(false);
        return;
      }

      setToken(savedToken);

      const valid = await checkSession(savedToken);
      if (!valid) {
        logout();
        setLoadingAuth(false);
        return;
      }

      // Base desde JWT (rápido)
      try {
        const decoded = jwtDecode(savedToken);
        const base = normalizeUserFromJwt(decoded);

        setUser((prev) => {
          const merged = { ...base, ...(prev ?? {}) };
          persistAuth(savedToken, merged);
          return merged;
        });
      } catch {
        // ignore
      }

      // Fuente de verdad: /me
      try {
        const meUser = await fetchMe(savedToken);
        setUser(meUser);
        persistAuth(savedToken, meUser);
      } catch {
        // si falla /me, mantén base user (no necesariamente logout)
      }

      setLoadingAuth(false);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (receivedToken) => {
    try {
      const decoded = jwtDecode(receivedToken);
      const base = normalizeUserFromJwt(decoded);

      setToken(receivedToken);
      setUser(base);
      persistAuth(receivedToken, base);

      // sincroniza /me
      try {
        const meUser = await fetchMe(receivedToken);
        setUser(meUser);
        persistAuth(receivedToken, meUser);
      } catch {
        // ok
      }
    } catch {
      logout();
    }
  };

  const activateUser = () => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, is_active: true };
      persistAuth(token, updated);
      return updated;
    });
  };

  const updateStyle = (newStyle) => {
    if (!newStyle) return;
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, style: newStyle };
      persistAuth(token, updated);
      return updated;
    });
  };

  const isAuthenticated = Boolean(token && token !== "undefined");

  const value = useMemo(
    () => ({
      token,
      user,
      setUser,
      isAuthenticated,
      login,
      logout,
      activateUser,
      updateStyle,
      checkSession,
      syncMe,
      loadingAuth,
    }),
    [token, user, isAuthenticated, loadingAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

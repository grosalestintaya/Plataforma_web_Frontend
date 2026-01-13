import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();
const API_BASE = "http://localhost:5000/api";

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
    console.log("AuthProvider: logout ejecutado");
  };

  const checkSession = async (tk = token) => {
    if (!tk || tk === "undefined") return false;
    try {
      const res = await fetch(`${API_BASE}/user/check-session`, {
        headers: { Authorization: `Bearer ${tk}` },
      });
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data?.valid);
    } catch {
      return false;
    }
  };

  const fetchMe = async (tk = token) => {
    if (!tk || tk === "undefined") throw new Error("No token");

    const res = await fetch(`${API_BASE}/user/me`, {
      headers: { Authorization: `Bearer ${tk}` },
    });
    if (!res.ok) throw new Error("No se pudo obtener /me");

    const data = await res.json();
    const me = data.user ?? data;
    return normalizeUserFromMe(me);
  };

  // Opcional: exponer una forma de re-sincronizar /me cuando guardas ajustes
  const syncMe = async () => {
    if (!token) return null;
    const meUser = await fetchMe(token);
    setUser(meUser);
    persistAuth(token, meUser);
    return meUser;
  };

  useEffect(() => {
    const init = async () => {
      console.log("AuthProvider: iniciando carga de sesión...");

      const savedToken = localStorage.getItem("token");
      if (!savedToken || savedToken === "undefined") {
        setLoadingAuth(false);
        return;
      }

      setToken(savedToken);

      const valid = await checkSession(savedToken);
      if (!valid) {
        console.warn("AuthProvider: sesión inválida");
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
        // ok
      }

      // Fuente de verdad: /me (incluye style)
      try {
        const meUser = await fetchMe(savedToken);
        setUser(meUser);
        persistAuth(savedToken, meUser);
        console.log("AuthProvider: /me sincronizado:", meUser);
      } catch (err) {
        console.warn("AuthProvider: no se pudo sincronizar /me", err);
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

      // sincroniza /me (style real)
      try {
        const meUser = await fetchMe(receivedToken);
        setUser(meUser);
        persistAuth(receivedToken, meUser);
      } catch {
        // ok
      }

      console.log("AuthProvider: login completado");
    } catch (error) {
      console.error("AuthProvider: Error decodificando JWT:", error);
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

  /**
   * UPDATE STYLE (UI-only)
   * - Actualiza tema al instante (estado + localStorage)
   * - Persistencia real se hace en Ajustes con editmydata
   */
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
      syncMe, // opcional
      loadingAuth,
    }),
    [token, user, isAuthenticated, loadingAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

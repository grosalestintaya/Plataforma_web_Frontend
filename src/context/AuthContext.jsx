import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Normaliza los valores del token
  const normalizeUser = (decoded) => ({
    id: decoded.id,
    username: decoded.username,
    is_active: Boolean(decoded.is_active ?? decoded.isactive ?? false),
    role: decoded.role ?? decoded.rol ?? null,
  });

  // -----------------------------------------
  // CARGA INICIAL DE SESIÓN
  // -----------------------------------------
useEffect(() => {
  const initAuth = async () => {
    console.log("AuthProvider: iniciando carga de sesión...");

    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedToken !== "undefined") {
      setToken(savedToken);

      try {
        if (savedUser && savedUser !== "undefined") {
          const parsed = JSON.parse(savedUser);
          const normalized = normalizeUser(parsed);
          setUser(normalized);
          localStorage.setItem("user", JSON.stringify(normalized));
        } else {
          const decoded = jwtDecode(savedToken);
          const normalized = normalizeUser(decoded);
          setUser(normalized);
          localStorage.setItem("user", JSON.stringify(normalized));
        }

        // 🔥 AQUÍ ESTÁ LA CLAVE
        await checkSession();

      } catch (err) {
        console.warn("AuthProvider: sesión inválida");
        logout();
      }
    }

    setLoadingAuth(false);
  };

  initAuth();
}, []);


  // -----------------------------------------
  // LOGIN
  // -----------------------------------------
  const login = (receivedToken) => {
    try {
      const decoded = jwtDecode(receivedToken);
      const normalized = normalizeUser(decoded);

      setToken(receivedToken);
      setUser(normalized);

      localStorage.setItem("token", receivedToken);
      localStorage.setItem("user", JSON.stringify(normalized));

      console.log("AuthProvider: login completado:", normalized);
    } catch (error) {
      console.error("AuthProvider: Error decodificando JWT:", error);
    }
  };

  // -----------------------------------------
  // ACTIVAR CUENTA DESPUÉS DEL INTRO
  // -----------------------------------------
  const activateUser = () => {
    if (!user) return;

    const updated = { ...user, is_active: true };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));

    console.log("AuthProvider: usuario activado en contexto:", updated);
  };

  ////////////////////////////////////const para el chekeo de session 
  const checkSession = async () => {
  const savedToken = localStorage.getItem("token");
  if (!savedToken) return logout();

  try {
    const res = await fetch(
      "http://localhost:5000/api/user/check-session",
      {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      }
    );

    if (!res.ok) throw new Error("Token inválido");

    const data = await res.json();

    if (!data.valid) {
      logout();
      return;
    }

    // sesión válida → no hacemos nada
    console.log("✅ Sesión válida");

  } catch (err) {
    console.warn("⛔ Sesión expirada o inválida");
    logout();
  }
};


  // -----------------------------------------
  // LOGOUT
  // -----------------------------------------
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    console.log("AuthProvider: logout ejecutado");
  };

  const isAuthenticated =
    token && token !== "undefined" && token !== null ? true : false;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        login,
        logout,
        activateUser,
        loadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

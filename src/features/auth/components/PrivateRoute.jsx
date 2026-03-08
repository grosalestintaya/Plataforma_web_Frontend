import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loadingAuth, user } = useAuth();

  if (loadingAuth) return <div className="p-6">Cargando sesión...</div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Evita que usuarios no activos entren a / (solo si NO está en /i)
  if (user && user.is_active === false) {
    return <Navigate to="/i" replace />;
  }

  return children;
}

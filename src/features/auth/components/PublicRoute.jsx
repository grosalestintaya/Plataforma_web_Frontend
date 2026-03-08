import React from "react";
import { Navigate } from "react-router-dom";

// Ajusta el import según cómo expongas tu auth
// Ejemplo: si guardas token en localStorage:
const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return Boolean(token && token !== "undefined");
};

export default function PublicRoute({ children, redirectTo = "/" }) {
  // Si está logueado, lo sacas de rutas públicas.
  if (isAuthenticated()) return <Navigate to={redirectTo} replace />;
  return children;
}

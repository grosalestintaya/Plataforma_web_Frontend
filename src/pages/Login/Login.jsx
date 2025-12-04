import React, { useState } from "react";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user,
          password,
        }),
      });

      if (!response.ok) {
        setError("Usuario o contraseña incorrectos.");
        setLoading(false);
        return;
      }

      const data = await response.json();

      // 🔐 Guardar token en el AuthContext
      login(data.token);

      // 🔎 Decodificar token
      const decoded = jwtDecode(data.token);
      console.log("🔍 JWT DECODIFICADO:", decoded);

      // 🧪 Validar campo is_active
      if (decoded.is_active === undefined) {
        console.warn("⚠️ ADVERTENCIA: El JWT NO contiene is_active");
      }

      // 🔀 Redirigir según estado del usuario
      if (decoded.is_active) {
        navigate("/");
      } else {
        navigate("/i");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div
        className="max-w-sm w-full rounded-xl shadow-lg overflow-hidden"
        style={{ backgroundColor: "#00C853" }}>
        <div
          className="w-full p-6 flex flex-col justify-center items-center backdrop-blur-sm"
          style={{ backgroundColor: "rgba(51, 51, 51, 0.1)" }}>
          <img
            src="src/assets/logo.PNG"
            alt="Logo"
            className="w-20 h-20 object-contain mb-2"
          />
          <h1 className="text-white text-2xl font-bold">Iniciar sesión</h1>
        </div>

        <form className="p-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <p className="text-red-100 bg-red-500/50 text-center rounded-lg py-1 mb-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-white font-medium mb-1">Usuario</label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 text-white font-medium py-2.5 rounded-lg ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-green-700"
            }`}
            style={{ backgroundColor: "#049140" }}>
            <LogIn size={20} />
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

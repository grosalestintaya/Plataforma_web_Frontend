import React, { useMemo, useState } from "react";
import { redirect, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { jwtDecode } from "jwt-decode";

import { Button } from "../../../shared/atoms/button";
import { Input } from "../../../shared/atoms/input";
import { AuthService } from "../services/Auth.Service";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      form.username.trim().length > 0 &&
      form.password.trim().length > 0 &&
      !loading
    );
  }, [form, loading]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username || !form.password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);

    try {
      // ✅ ya no usas localhost hardcodeado
      const data = await AuthService.login({
        username: form.username,
        password: form.password,
      });

      if (!data?.token) {
        setError("Respuesta inválida del servidor (no llegó token).");
        return;
      }

      // 🔐 Guardar token en el AuthContext
      login(data.token);

      // 🔎 Decodificar token
      const decoded = jwtDecode(data.token);
      console.log("🔍 JWT DECODIFICADO:", decoded);

      // 🧪 Validar campo is_active
      if (decoded?.is_active === undefined) {
        console.warn("⚠️ ADVERTENCIA: El JWT NO contiene is_active");
      }

      if (decoded?.is_active) {
        // 🔀 Redirigir según estado del usuario
        if (decoded?.is_active && decoded?.role === "Docente") {
          navigate("/app/teacher/heatmap", { replace: true });
        } else {
          navigate("/app", { replace: true });
        }
      } else {
        navigate("/i", { replace: true });
      }
    } catch (err) {
      console.error(err);

      // ✅ Mensaje más preciso (sin romper tu UI)
      if (err?.status === 401) {
        setError("Usuario o contraseña incorrectos.");
      } else {
        setError(err?.message || "Error al conectar con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f7f8] p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.4] blur-xs"
        aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="financial-pattern"
              x="0"
              y="0"
              width="200"
              height="200"
              patternUnits="userSpaceOnUse">
              <circle
                cx="40"
                cy="40"
                r="20"
                fill="none"
                stroke="#1fc16b"
                strokeWidth="2"
              />
              <circle
                cx="40"
                cy="40"
                r="15"
                fill="none"
                stroke="#1fc16b"
                strokeWidth="1.5"
              />

              <polyline
                points="120,60 135,40 150,55 165,30"
                fill="none"
                stroke="#1fc16b"
                strokeWidth="2"
              />
              <line
                x1="120"
                y1="70"
                x2="120"
                y2="60"
                stroke="#1fc16b"
                strokeWidth="2"
              />
              <line
                x1="135"
                y1="70"
                x2="135"
                y2="40"
                stroke="#1fc16b"
                strokeWidth="2"
              />
              <line
                x1="150"
                y1="70"
                x2="150"
                y2="55"
                stroke="#1fc16b"
                strokeWidth="2"
              />
              <line
                x1="165"
                y1="70"
                x2="165"
                y2="30"
                stroke="#1fc16b"
                strokeWidth="2"
              />

              <text
                x="65"
                y="150"
                fontSize="40"
                fill="#1fc16b"
                fontWeight="bold">
                $
              </text>

              <circle
                cx="150"
                cy="140"
                r="20"
                fill="none"
                stroke="#1fc16b"
                strokeWidth="2"
              />
              <path
                d="M 150 120 L 150 140 L 165 125 Z"
                fill="#1fc16b"
                opacity="0.5"
              />

              <polyline
                points="30,160 30,180 30,160 40,170 30,160 20,170"
                fill="none"
                stroke="#1fc16b"
                strokeWidth="2"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#financial-pattern)" />
        </svg>
      </div>

      {/* Brand */}
      <div className="relative z-10 text-center mb-8 ">
        <div className="w-40 h-25 cursor-pointer" onClick={() => navigate("/")}>
          <img
            src="/logo_full.webp"
            alt="Quipu Yachay"
            className="w-full h-full"
          />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#e5e5e5] p-8">
        <div className="text-center mb-8">
          <h2 className="text-[#1a1a1a] text-3xl font-bold mb-2">
            Bienvenido de vuelta
          </h2>
          <p className="text-[#6b6b6b] text-base">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {error ? (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="usuario"
              className="block text-[#1a1a1a] text-sm font-medium mb-2">
              Usuario
            </label>
            <Input
              id="usuario"
              name="username"
              type="text"
              placeholder="tu usuario"
              value={form.username}
              onChange={onChange}
              disabled={loading}
              className="h-12"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="contrasenia"
                className="block text-[#1a1a1a] text-sm font-medium">
                Contraseña
              </label>
            </div>
            <Input
              id="contrasenia"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
              disabled={loading}
              className="h-12"
            />
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-[#1fc16b] hover:bg-[#1ba557] text-white font-semibold rounded-lg h-12">
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </Button>
          </div>
        </form>
      </div>

      <footer className="relative z-10 mt-6 text-center max-w-md">
        <p className="text-[#6b6b6b] text-sm">
          Al continuar, aceptas nuestros términos de servicio y política de
          privacidad.
        </p>
      </footer>
    </div>
  );
}

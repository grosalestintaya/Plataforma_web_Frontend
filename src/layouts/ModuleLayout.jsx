// src/layouts/ModuleLayout.jsx
import { Outlet, Link } from "react-router-dom";

export default function ModuleLayout() {
  return (
    <div className="min-h-screen" style={{ background: "var(--qp-bg)" }}>
      {/* Top bar como tu segundo frame */}
      <div className="h-16 flex items-center justify-center"
           style={{ background: "var(--qp-topbar)" }}>
        <div className="w-full max-w-6xl px-6 flex items-center justify-between">
          <Link
            to="/"
            className="text-white font-black text-lg hover:opacity-90"
          >
            ⟵ Volver
          </Link>

          <div className="text-white font-black text-2xl tracking-tight">
            Tu relación con el dinero
          </div>

          <Link to="/ajustes" className="text-white font-black text-lg hover:opacity-90">
            ⚙
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}

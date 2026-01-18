import { useEffect, useMemo, useState } from "react";
import ShowDashboardTitle from "../../../../components/ui/ShowDashboardTitle";
import { useNavigate } from "react-router-dom";
import { Shield, Plus, ArrowLeft, Pencil, Search, KeyRound, UserCog } from "lucide-react";

import { DataService } from "../../../../services/data.service";
import { RolesService } from "../../../../services/roles.service";

const roleMeta = (name = "") => {
  const n = String(name).toLowerCase();

  if (n.includes("admin")) {
    return {
      label: "Admin",
      icon: <UserCog size={14} />,
      bg: "rgba(255,64,129,0.10)",
      bd: "rgba(255,64,129,0.28)",
      tx: "#B3125F",
    };
  }
  if (n.includes("doc")) {
    return {
      label: "Docente",
      icon: <KeyRound size={14} />,
      bg: "rgba(41,98,255,0.10)",
      bd: "rgba(41,98,255,0.22)",
      tx: "#1E4FD6",
    };
  }
  if (n.includes("estu")) {
    return {
      label: "Estudiante",
      icon: <Shield size={14} />,
      bg: "rgba(0,200,83,0.10)",
      bd: "rgba(0,200,83,0.22)",
      tx: "#0A7136",
    };
  }
  return {
    label: "Rol",
    icon: <Shield size={14} />,
    bg: "rgba(124,77,255,0.10)",
    bd: "rgba(124,77,255,0.22)",
    tx: "#6A3CFF",
  };
};

export default function ManageRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add | edit
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);

  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ type: "", msg: "" });

  const navigate = useNavigate();

  // UI helpers
  const inputBase = "w-full h-11 rounded-xl px-3 border outline-none transition";
  const ringFocus = "0 0 0 4px var(--sidebar-accent)";
  const surfaceStyle = {
    backgroundColor: "var(--ui-surface, #fff)",
    borderColor: "var(--card-border)",
  };
  const inputStyle = {
    backgroundColor: "white",
    borderColor: "var(--card-border)",
    color: "var(--card-text)",
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast({ type: "", msg: "" }), 1800);
  };

  // ========================
  // 📌 OBTENER ROLES
  // ========================
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await DataService.roles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      // 401 lo maneja apiClient (logout + redirect)
      if (err?.status !== 401) {
        console.error("Error al listar roles:", err);
        setRoles([]);
        showToast("error", err?.message || "No se pudieron cargar los roles");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => String(r?.name ?? "").toLowerCase().includes(q));
  }, [roles, query]);

  const stats = useMemo(() => ({ total: roles.length }), [roles]);

  // ========================
  // Modal
  // ========================
  const openAddModal = () => {
    setModalMode("add");
    setEditId(null);
    setName("");
    setShowModal(true);
  };

  const openEditModal = (role) => {
    setModalMode("edit");
    setEditId(role.id_rol); // se usa internamente, NO se muestra
    setName(role.name ?? "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSaving(false);
  };

  // ========================
  // Guardar
  // ========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const n = name.trim();
    if (!n) {
      showToast("error", "Escribe el nombre del rol");
      return;
    }

    try {
      setSaving(true);

      if (modalMode === "add") {
        await RolesService.create({ name: n });
      } else {
        await RolesService.update(editId, { name: n });
      }

      showToast("ok", modalMode === "add" ? "Rol agregado" : "Rol actualizado");
      closeModal();
      fetchRoles();
    } catch (err) {
      if (err?.status !== 401) {
        console.error("Error al guardar rol:", err);
        showToast("error", err?.message || "No se pudo guardar el rol");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 relative">
      <ShowDashboardTitle>Administrar roles</ShowDashboardTitle>

      {/* Panel particular: “permisos / seguridad” */}
      <div
        className="mt-6 rounded-3xl border p-5 shadow-sm"
        style={{ backgroundColor: "var(--chip-bg)", borderColor: "var(--card-border)" }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div
              className="h-12 w-12 rounded-2xl border flex items-center justify-center"
              style={{
                backgroundColor: "rgba(255,196,0,0.12)",
                borderColor: "rgba(255,196,0,0.28)",
                color: "var(--card-text)",
              }}
            >
              <Shield size={22} />
            </div>

            <div>
              <p className="text-sm font-bold" style={{ color: "var(--card-text)" }}>
                Roles y permisos
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--card-muted)" }}>
                Total roles: <span className="font-semibold">{stats.total}</span>
              </p>
              <p className="text-[11px] mt-1" style={{ color: "var(--card-muted)" }}>
                Recomendación: mantén nombres claros (Administrador, Docente, Estudiante).
              </p>
            </div>
          </div>

          <div className="flex gap-3 flex-col sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative w-full sm:w-[320px]">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
                style={{ color: "var(--card-muted)" }}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar rol..."
                className={`${inputBase} pl-10`}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.boxShadow = ringFocus)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </div>

            <button
              onClick={openAddModal}
              className="h-11 px-4 rounded-xl font-semibold shadow transition flex items-center justify-center gap-2"
              style={{ backgroundColor: "var(--sidebar)", color: "var(--sidebar-foreground)" }}
            >
              <Plus size={18} />
              Agregar
            </button>

            <button
              onClick={() => navigate(-1)}
              className="h-11 px-4 rounded-xl border font-semibold transition flex items-center justify-center gap-2"
              style={{ backgroundColor: "white", borderColor: "var(--card-border)", color: "var(--card-text)" }}
            >
              <ArrowLeft size={18} />
              Volver
            </button>
          </div>
        </div>

        {/* Toast */}
        {toast.msg ? (
          <div
            className="mt-4 rounded-2xl border p-3 text-sm"
            style={{
              borderColor: toast.type === "error" ? "rgba(255,64,129,0.35)" : "rgba(0,200,83,0.30)",
              backgroundColor: toast.type === "error" ? "rgba(255,64,129,0.10)" : "rgba(0,200,83,0.10)",
              color: "var(--card-text)",
            }}
          >
            <span className="font-semibold">{toast.type === "error" ? "Error:" : "Listo:"}</span>{" "}
            <span style={{ color: "var(--card-muted)" }}>{toast.msg}</span>
          </div>
        ) : null}
      </div>

      {/* Lista */}
      <div className="mt-6">
        {loading ? (
          <p className="text-sm" style={{ color: "var(--card-muted)" }}>
            Cargando roles...
          </p>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border p-6" style={surfaceStyle}>
            <p className="text-sm font-semibold" style={{ color: "var(--card-text)" }}>
              No hay roles registrados.
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--card-muted)" }}>
              Crea uno con el botón “Agregar”.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((role) => {
              const meta = roleMeta(role.name);
              return (
                <div
                  key={role.id_rol} // key interno OK; NO se renderiza
                  className="rounded-3xl border p-5 shadow-lg transition"
                  style={surfaceStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 0 4px var(--sidebar-accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-semibold px-3 py-1 rounded-xl border inline-flex items-center gap-2"
                          style={{
                            backgroundColor: meta.bg,
                            borderColor: meta.bd,
                            color: meta.tx,
                          }}
                        >
                          {meta.icon}
                          {meta.label}
                        </span>
                      </div>

                      <p className="text-sm font-bold capitalize truncate mt-3" style={{ color: "var(--card-text)" }}>
                        {role.name}
                      </p>

                      <p className="text-xs mt-2" style={{ color: "var(--card-muted)" }}>
                        Define el alcance de acceso dentro del sistema.
                      </p>
                    </div>

                    <button
                      onClick={() => openEditModal(role)}
                      className="h-10 px-3 rounded-xl border font-semibold transition flex items-center gap-2 shrink-0"
                      style={{
                        backgroundColor: "rgba(255,196,0,0.14)",
                        borderColor: "rgba(255,196,0,0.35)",
                        color: "#8A6B00",
                      }}
                    >
                      <Pencil size={16} />
                      Editar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div
            className="rounded-3xl shadow-xl p-6 w-[460px] max-w-[92vw] border relative"
            style={{ backgroundColor: "var(--ui-surface, #fff)", borderColor: "var(--card-border)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold" style={{ color: "var(--card-text)" }}>
                  {modalMode === "add" ? "Agregar rol" : "Editar rol"}
                </h2>
                <p className="text-xs mt-1" style={{ color: "var(--card-muted)" }}>
                  Nombra el rol de forma clara (ej: Administrador, Docente, Estudiante).
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="h-10 px-4 rounded-xl border font-semibold transition"
                style={{
                  backgroundColor: "white",
                  borderColor: "var(--card-border)",
                  color: "var(--card-text)",
                }}
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: "var(--card-muted)" }}>
                  Nombre del rol
                </label>
                <input
                  type="text"
                  placeholder="Ej: Administrador"
                  className={inputBase}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = ringFocus)}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  autoComplete="off"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="h-11 px-4 rounded-xl border font-semibold transition disabled:opacity-60"
                  style={{
                    backgroundColor: "white",
                    borderColor: "var(--card-border)",
                    color: "var(--card-text)",
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 px-5 rounded-xl font-semibold shadow transition disabled:opacity-60"
                  style={{
                    backgroundColor: modalMode === "add" ? "var(--sidebar)" : "var(--qy-green, #00C853)",
                    color: "white",
                  }}
                >
                  {saving ? "Guardando..." : modalMode === "add" ? "Agregar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

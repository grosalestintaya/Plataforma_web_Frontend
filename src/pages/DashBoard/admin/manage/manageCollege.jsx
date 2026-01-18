import { useEffect, useMemo, useState } from "react";
import ShowDashboardTitle from "../../../../components/ui/ShowDashboardTitle";
import { useNavigate } from "react-router-dom";
import { School, Plus, ArrowLeft, Pencil, MapPin, Search } from "lucide-react";

import { DataService } from "../../../../services/data.service";
import { SchoolsService } from "../../../../services/schools.service";

export default function ManageCollege() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add | edit

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [editId, setEditId] = useState(null);

  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ type: "", msg: "" });

  const navigate = useNavigate();

  // ========================
  // Helpers UI
  // ========================
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
  // 📌 OBTENER COLEGIOS
  // ========================
  const fetchSchools = async () => {
    setLoading(true);
    try {
      const data = await DataService.schools();
      setSchools(Array.isArray(data) ? data : []);
    } catch (err) {
      // 401 lo maneja apiClient (logout + redirect)
      if (err?.status !== 401) {
        console.error("Error al listar colegios:", err);
        setSchools([]);
        showToast("error", err?.message || "No se pudieron cargar los colegios");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========================
  // Filtro
  // ========================
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return schools;

    return schools.filter((s) =>
      `${s?.name ?? ""} ${s?.address ?? ""}`.toLowerCase().includes(q)
    );
  }, [schools, query]);

  const stats = useMemo(() => ({ total: schools.length }), [schools]);

  // ========================
  // 📌 ABRIR MODAL
  // ========================
  const openAddModal = () => {
    setModalMode("add");
    setEditId(null);
    setName("");
    setAddress("");
    setShowModal(true);
  };

  const openEditModal = (school) => {
    setModalMode("edit");
    setEditId(school.id_school);
    setName(school.name ?? "");
    setAddress(school.address ?? "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSaving(false);
  };

  // ========================
  // 📌 GUARDAR (ADD O EDIT)
  // ========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast({ type: "", msg: "" });

    const n = name.trim();
    const a = address.trim();
    if (!n || !a) {
      showToast("error", "Completa nombre y dirección");
      return;
    }

    try {
      setSaving(true);

      if (modalMode === "add") {
        await SchoolsService.create({ name: n, address: a });
      } else {
        await SchoolsService.update(editId, { name: n, address: a });
      }

      showToast("ok", modalMode === "add" ? "Colegio agregado" : "Colegio actualizado");
      closeModal();
      fetchSchools();
    } catch (err) {
      if (err?.status !== 401) {
        console.error("Error al guardar colegio:", err);
        showToast("error", err?.message || "No se pudo guardar el colegio");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 relative">
      <ShowDashboardTitle>Administrar colegios</ShowDashboardTitle>

      <div
        className="mt-6 rounded-3xl border p-5 shadow-sm"
        style={{ backgroundColor: "var(--chip-bg)", borderColor: "var(--card-border)" }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div
              className="h-12 w-12 rounded-2xl border flex items-center justify-center"
              style={{
                backgroundColor: "rgba(41,98,255,0.08)",
                borderColor: "rgba(41,98,255,0.18)",
                color: "var(--sidebar)",
              }}
            >
              <School size={22} />
            </div>

            <div>
              <p className="text-sm font-bold" style={{ color: "var(--card-text)" }}>
                Catálogo de colegios
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--card-muted)" }}>
                Total registrados: <span className="font-semibold">{stats.total}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-3 flex-col sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[360px]">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
                style={{ color: "var(--card-muted)" }}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o dirección..."
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

      <div className="mt-6">
        {loading ? (
          <p className="text-sm" style={{ color: "var(--card-muted)" }}>
            Cargando colegios...
          </p>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border p-6" style={surfaceStyle}>
            <p className="text-sm font-semibold" style={{ color: "var(--card-text)" }}>
              No hay colegios registrados.
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--card-muted)" }}>
              Puedes crear uno con el botón “Agregar”.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((school) => (
              <div
                key={school.id_school}
                className="rounded-3xl border p-5 shadow-lg transition"
                style={surfaceStyle}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 0 4px var(--sidebar-accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold capitalize truncate" style={{ color: "var(--card-text)" }}>
                      {school.name}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin size={16} style={{ color: "var(--card-muted)" }} />
                      <p className="text-xs truncate" style={{ color: "var(--card-muted)" }}>
                        {school.address}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openEditModal(school)}
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

                <div className="mt-4 flex items-center justify-between">
                  <span
                    className="text-[11px] font-semibold px-3 py-1 rounded-xl border"
                    style={{
                      backgroundColor: "var(--chip-bg)",
                      borderColor: "var(--card-border)",
                      color: "var(--card-muted)",
                    }}
                  >
                    ID: {school.id_school}
                  </span>

                  <span className="text-[11px]" style={{ color: "var(--card-muted)" }}>
                    Gestión de entidad base
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div
            className="rounded-3xl shadow-xl p-6 w-[460px] max-w-[92vw] border relative"
            style={{ backgroundColor: "var(--ui-surface, #fff)", borderColor: "var(--card-border)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold" style={{ color: "var(--card-text)" }}>
                  {modalMode === "add" ? "Agregar colegio" : "Editar colegio"}
                </h2>
                <p className="text-xs mt-1" style={{ color: "var(--card-muted)" }}>
                  {modalMode === "add"
                    ? "Crea un nuevo colegio para asignarlo a estudiantes/docentes."
                    : "Actualiza los datos del colegio seleccionado."}
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
                  Nombre del colegio
                </label>
                <input
                  type="text"
                  placeholder="Ej: I.E. José María Arguedas"
                  className={inputBase}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = ringFocus)}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: "var(--card-muted)" }}>
                  Dirección
                </label>
                <input
                  type="text"
                  placeholder="Ej: Av. Principal 123"
                  className={inputBase}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = ringFocus)}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  autoComplete="street-address"
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
                  className="h-11 px-5 rounded-xl font-semibold shadow transition disabled:opacity-60 flex items-center gap-2"
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

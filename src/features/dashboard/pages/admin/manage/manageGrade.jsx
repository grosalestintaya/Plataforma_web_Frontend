import { useEffect, useMemo, useState } from "react";
import ShowDashboardTitle from "../../../components/ShowDashboardTitle";
import { DataService } from "../../../services/data.service";
import { GradesService } from "../../../services/grades.service";
import { useNavigate } from "react-router-dom";
import Toast from "@/features/dashboard/components/Toast";
import {
  GraduationCap,
  Plus,
  ArrowLeft,
  Pencil,
  Search,
  Layers3,
} from "lucide-react";

export default function ManageGrade() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add | edit
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);

  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ type: "", msg: "" });

  const navigate = useNavigate();

  // UI helpers (consistente con tu theme)
  const inputBase =
    "w-full h-11 rounded-xl px-3 border outline-none transition";
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
  // 📌 OBTENER GRADOS
  // ========================
  const fetchGrades = async () => {
    setLoading(true);
    try {
      const data = await DataService.grades();
      setGrades(Array.isArray(data) ? data : []);
    } catch (err) {
      // 401 lo maneja apiClient (logout + redirect)
      if (err?.status !== 401) {
        console.error("Error al listar grados:", err);
        setGrades([]);
        showToast("error", err?.message || "No se pudieron cargar los grados");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========================
  // Filtro
  // ========================
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return grades;
    return grades.filter((g) => (g?.name ?? "").toLowerCase().includes(q));
  }, [grades, query]);

  const stats = useMemo(() => ({ total: grades.length }), [grades]);

  // ========================
  // Modal
  // ========================
  const openAddModal = () => {
    setModalMode("add");
    setEditId(null);
    setName("");
    setShowModal(true);
  };

  const openEditModal = (grade) => {
    setModalMode("edit");
    setEditId(grade.id_grade);
    setName(grade.name ?? "");
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
      showToast("error", "Escribe el nombre del grado");
      return;
    }

    try {
      setSaving(true);

      if (modalMode === "add") {
        await GradesService.create({ name: n });
      } else {
        await GradesService.update(editId, { name: n });
      }

      showToast(
        "ok",
        modalMode === "add" ? "Grado agregado" : "Grado actualizado",
      );
      closeModal();
      fetchGrades();
    } catch (err) {
      if (err?.status !== 401) {
        console.error("Error al guardar grado:", err);
        showToast("error", err?.message || "No se pudo guardar el grado");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 relative">
      <ShowDashboardTitle>Administrar grados</ShowDashboardTitle>

      {/* Panel particular (tipo “chips / niveles”) */}
      <div
        className="mt-6 rounded-3xl border p-5 shadow-sm"
        style={{
          backgroundColor: "var(--chip-bg)",
          borderColor: "var(--card-border)",
        }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div
              className="h-12 w-12 rounded-2xl border flex items-center justify-center"
              style={{
                backgroundColor: "rgba(124,77,255,0.10)",
                borderColor: "rgba(124,77,255,0.22)",
                color: "var(--card-text)",
              }}>
              <GraduationCap size={22} />
            </div>

            <div>
              <p
                className="text-sm font-bold"
                style={{ color: "var(--card-text)" }}>
                Catálogo de grados
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--card-muted)" }}>
                Total registrados:{" "}
                <span className="font-semibold">{stats.total}</span>
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
                placeholder="Buscar grado..."
                className={`${inputBase} pl-10`}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.boxShadow = ringFocus)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </div>

            <button
              onClick={openAddModal}
              className="h-11 px-4 rounded-xl font-semibold shadow transition flex items-center justify-center gap-2"
              style={{
                backgroundColor: "var(--sidebar)",
                color: "var(--sidebar-foreground)",
              }}>
              <Plus size={18} />
              Agregar
            </button>

            <button
              onClick={() => navigate(-1)}
              className="h-11 px-4 rounded-xl border font-semibold transition flex items-center justify-center gap-2"
              style={{
                backgroundColor: "white",
                borderColor: "var(--card-border)",
                color: "var(--card-text)",
              }}>
              <ArrowLeft size={18} />
              Volver
            </button>
          </div>
        </div>

        {/* “Chips” de preview */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(filtered.slice(0, 8) || []).map((g) => (
            <span
              key={g.id_grade}
              className="text-xs font-semibold px-3 py-1 rounded-xl border"
              style={{
                backgroundColor: "rgba(0,200,83,0.10)",
                borderColor: "rgba(0,200,83,0.24)",
                color: "var(--card-text)",
              }}>
              {g.name}
            </span>
          ))}
          {filtered.length > 8 ? (
            <span className="text-xs" style={{ color: "var(--card-muted)" }}>
              +{filtered.length - 8} más
            </span>
          ) : null}
        </div>

        {/* Toast */}
        <Toast
          toast={toast}
          onDismiss={() => setToast({ type: "", msg: "" })}
          duration={3000}
        />
      </div>

      {/* Lista */}
      <div className="mt-6">
        {loading ? (
          <p className="text-sm" style={{ color: "var(--card-muted)" }}>
            Cargando grados...
          </p>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border p-6" style={surfaceStyle}>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--card-text)" }}>
              No hay grados registrados.
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--card-muted)" }}>
              Crea uno con el botón “Agregar”.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((grade) => (
              <div
                key={grade.id_grade}
                className="rounded-3xl border p-5 shadow-lg transition"
                style={surfaceStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 0 0 4px var(--sidebar-accent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow = "none")
                }>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className="text-sm font-bold capitalize truncate"
                      style={{ color: "var(--card-text)" }}>
                      {grade.name}
                    </p>
                    <p
                      className="text-xs mt-2"
                      style={{ color: "var(--card-muted)" }}>
                      Etiqueta usada para asignación académica.
                    </p>
                  </div>

                  <button
                    onClick={() => openEditModal(grade)}
                    className="h-10 px-3 rounded-xl border font-semibold transition flex items-center gap-2 shrink-0"
                    style={{
                      backgroundColor: "rgba(255,196,0,0.14)",
                      borderColor: "rgba(255,196,0,0.35)",
                      color: "#8A6B00",
                    }}>
                    <Pencil size={16} />
                    Editar
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span
                    className="text-[11px] font-semibold px-3 py-1 rounded-xl border inline-flex items-center gap-2"
                    style={{
                      backgroundColor: "var(--chip-bg)",
                      borderColor: "var(--card-border)",
                      color: "var(--card-muted)",
                    }}>
                    <Layers3 size={14} />
                    ID: {grade.id_grade}
                  </span>

                  <span
                    className="text-[11px]"
                    style={{ color: "var(--card-muted)" }}>
                    Admin · Grados
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div
            className="rounded-3xl shadow-xl p-6 w-[460px] max-w-[92vw] border relative"
            style={{
              backgroundColor: "var(--ui-surface, #fff)",
              borderColor: "var(--card-border)",
            }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  className="text-lg font-bold"
                  style={{ color: "var(--card-text)" }}>
                  {modalMode === "add" ? "Agregar grado" : "Editar grado"}
                </h2>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--card-muted)" }}>
                  {modalMode === "add"
                    ? "Crea un grado para asignarlo a estudiantes."
                    : "Actualiza el nombre del grado seleccionado."}
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
                }}>
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-5">
              <div className="space-y-2">
                <label
                  className="text-sm font-semibold"
                  style={{ color: "var(--card-muted)" }}>
                  Nombre del grado
                </label>
                <input
                  type="text"
                  placeholder="Ej: 2° Secundaria"
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
                  }}>
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 px-5 rounded-xl font-semibold shadow transition disabled:opacity-60"
                  style={{
                    backgroundColor:
                      modalMode === "add"
                        ? "var(--sidebar)"
                        : "var(--qy-green, #00C853)",
                    color: "white",
                  }}>
                  {saving
                    ? "Guardando..."
                    : modalMode === "add"
                      ? "Agregar"
                      : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

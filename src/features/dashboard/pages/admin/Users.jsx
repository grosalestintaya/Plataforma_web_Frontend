import React, { useCallback, useEffect, useMemo, useState } from "react";
import ShowDashboardTitle from "../../components/ShowDashboardTitle";
import { UsersService } from "../../services/users.service";
import Toast from "../../components/Toast";

const PAGE_SIZE = 7;
const clampStr = (v) => (v ?? "").toString();

const Field = ({ label, children, hint }) => (
  <div className="flex flex-col gap-1">
    <label
      className="text-sm font-semibold"
      style={{ color: "var(--card-muted)" }}>
      {label}
    </label>
    {children}
    {hint ? (
      <p className="text-xs" style={{ color: "var(--card-muted)" }}>
        {hint}
      </p>
    ) : null}
  </div>
);

const getRolName = (u) =>
  u?.rol?.name ?? u?.Rol?.name ?? u?.role ?? u?.rol ?? "—";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // form modal
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [dni, setDni] = useState("");
  const [pinnedImg, setPinnedImg] = useState("default");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // toast único
  const [toast, setToast] = useState({ msg: null, type: "ok" });
  const showToast = useCallback(
    (msg, type = "ok") => setToast({ msg, type }),
    [],
  );
  const clearToast = useCallback(() => setToast({ msg: null, type: "ok" }), []);

  // ======================== LISTAR USUARIOS ========================
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await UsersService.list();
        if (!alive) return;
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err?.status !== 401)
          showToast(
            err?.message || "No se pudieron cargar los usuarios",
            "error",
          );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [showToast]);

  // ======================== FILTRO + ORDEN + PAGINACIÓN ========================
  const sorted = useMemo(() => {
    const q = search.toLowerCase().trim();
    const base = q
      ? users.filter((u) => {
          const haystack =
            `${clampStr(u.name)} ${clampStr(u.lastname)} ${clampStr(u.username)} ${clampStr(getRolName(u))}`.toLowerCase();
          return haystack.includes(q);
        })
      : [...users];

    return base.sort((a, b) =>
      clampStr(a.name).localeCompare(clampStr(b.name), "es", {
        sensitivity: "base",
      }),
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  // resetear página al buscar
  useEffect(() => {
    setPage(1);
  }, [search]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => Boolean(u.is_active)).length;
    return { total, active, inactive: total - active };
  }, [users]);

  // ======================== MODAL ========================
  const openModal = async (id) => {
    try {
      const data = await UsersService.getById(id);
      const u = data?.user ?? data;
      if (!u) throw new Error("No se pudo obtener usuario");
      setEditUser(u);
      setName(u.name || "");
      setLastname(u.lastname || "");
      setUsername(u.username || "");
      setDni(u.dni || "");
      setPinnedImg(u.pinned_img || "default");
      setPassword("");
      setIsActive(Boolean(u.is_active));
      setShowModal(true);
    } catch (err) {
      if (err?.status !== 401)
        showToast(
          err?.message || "No se pudo cargar la información del usuario",
          "error",
        );
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditUser(null);
    setPassword("");
    setSaving(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    try {
      await UsersService.update({
        userId: editUser.id_user,
        name,
        lastname,
        username,
        dni,
        pinned_img: pinnedImg,
        password: password?.trim() ? password : "",
        is_active: isActive,
      });

      const patch = {
        ...editUser,
        name,
        lastname,
        username,
        dni,
        pinned_img: pinnedImg,
        is_active: isActive,
      };
      setUsers((prev) =>
        prev.map((u) =>
          u.id_user === editUser.id_user ? { ...u, ...patch } : u,
        ),
      );

      showToast("Cambios guardados correctamente", "ok");
      setTimeout(() => closeModal(), 650);
    } catch (err) {
      if (err?.status !== 401)
        showToast(
          err?.message || "No se pudieron guardar los cambios",
          "error",
        );
    } finally {
      setSaving(false);
    }
  };

  // ======================== UI ========================
  const inputBase =
    "w-full h-11 rounded-xl px-3 border outline-none transition";
  const boxShadowFocus = "0 0 0 4px var(--sidebar-accent)";
  const inputStyle = {
    backgroundColor: "white",
    borderColor: "var(--card-border)",
    color: "var(--card-text)",
  };

  return (
    <div className="p-6">
      <ShowDashboardTitle>Usuarios</ShowDashboardTitle>

      {/* Toolbar */}
      <div
        className="mt-6 rounded-2xl border p-5 shadow-sm"
        style={{
          backgroundColor: "var(--chip-bg)",
          borderColor: "var(--card-border)",
        }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <Field label="Buscar" hint="">
              <input
                type="text"
                placeholder="Ej: estudiante, docente, @juan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={inputBase}
                style={inputStyle}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = boxShadowFocus)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </Field>
          </div>
          <div className="flex gap-3 flex-wrap lg:justify-end">
            <StatPill label="Total" value={stats.total} />
            <StatPill label="Activos" value={stats.active} tone="success" />
            <StatPill label="Inactivos" value={stats.inactive} tone="danger" />
          </div>
        </div>

        {loading && (
          <p className="mt-4 text-sm" style={{ color: "var(--card-muted)" }}>
            Cargando usuarios...
          </p>
        )}
      </div>

      {/* Table Card */}
      {!loading && (
        <div
          className="mt-6 rounded-3xl border shadow-lg overflow-hidden"
          style={{
            backgroundColor: "var(--ui-surface, #fff)",
            borderColor: "var(--card-border)",
          }}>
          {paginated.length === 0 ? (
            <div className="p-6">
              <p className="text-sm" style={{ color: "var(--card-muted)" }}>
                No se encontraron coincidencias.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead
                    style={{
                      backgroundColor: "var(--sidebar)",
                      color: "var(--sidebar-foreground)",
                    }}>
                    <tr>
                      <th className="p-4 text-left text-sm font-semibold">
                        Nombre
                      </th>
                      <th className="p-4 text-left text-sm font-semibold">
                        Usuario
                      </th>
                      <th className="p-4 text-left text-sm font-semibold">
                        Rol
                      </th>
                      <th className="p-4 text-left text-sm font-semibold">
                        Estado
                      </th>
                      <th className="p-4 text-center text-sm font-semibold">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((u) => (
                      <tr
                        key={u.id_user}
                        className="border-b transition"
                        style={{ borderColor: "var(--card-border)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "rgba(2,6,23,0.03)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }>
                        <td className="p-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="h-9 w-9 rounded-xl border flex items-center justify-center text-xs font-bold"
                              style={{
                                borderColor: "var(--card-border)",
                                backgroundColor: "var(--chip-bg)",
                                color: "var(--sidebar)",
                              }}>
                              {getInitials(u.name, u.lastname)}
                            </div>
                            <div className="min-w-0">
                              <p
                                className="text-sm font-semibold truncate"
                                style={{ color: "var(--card-text)" }}>
                                {u.name} {u.lastname}
                              </p>
                              <p
                                className="text-xs truncate"
                                style={{ color: "var(--card-muted)" }}>
                                DNI: {clampStr(u.dni) || "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className="text-sm"
                            style={{ color: "var(--card-muted)" }}>
                            @{u.username}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "var(--card-text)" }}>
                            {getRolName(u)}
                          </span>
                        </td>
                        <td className="p-4">
                          <StatusPill active={Boolean(u.is_active)} />
                        </td>
                        <td className="p-4 text-center">
                          <button
                            className="h-10 px-4 rounded-xl font-semibold shadow-sm border transition"
                            style={{
                              borderColor: "var(--card-border)",
                              backgroundColor: "var(--usercard-bg)",
                              color: "var(--sidebar)",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.boxShadow =
                                "0 0 0 4px var(--sidebar-accent)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.boxShadow = "none")
                            }
                            onClick={() => openModal(u.id_user)}>
                            Ver / Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ===== PAGINACIÓN ===== */}
              <div
                className="flex items-center justify-between px-5 py-3 border-t"
                style={{ borderColor: "var(--card-border)" }}>
                <p className="text-xs" style={{ color: "var(--card-muted)" }}>
                  {sorted.length === 0
                    ? "Sin resultados"
                    : `Mostrando ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, sorted.length)} de ${sorted.length} usuarios`}
                </p>

                <div className="flex items-center gap-1">
                  {/* Anterior */}
                  <PagBtn
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    label="←"
                  />

                  {/* Números */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (n) =>
                        n === 1 || n === totalPages || Math.abs(n - page) <= 1,
                    )
                    .reduce((acc, n, idx, arr) => {
                      if (idx > 0 && n - arr[idx - 1] > 1)
                        acc.push(
                          <span
                            key={`ellipsis-${n}`}
                            className="px-1 text-xs"
                            style={{ color: "var(--card-muted)" }}>
                            …
                          </span>,
                        );
                      acc.push(
                        <PagBtn
                          key={n}
                          onClick={() => setPage(n)}
                          active={page === n}
                          label={n}
                        />,
                      );
                      return acc;
                    }, [])}

                  {/* Siguiente */}
                  <PagBtn
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    label="→"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= MODAL ================= */}
      {showModal && editUser && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-start pt-8 z-50">
          <div
            className="rounded-3xl shadow-xl p-6 w-[980px] max-w-[95vw] max-h-[90vh] overflow-y-auto border"
            style={{
              backgroundColor: "var(--ui-surface, #fff)",
              borderColor: "var(--card-border)",
            }}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2
                  className="text-xl font-bold truncate"
                  style={{ color: "var(--card-text)" }}>
                  Editar usuario — {editUser.name} {editUser.lastname}
                </h2>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--card-muted)" }}>
                  ID #{editUser.id_user} • Rol: {getRolName(editUser)}
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

            <form onSubmit={handleSave} className="mt-6 grid grid-cols-3 gap-6">
              {/* COLUMNA 1: Imagen + estado */}
              <div className="flex flex-col items-center gap-4">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--card-muted)" }}>
                  Imagen de perfil
                </p>
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full blur-xl opacity-35"
                    style={{ backgroundColor: "var(--sidebar)" }}
                  />
                  <img
                    src={`/avatars/${pinnedImg || "default"}.webp`}
                    alt="preview"
                    className="relative w-32 h-32 rounded-full border-4 object-cover"
                    style={{
                      borderColor: "var(--sidebar)",
                      backgroundColor: "var(--chip-bg)",
                    }}
                  />
                </div>
                <div className="w-full">
                  <Field
                    label="Código de avatar"
                    hint="Ej: default, img-1, img-2...">
                    <input
                      type="text"
                      value={pinnedImg}
                      onChange={(e) => setPinnedImg(e.target.value)}
                      className={inputBase}
                      style={inputStyle}
                      onFocus={(e) =>
                        (e.currentTarget.style.boxShadow = boxShadowFocus)
                      }
                      onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                    />
                  </Field>
                </div>
                <div className="w-full">
                  <Field label="Estado">
                    <div
                      className="w-full rounded-2xl border p-3 flex items-center justify-between"
                      style={{
                        borderColor: "var(--card-border)",
                        backgroundColor: "var(--chip-bg)",
                      }}>
                      <StatusPill active={isActive} />
                      <label
                        className="flex items-center gap-2 text-sm font-semibold"
                        style={{ color: "var(--card-text)" }}>
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                        />
                        Activo
                      </label>
                    </div>
                  </Field>
                </div>
              </div>

              {/* COLUMNA 2: Solo lectura */}
              <div className="space-y-4">
                <Field label="Rol">
                  <input
                    type="text"
                    value={getRolName(editUser)}
                    readOnly
                    className={inputBase}
                    style={{
                      ...inputStyle,
                      backgroundColor: "rgba(2,6,23,0.04)",
                      color: "rgba(2,6,23,0.65)",
                      cursor: "not-allowed",
                    }}
                  />
                </Field>
                <Field label="Colegio">
                  <input
                    type="text"
                    value={editUser.school?.name || ""}
                    readOnly
                    className={inputBase}
                    style={{
                      ...inputStyle,
                      backgroundColor: "rgba(2,6,23,0.04)",
                      color: "rgba(2,6,23,0.65)",
                      cursor: "not-allowed",
                    }}
                  />
                </Field>
                <Field label="Grado">
                  <input
                    type="text"
                    value={editUser.grade?.name || ""}
                    readOnly
                    className={inputBase}
                    style={{
                      ...inputStyle,
                      backgroundColor: "rgba(2,6,23,0.04)",
                      color: "rgba(2,6,23,0.65)",
                      cursor: "not-allowed",
                    }}
                  />
                </Field>
              </div>

              {/* COLUMNA 3: Editables */}
              <div className="space-y-4">
                <Field label="Nombre">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputBase}
                    style={inputStyle}
                    onFocus={(e) =>
                      (e.currentTarget.style.boxShadow = boxShadowFocus)
                    }
                    onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  />
                </Field>
                <Field label="Apellidos">
                  <input
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    className={inputBase}
                    style={inputStyle}
                    onFocus={(e) =>
                      (e.currentTarget.style.boxShadow = boxShadowFocus)
                    }
                    onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  />
                </Field>
                <Field label="Usuario">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={inputBase}
                    style={inputStyle}
                    onFocus={(e) =>
                      (e.currentTarget.style.boxShadow = boxShadowFocus)
                    }
                    onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  />
                </Field>
                <Field label="DNI" hint="El campo solo acepta 8 dígitos.">
                  <input
                    type="text"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    className={inputBase}
                    style={inputStyle}
                    inputMode="numeric"
                    onFocus={(e) =>
                      (e.currentTarget.style.boxShadow = boxShadowFocus)
                    }
                    onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  />
                </Field>
                <Field
                  label="Nueva contraseña"
                  hint="Déjalo vacío para no cambiarla.">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Opcional"
                    className={inputBase}
                    style={inputStyle}
                    onFocus={(e) =>
                      (e.currentTarget.style.boxShadow = boxShadowFocus)
                    }
                    onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  />
                </Field>
              </div>

              {/* Actions */}
              <div className="col-span-3 flex justify-end gap-3 mt-2">
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
                  className="h-11 px-6 rounded-xl font-semibold shadow transition disabled:opacity-60"
                  style={{
                    backgroundColor: "var(--sidebar)",
                    color: "var(--sidebar-foreground)",
                  }}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== TOAST ===== */}
      <Toast toast={toast} onDismiss={clearToast} user={editUser} />
    </div>
  );
}

// ---------------- helpers ----------------
function getInitials(name = "", lastname = "") {
  const a = (name || "").trim()[0] || "";
  const b = (lastname || "").trim()[0] || "";
  return (a + b).toUpperCase() || "U";
}

function PagBtn({ onClick, disabled, active, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-8 min-w-[32px] px-2 rounded-lg text-xs font-semibold border transition disabled:opacity-40"
      style={{
        backgroundColor: active ? "var(--sidebar)" : "transparent",
        color: active ? "var(--sidebar-foreground)" : "var(--card-text)",
        borderColor: active ? "var(--sidebar)" : "var(--card-border)",
      }}>
      {label}
    </button>
  );
}

function StatPill({ label, value, tone = "neutral" }) {
  const palette =
    tone === "success"
      ? {
          bg: "rgba(0,200,83,0.12)",
          border: "rgba(0,200,83,0.25)",
          text: "#0A7136",
        }
      : tone === "danger"
        ? {
            bg: "rgba(255,64,129,0.12)",
            border: "rgba(255,64,129,0.25)",
            text: "#C2185B",
          }
        : {
            bg: "rgba(41,98,255,0.10)",
            border: "rgba(41,98,255,0.20)",
            text: "var(--sidebar)",
          };

  return (
    <div
      className="px-3 py-2 rounded-xl border text-xs font-semibold"
      style={{
        backgroundColor: palette.bg,
        borderColor: palette.border,
        color: palette.text,
      }}>
      {label}: {value}
    </div>
  );
}

function StatusPill({ active }) {
  return (
    <span
      className="px-3 py-1 rounded-xl text-xs font-semibold border inline-flex items-center gap-2"
      style={{
        backgroundColor: active
          ? "rgba(0,200,83,0.10)"
          : "rgba(255,64,129,0.10)",
        borderColor: active ? "rgba(0,200,83,0.25)" : "rgba(255,64,129,0.25)",
        color: active ? "#0A7136" : "#C2185B",
      }}>
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: active ? "#00C853" : "#FF4081" }}
      />
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

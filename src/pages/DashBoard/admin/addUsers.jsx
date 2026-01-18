import React, { useEffect, useMemo, useState } from "react";
import ShowDashboardTitle from "../../../components/ui/ShowDashboardTitle";
import { DataService } from "../../../services/data.service";
import { UsersService } from "../../../services/users.service";

const Field = ({ label, children, hint }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold" style={{ color: "var(--card-muted)" }}>
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

const INITIAL_FORM = {
  id_rol: "",
  id_grade: "",
  id_school: "",
  name: "",
  lastname: "",
  username: "",
  dni: "",
  password: "",
};

export default function AddUsers() {
  const [roles, setRoles] = useState([]);
  const [grades, setGrades] = useState([]);
  const [schools, setSchools] = useState([]);

  const [selectedRole, setSelectedRole] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Carga inicial (roles/grades/schools) centralizada
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [rolesData, gradesData, schoolsData] = await Promise.all([
          DataService.roles(),
          DataService.grades(),
          DataService.schools(),
        ]);

        if (!alive) return;

        setRoles(Array.isArray(rolesData) ? rolesData : []);
        setGrades(Array.isArray(gradesData) ? gradesData : []);
        setSchools(Array.isArray(schoolsData) ? schoolsData : []);
      } catch (err) {
        // Si fue 401, apiClient ya hizo logout + redirect
        if (err?.status !== 401) {
          console.error("Error cargando data:", err);
          setError(err?.message || "Error al cargar data inicial");
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const roleLabel = useMemo(() => {
    const r = roles.find((x) => String(x.id_rol) === String(selectedRole));
    return r?.name ?? "";
  }, [roles, selectedRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "id_rol") {
      const nextRole = String(value);
      setSelectedRole(nextRole);

      // limpieza automática de campos dependientes
      if (nextRole !== "3") {
        setFormData((prev) => ({ ...prev, id_grade: "" }));
      }
      if (nextRole === "") {
        setFormData((prev) => ({ ...prev, id_school: "" }));
      }
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setSelectedRole("");
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage(null);
    setError(null);

    const payload = {
      ...formData,
      id_rol: Number(formData.id_rol),
      id_grade: Number(formData.id_grade) || null,
      id_school: Number(formData.id_school) || null,
    };

    try {
      await UsersService.create(payload);
      setMessage("Usuario creado exitosamente");
      resetForm();
    } catch (err) {
      if (err?.status !== 401) {
        setError(err?.message || "Error al crear usuario");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputBase = "w-full h-11 rounded-xl px-3 border outline-none transition";
  const selectBase = "w-full h-11 rounded-xl px-3 border outline-none transition bg-white";

  const inputStyle = {
    backgroundColor: "white",
    borderColor: "var(--card-border)",
    color: "var(--card-text)",
  };

  const focusStyle = {
    boxShadow: "0 0 0 4px var(--sidebar-accent)",
  };

  return (
    <div className="p-6">
      <ShowDashboardTitle>Agregar Usuarios</ShowDashboardTitle>

      {/* Panel superior con contexto */}
      <div
        className="mt-6 rounded-2xl border p-5 shadow-sm"
        style={{ backgroundColor: "var(--chip-bg)", borderColor: "var(--card-border)" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: "var(--card-text)" }}>
              Creación de cuentas
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--card-muted)" }}>
              Selecciona un rol y completa los datos. Los campos de grado/colegio se muestran según el rol.
            </p>
          </div>

          <div
            className="px-3 py-2 rounded-xl border text-xs font-semibold"
            style={{
              borderColor: "var(--card-border)",
              backgroundColor: "var(--usercard-bg)",
              color: "var(--sidebar)",
            }}
          >
            Rol: {roleLabel || "—"}
          </div>
        </div>

        {/* Mensajes */}
        {(message || error) && (
          <div
            className="mt-4 rounded-2xl border p-3 text-sm"
            style={{
              borderColor: error ? "rgba(255,64,129,0.35)" : "rgba(0,200,83,0.30)",
              backgroundColor: error ? "rgba(255,64,129,0.10)" : "rgba(0,200,83,0.10)",
              color: "var(--card-text)",
            }}
          >
            <span className="font-semibold">{error ? "Error:" : "Listo:"}</span>{" "}
            <span style={{ color: "var(--card-muted)" }}>{error || message}</span>
          </div>
        )}
      </div>

      {/* Form Card */}
      <div
        className="mt-6 rounded-3xl border shadow-lg p-6"
        style={{ backgroundColor: "var(--ui-surface, #fff)", borderColor: "var(--card-border)" }}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* ROL */}
          <div className="col-span-2">
            <Field label="Rol" hint="Esto define qué campos adicionales se pedirán.">
              <select
                name="id_rol"
                value={formData.id_rol}
                onChange={handleChange}
                className={selectBase}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.boxShadow = focusStyle.boxShadow)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <option value="">Seleccione un rol...</option>
                {roles.map((r) => (
                  <option key={r.id_rol} value={String(r.id_rol)}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* BLOQUE CONDICIONAL */}
          {selectedRole === "3" && (
            <>
              <div>
                <Field label="Grado">
                  <select
                    name="id_grade"
                    value={formData.id_grade}
                    onChange={handleChange}
                    className={selectBase}
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.boxShadow = focusStyle.boxShadow)}
                    onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  >
                    <option value="">Seleccione grado</option>
                    {grades.map((g) => (
                      <option key={g.id_grade} value={String(g.id_grade)}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div>
                <Field label="Colegio">
                  <select
                    name="id_school"
                    value={formData.id_school}
                    onChange={handleChange}
                    className={selectBase}
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.boxShadow = focusStyle.boxShadow)}
                    onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  >
                    <option value="">Seleccione colegio</option>
                    {schools.map((s) => (
                      <option key={s.id_school} value={String(s.id_school)}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </>
          )}

          {selectedRole === "2" && (
            <div className="col-span-2">
              <Field label="Colegio">
                <select
                  name="id_school"
                  value={formData.id_school}
                  onChange={handleChange}
                  className={selectBase}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = focusStyle.boxShadow)}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  <option value="">Seleccione colegio</option>
                  {schools.map((s) => (
                    <option key={s.id_school} value={String(s.id_school)}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          {/* CAMPOS GENERALES */}
          <Field label="Nombres">
            <input
              name="name"
              placeholder="Ej: Juan"
              onChange={handleChange}
              value={formData.name}
              className={inputBase}
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.boxShadow = focusStyle.boxShadow)}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </Field>

          <Field label="Apellidos">
            <input
              name="lastname"
              placeholder="Ej: Pérez"
              onChange={handleChange}
              value={formData.lastname}
              className={inputBase}
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.boxShadow = focusStyle.boxShadow)}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </Field>

          <Field label="Usuario">
            <input
              name="username"
              placeholder="Ej: jperez"
              onChange={handleChange}
              value={formData.username}
              className={inputBase}
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.boxShadow = focusStyle.boxShadow)}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </Field>

          <Field label="DNI" hint="8 dígitos. Debe ser único.">
            <input
              name="dni"
              placeholder="Ej: 12345678"
              onChange={handleChange}
              value={formData.dni}
              className={inputBase}
              style={inputStyle}
              inputMode="numeric"
              onFocus={(e) => (e.currentTarget.style.boxShadow = focusStyle.boxShadow)}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </Field>

          <div className="col-span-2">
            <Field label="Contraseña">
              <input
                name="password"
                placeholder="Mínimo recomendado 6–8 caracteres"
                type="password"
                onChange={handleChange}
                value={formData.password}
                className={inputBase}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.boxShadow = focusStyle.boxShadow)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </Field>
          </div>

          {/* ACCIONES */}
          <div className="col-span-2 flex items-center justify-between gap-3 mt-2">
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="h-11 px-4 rounded-xl border font-semibold transition disabled:opacity-60"
              style={{
                backgroundColor: "white",
                borderColor: "var(--card-border)",
                color: "var(--card-text)",
              }}
            >
              Limpiar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-11 px-6 rounded-xl font-semibold shadow transition disabled:opacity-60"
              style={{
                backgroundColor: "var(--sidebar)",
                color: "var(--sidebar-foreground)",
              }}
            >
              {loading ? "Creando usuario..." : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

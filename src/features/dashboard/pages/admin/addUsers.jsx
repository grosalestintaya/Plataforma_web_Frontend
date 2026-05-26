import React, { useEffect, useMemo, useState } from "react";
import ShowDashboardTitle from "../../components/ShowDashboardTitle";
import { DataService } from "../../services/data.service";
import { UsersService } from "../../services/users.service";
import Toast from "../../components/Toast";
const Field = ({ label, children, hint, error }) => (
  <div className="flex flex-col gap-1.5">
    <label
      className="text-sm font-semibold"
      style={{ color: "var(--card-muted)" }}>
      {label}
    </label>

    {children}

    {error ? (
      <p className="text-xs font-medium text-red-500">{error}</p>
    ) : hint ? (
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

const INITIAL_ERRORS = {
  dni: "",
  password: "",
};

export default function AddUsers() {
  const [roles, setRoles] = useState([]);
  const [grades, setGrades] = useState([]);
  const [schools, setSchools] = useState([]);

  const [selectedRole, setSelectedRole] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);

  const [loading, setLoading] = useState(false);
  const [checkingDni, setCheckingDni] = useState(false);
  const [message, setMessage] = useState(null);
  const [toast, setToast] = useState({ msg: null, type: "ok" });

  const [error, setError] = useState(null);
  const showToast = (msg, type = "ok", title = null) =>
    setToast({ msg, type, ...(title && { title }) });
  const clearToast = () => setToast({ msg: null, type: "ok" });

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

  function validateDni(dni) {
    if (!dni.trim()) return "El DNI es obligatorio.";
    if (!/^\d{8}$/.test(dni)) {
      return "El DNI debe tener exactamente 8 dígitos.";
    }
    return "";
  }

  function validatePassword(password) {
    const value = String(password || "").trim();

    if (!value) return "La contraseña es obligatoria.";
    if (value.length < 5) {
      return "La contraseña debe tener al menos 5 caracteres.";
    }
    if (!/^[A-Za-z0-9]+$/.test(value)) {
      return "La contraseña solo debe contener letras y números.";
    }

    return "";
  }

  async function validateDniUnique(dni) {
    try {
      if (!dni || dni.length !== 8) return "";

      // Conecta aquí un endpoint real si lo tienes disponible.
      // Ejemplo:
      // const res = await UsersService.checkDni(dni);
      // if (res?.exists) return "Este DNI ya está registrado.";

      return "";
    } catch (err) {
      console.error("Error validando DNI único:", err);
      return "";
    }
  }

  async function handleBlur(e) {
    const { name, value } = e.target;

    if (name === "dni") {
      let nextError = validateDni(value);

      if (!nextError && value.length === 8) {
        setCheckingDni(true);
        const uniqueError = await validateDniUnique(value);
        setCheckingDni(false);
        nextError = uniqueError || "";
      }

      setErrors((prev) => ({
        ...prev,
        dni: nextError,
      }));
    }

    if (name === "password") {
      const nextError = validatePassword(value);
      setErrors((prev) => ({
        ...prev,
        password: nextError,
      }));
    }

    e.currentTarget.style.boxShadow = "none";
  }

  const roleLabel = useMemo(() => {
    const r = roles.find((x) => String(x.id_rol) === String(selectedRole));
    return r?.name ?? "";
  }, [roles, selectedRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let nextValue = value;
    const nextFormData = { ...formData };

    if (name === "dni") {
      nextValue = value.replace(/\D/g, "").slice(0, 8);
    }

    if (name === "password") {
      nextValue = value.replace(/\s/g, "");
    }

    nextFormData[name] = nextValue;

    if (name === "id_rol") {
      const nextRole = String(nextValue);
      setSelectedRole(nextRole);

      if (nextRole !== "3") {
        nextFormData.id_grade = "";
      }

      if (nextRole !== "2" && nextRole !== "3") {
        nextFormData.id_school = "";
      }
    }

    setFormData(nextFormData);

    if (name === "dni" || name === "password") {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setSelectedRole("");
    setErrors(INITIAL_ERRORS);
    setMessage(null);
    setError(null);
  };

  const isBaseComplete =
    formData.id_rol &&
    formData.name.trim() &&
    formData.lastname.trim() &&
    formData.username.trim() &&
    formData.dni.trim() &&
    formData.password.trim();

  const isRoleComplete =
    selectedRole === "3"
      ? formData.id_grade && formData.id_school
      : selectedRole === "2"
        ? formData.id_school
        : Boolean(formData.id_rol);

  const dniValidation = validateDni(formData.dni);
  const passwordValidation = validatePassword(formData.password);

  const canSubmit =
    Boolean(isBaseComplete) &&
    Boolean(isRoleComplete) &&
    !dniValidation &&
    !passwordValidation &&
    !errors.dni &&
    !errors.password &&
    !loading &&
    !checkingDni;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage(null);
    setError(null);

    const dniError = validateDni(formData.dni);
    const passwordError = validatePassword(formData.password);

    if (dniError || passwordError) {
      setErrors((prev) => ({
        ...prev,
        dni: dniError,
        password: passwordError,
      }));
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      id_rol: Number(formData.id_rol),
      id_grade: Number(formData.id_grade) || null,
      id_school: Number(formData.id_school) || null,
      password: formData.password.trim(),
    };

    try {
      await UsersService.create(payload);
      showToast("Usuario creado exitosamente.", "ok"); // antes: setMessage(...)
      resetForm();
    } catch (err) {
      if (err?.status !== 401) {
        showToast(err?.message || "Error al crear usuario.", "error"); // antes: setError(...)
      }
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full h-11 rounded-xl px-3 border outline-none transition";
  const selectBase =
    "w-full h-11 rounded-xl px-3 border outline-none transition bg-white";

  const inputStyle = {
    backgroundColor: "white",
    borderColor: "var(--card-border)",
    color: "var(--card-text)",
  };

  const focusStyle = {
    boxShadow: "0 0 0 4px var(--sidebar-accent)",
  };

  const getFieldStyle = (hasError) => ({
    ...inputStyle,
    borderColor: hasError ? "#ef4444" : inputStyle.borderColor,
  });

  return (
    <div className="p-6 pb-0 pt-0  h-full">
      <ShowDashboardTitle>Agregar usuarios </ShowDashboardTitle>

      <Toast
        toast={toast}
        onDismiss={clearToast}
        user={""} // el objeto con user.foto y user.nombre
        duration={3500}
      />
      <div
        className="mt-6 rounded-2xl border p-5 shadow-sm"
        style={{
          backgroundColor: "var(--chip-bg)",
          borderColor: "var(--card-border)",
        }}>
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--card-text)" }}>
          Agregar nuevo usuario al sistema
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--card-muted)" }}>
          Completa el formulario para crear un nuevo usuario. Asegúrate de que
          el DNI sea único y que la contraseña cumpla con los requisitos.
        </p>
      </div>
      <div
        className="mt-6 rounded-3xl border p-6 shadow-lg"
        style={{
          backgroundColor: "var(--ui-surface, #fff)",
          borderColor: "var(--card-border)",
        }}>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field
              label="Rol"
              hint="Esto define qué campos adicionales se pedirán.">
              <select
                name="id_rol"
                value={formData.id_rol}
                onChange={handleChange}
                className={selectBase}
                style={inputStyle}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = focusStyle.boxShadow)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}>
                <option value="">Seleccione un rol...</option>
                {roles.map((r) => (
                  <option key={r.id_rol} value={String(r.id_rol)}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

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
                    onFocus={(e) =>
                      (e.currentTarget.style.boxShadow = focusStyle.boxShadow)
                    }
                    onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}>
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
                    onFocus={(e) =>
                      (e.currentTarget.style.boxShadow = focusStyle.boxShadow)
                    }
                    onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}>
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
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = focusStyle.boxShadow)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}>
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

          <Field label="Nombres">
            <input
              name="name"
              placeholder="Ej: Juan"
              onChange={handleChange}
              value={formData.name}
              className={inputBase}
              style={inputStyle}
              onFocus={(e) =>
                (e.currentTarget.style.boxShadow = focusStyle.boxShadow)
              }
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
              onFocus={(e) =>
                (e.currentTarget.style.boxShadow = focusStyle.boxShadow)
              }
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
              onFocus={(e) =>
                (e.currentTarget.style.boxShadow = focusStyle.boxShadow)
              }
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </Field>

          <Field
            label="DNI"
            hint={
              checkingDni && formData.dni.length === 8
                ? "Validando DNI..."
                : "Debe tener 8 dígitos y ser único."
            }
            error={errors.dni}>
            <input
              name="dni"
              type="text"
              placeholder="Ej: 12345678"
              value={formData.dni}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputBase}
              style={getFieldStyle(Boolean(errors.dni))}
              inputMode="numeric"
              autoComplete="off"
              maxLength={8}
              aria-invalid={Boolean(errors.dni)}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = focusStyle.boxShadow;
              }}
            />
          </Field>

          <div className="col-span-2">
            <Field
              label="Contraseña"
              hint="Mínimo 5 caracteres. Solo letras y números."
              error={errors.password}>
              <input
                name="password"
                placeholder="Ej: abc12"
                type="password"
                onChange={handleChange}
                onBlur={handleBlur}
                value={formData.password}
                className={inputBase}
                style={getFieldStyle(Boolean(errors.password))}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = focusStyle.boxShadow)
                }
              />
            </Field>
          </div>

          <div className="col-span-2 mt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="h-11 rounded-xl border px-4 font-semibold transition disabled:opacity-60"
              style={{
                backgroundColor: "white",
                borderColor: "var(--card-border)",
                color: "var(--card-text)",
              }}>
              Limpiar
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              className="h-11 rounded-xl px-6 font-semibold shadow transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                backgroundColor: "var(--sidebar)",
                color: "var(--sidebar-foreground)",
              }}>
              {loading
                ? "Creando usuario..."
                : checkingDni
                  ? "Validando..."
                  : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

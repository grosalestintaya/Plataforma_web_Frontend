import { useMemo, useState } from "react";

function storageKey(moduleId, activityId) {
  return `progress:${moduleId}:${activityId}`;
}

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function ActivityPlayer({ moduleId, activity }) {
  const key = useMemo(
    () => storageKey(moduleId, activity.id),
    [moduleId, activity.id]
  );

  const initial = useMemo(() => {
    const fallback = {
      screenIndex: 0,
      completed: false,
      answers: {}, // { [screenId]: any }
    };
    return safeParse(localStorage.getItem(key), fallback);
  }, [key]);

  const [screenIndex, setScreenIndex] = useState(initial.screenIndex || 0);
  const [completed, setCompleted] = useState(!!initial.completed);
  const [answers, setAnswers] = useState(initial.answers || {});

  const screens = activity.screens || [];
  const screen = screens[screenIndex];

  function persist(next) {
    localStorage.setItem(key, JSON.stringify(next));
  }

  function setAnswer(screenId, value) {
    const nextAnswers = { ...answers, [screenId]: value };
    setAnswers(nextAnswers);
    persist({ screenIndex, completed, answers: nextAnswers });
  }

  function goPrev() {
    const nextIndex = Math.max(0, screenIndex - 1);
    setScreenIndex(nextIndex);
    persist({ screenIndex: nextIndex, completed, answers });
  }

  function canGoNext() {
    if (!screen) return false;

    const val = answers[screen.id];

    switch (screen.type) {
      case "quiz":
      case "truefalse":
      case "simulation":
        return val !== undefined && val !== null;

      case "match":
        // guardamos { [left]: right }
        return val && typeof val === "object" && Object.keys(val).length === (screen.pairs?.length || 0);

      case "steps": {
  const checked = Array.isArray(val) ? val : [];
  const total = screen.steps?.length || 0;

  if (screen.mustComplete === true) {
    return total > 0 && checked.length === total;
  }

  // si no es mustComplete, basta con que marque al menos 1
  return checked.length > 0;
}

      case "task":
        // checklist: guardamos Set serializado como array
        return Array.isArray(val) ? val.length > 0 : true; // si quieres "mustComplete", abajo

      case "reflection":
        if (screen.variant === "text") return typeof val === "string" && val.trim().length > 0;
        if (screen.variant === "scale") return Number.isFinite(val);
        return true;

      default:
        return true;
    }
  }

  function goNext() {
    if (!canGoNext()) return;

    const nextIndex = Math.min(screens.length - 1, screenIndex + 1);
    const isLast = nextIndex === screenIndex;

    if (isLast) {
      setCompleted(true);
      persist({ screenIndex, completed: true, answers });
      return;
    }

    setScreenIndex(nextIndex);
    persist({ screenIndex: nextIndex, completed, answers });
  }

  function finish() {
    setCompleted(true);
    persist({ screenIndex, completed: true, answers });
  }

  if (!screen) return <p>Contenido inválido: no hay pantallas.</p>;

return (
<div className="mx-auto max-w-4xl">
  <div
    className="rounded-[28px] shadow-xl px-10 py-10"
    style={{ background: "var(--qp-card)", color: "var(--qp-ink)" }}
  >
    {/* Header grande */}
    <div className="mb-8">
      <div className="inline-block px-8 py-6 rounded-2xl shadow-md bg-white">
        <h2 className="text-5xl font-black tracking-tight">
          {activity.title}
        </h2>
      </div>

      <div className="mt-5 text-lg font-bold" style={{ color: "var(--qp-muted)" }}>
        Pantalla {screenIndex + 1} de {screens.length}
        {completed ? " — COMPLETADO" : ""}
      </div>
    </div>

    {/* Contenido */}
    <div className="mt-6">
      <ScreenRenderer />
    </div>

    {/* Controles */}
    ...
  </div>
</div>

);

}

/* -------------------- Renderers -------------------- */

function ScreenRenderer({ screen, value, setValue }) {
  switch (screen.type) {
    case "intro":
    case "content":
    case "feedback":
      return (
        <BlockText title={screen.title} body={screen.body} />
      );

    case "microstory":
      return (
        <div>
          {screen.title ? <h3 style={{ marginTop: 0 }}>{screen.title}</h3> : null}
          {Array.isArray(screen.paragraphs) &&
            screen.paragraphs.map((p, idx) => (
              <p key={idx} style={{ whiteSpace: "pre-line" }}>{p}</p>
            ))}
          {(screen.character || screen.setting) && (
            <small style={{ opacity: 0.8 }}>
              {screen.character ? `Personaje: ${screen.character}. ` : ""}
              {screen.setting ? `Contexto: ${screen.setting}.` : ""}
            </small>
          )}
        </div>
      );

    case "quiz": {
      const selected = Number.isInteger(value) ? value : null;
      return (
        <div>
          <h3 style={{ marginTop: 0 }}>Pregunta</h3>
          <p>{screen.question}</p>

          <div style={{ display: "grid", gap: 8 }}>
            {(screen.options || []).map((opt, idx) => (
              <label key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="radio"
                  name={screen.id}
                  checked={selected === idx}
                  onChange={() => setValue(idx)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>

          <small style={{ display: "block", marginTop: 8 }}>
            {Number.isInteger(selected)
              ? "Respuesta seleccionada."
              : "Selecciona una opción para habilitar 'Siguiente'."}
          </small>
        </div>
      );
    }

    case "truefalse": {
      const selected = typeof value === "boolean" ? value : null;
      return (
        <div>
          <h3 style={{ marginTop: 0 }}>Verdadero o Falso</h3>
          <p>{screen.statement}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setValue(true)}
              style={{ padding: "8px 12px", borderRadius: 8 }}
            >
              Verdadero
            </button>
            <button
              type="button"
              onClick={() => setValue(false)}
              style={{ padding: "8px 12px", borderRadius: 8 }}
            >
              Falso
            </button>
          </div>

          <small style={{ display: "block", marginTop: 8 }}>
            {selected === null ? "Elige una opción para continuar." : "Respuesta seleccionada."}
          </small>
        </div>
      );
    }

    case "match": {
      // value: { [left]: right }
      const pairs = screen.pairs || [];
      const current = value && typeof value === "object" ? value : {};
      const rights = pairs.map((p) => p.right);

      return (
        <div>
          <h3 style={{ marginTop: 0 }}>{screen.prompt || "Empareja"}</h3>

          <div style={{ display: "grid", gap: 10 }}>
            {pairs.map((p) => (
              <div
                key={p.left}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>
                  {p.left}
                </div>

                <select
                  value={current[p.left] || ""}
                  onChange={(e) => setValue({ ...current, [p.left]: e.target.value })}
                  style={{ padding: 10, borderRadius: 8 }}
                >
                  <option value="" disabled>
                    Selecciona...
                  </option>
                  {rights.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <small style={{ display: "block", marginTop: 8 }}>
            Completa todos los emparejamientos para continuar.
          </small>
        </div>
      );
    }

    case "steps": {
      const steps = screen.steps || [];
      const mustComplete = screen.mustComplete === true;
      // value: array de índices completados
      const checked = Array.isArray(value) ? value : [];

      function toggle(idx) {
        const next = checked.includes(idx)
          ? checked.filter((x) => x !== idx)
          : [...checked, idx];
        setValue(next);
      }

      const doneAll = checked.length === steps.length && steps.length > 0;

      return (
        <div>
          <h3 style={{ marginTop: 0 }}>{screen.title || "Pasos"}</h3>

          <div style={{ display: "grid", gap: 8 }}>
            {steps.map((s, idx) => (
              <label key={idx} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <input
                  type="checkbox"
                  checked={checked.includes(idx)}
                  onChange={() => toggle(idx)}
                />
                <div>
                  <div>{s.text}</div>
                  {s.tip ? <small style={{ opacity: 0.8 }}>{s.tip}</small> : null}
                </div>
              </label>
            ))}
          </div>

          <small style={{ display: "block", marginTop: 8 }}>
            {mustComplete
              ? doneAll
                ? "Listo. Ya puedes continuar."
                : "Marca todos los pasos para habilitar 'Siguiente'."
              : "Marca los pasos que completes."}
          </small>

          {/* Si mustComplete, forzamos completitud: */}
          {mustComplete && (
            <GuardMustComplete expected={steps.length} value={checked} />
          )}
        </div>
      );
    }

    case "task": {
      // por ahora soportamos checklist
      const variant = screen.variant || "checklist";
      if (variant !== "checklist") {
        return <p>Task variant no soportada aún: {variant}</p>;
      }

      const items = screen.items || [];
      const checked = Array.isArray(value) ? value : [];

      function toggle(id) {
        const next = checked.includes(id)
          ? checked.filter((x) => x !== id)
          : [...checked, id];
        setValue(next);
      }

      return (
        <div>
          <h3 style={{ marginTop: 0 }}>{screen.title || "Tarea"}</h3>

          <div style={{ display: "grid", gap: 8 }}>
            {items.map((it) => (
              <label key={it.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={checked.includes(it.id)}
                  onChange={() => toggle(it.id)}
                />
                <span>{it.label}</span>
              </label>
            ))}
          </div>

          <small style={{ display: "block", marginTop: 8 }}>
            Marca al menos un ítem para continuar.
          </small>
        </div>
      );
    }

    case "simulation": {
      // value: choiceId
      const selected = typeof value === "string" ? value : null;
      const choices = screen.choices || [];

      return (
        <div>
          <h3 style={{ marginTop: 0 }}>{screen.title || "Simulación"}</h3>
          <p style={{ whiteSpace: "pre-line" }}>{screen.scenario}</p>

          <div style={{ display: "grid", gap: 8 }}>
            {choices.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setValue(c.id)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  textAlign: "left",
                  background: selected === c.id ? "#f3f3f3" : "white",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          <small style={{ display: "block", marginTop: 8 }}>
            {selected ? "Decisión registrada." : "Elige una opción para continuar."}
          </small>
        </div>
      );
    }

    case "reflection": {
      const variant = screen.variant || "text";

      if (variant === "text") {
        return (
          <div>
            <h3 style={{ marginTop: 0 }}>Reflexión</h3>
            <p style={{ whiteSpace: "pre-line" }}>{screen.prompt}</p>
            <textarea
              value={typeof value === "string" ? value : ""}
              onChange={(e) => setValue(e.target.value)}
              rows={4}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              placeholder="Escribe aquí..."
            />
            <small style={{ display: "block", marginTop: 8 }}>
              Escribe algo para continuar.
            </small>
          </div>
        );
      }

      if (variant === "scale") {
        const min = screen.scale?.min ?? 1;
        const max = screen.scale?.max ?? 5;
        const labels = screen.scale?.labels || [];
        const selected = Number.isFinite(value) ? value : null;

        return (
          <div>
            <h3 style={{ marginTop: 0 }}>Reflexión</h3>
            <p style={{ whiteSpace: "pre-line" }}>{screen.prompt}</p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Array.from({ length: max - min + 1 }).map((_, i) => {
                const n = min + i;
                const label = labels[i] || String(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setValue(n)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      border: "1px solid #ddd",
                      background: selected === n ? "#f3f3f3" : "white",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <small style={{ display: "block", marginTop: 8 }}>
              {selected ? "Respuesta registrada." : "Elige una opción para continuar."}
            </small>
          </div>
        );
      }

      return <p>Reflection variant no soportada: {variant}</p>;
    }

    case "checkpoint":
      return (
        <div>
          {screen.title ? <h3 style={{ marginTop: 0 }}>{screen.title}</h3> : null}
          {screen.message ? <p style={{ whiteSpace: "pre-line" }}>{screen.message}</p> : null}
          {screen.earned ? (
            <div style={{ marginTop: 10, padding: 10, border: "1px dashed #ccc", borderRadius: 10 }}>
              <strong>Recompensa</strong>
              <div>XP: {screen.earned.xp ?? 0}</div>
              {screen.earned.coins != null ? <div>Monedas: {screen.earned.coins}</div> : null}
              {screen.earned.badgeId ? <div>Insignia: {screen.earned.badgeId}</div> : null}
            </div>
          ) : null}
        </div>
      );

    default:
      return <p>Tipo de pantalla no soportado: {screen.type}</p>;
  }
}

function BlockText({ title, body }) {
  return (
    <div>
      {title ? <h3 style={{ marginTop: 0 }}>{title}</h3> : null}
      {body ? <p style={{ whiteSpace: "pre-line" }}>{body}</p> : null}
    </div>
  );
}

/* -------------------- Feedback -------------------- */

function InlineFeedback({ screen, value }) {
  if (!screen) return null;

  // quiz (soporta feedback anidado o legacy correctFeedback/wrongFeedback)
  if (screen.type === "quiz" && Number.isInteger(value)) {
    const isCorrect = value === screen.answerIndex;
    const ok = screen.feedback?.ok ?? screen.correctFeedback;
    const fail = screen.feedback?.fail ?? screen.wrongFeedback;

    return (
      <div>
        <strong>{isCorrect ? "Correcto." : "Incorrecto."}</strong>
        <div>{isCorrect ? ok : fail}</div>
      </div>
    );
  }

  // truefalse
  if (screen.type === "truefalse" && typeof value === "boolean") {
    const isCorrect = value === screen.answer;
    return (
      <div>
        <strong>{isCorrect ? "Correcto." : "Incorrecto."}</strong>
        <div>{isCorrect ? screen.feedback?.ok : screen.feedback?.fail}</div>
      </div>
    );
  }

  // match
  if (screen.type === "match" && value && typeof value === "object") {
    const pairs = screen.pairs || [];
    const done = Object.keys(value).length === pairs.length;
    if (!done) return null;

    const isCorrect = pairs.every((p) => value[p.left] === p.right);
    return (
      <div>
        <strong>{isCorrect ? "Correcto." : "Revisa tus emparejamientos."}</strong>
        <div>{isCorrect ? screen.feedback?.ok : screen.feedback?.fail}</div>
      </div>
    );
  }

  // simulation
  if (screen.type === "simulation" && typeof value === "string") {
    const choice = (screen.choices || []).find((c) => c.id === value);
    if (!choice) return null;
    return (
      <div>
        <strong>Resultado:</strong>
        <div>{choice.resultText}</div>
      </div>
    );
  }

  return null;
}

/* -------------------- Helpers -------------------- */
/**
 * No bloquea por sí mismo (bloqueo está en canGoNext),
 * pero sirve como recordatorio de intención.
 */
function GuardMustComplete({ expected, value }) {
  // En esta versión, canGoNext aún permite avanzar en steps si hay al menos 1 check.
  // Si quieres forzar 100% completitud, dímelo y lo hacemos estricto:
  // return null; (solo placeholder)
  return null;
}

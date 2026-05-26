import { useEffect, useRef } from "react";
import { resolveAvatar } from "../helpers/helpers";

const ICONS = { ok: "✓", error: "✗", info: "ℹ" };
const LABELS = { ok: "Listo", error: "Error", info: "Info" };

export default function Toast({ toast, onDismiss, duration = 5000, user }) {
  const barRef = useRef(null);

  useEffect(() => {
    if (!toast.msg) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [toast, duration, onDismiss]);

  if (!toast.msg) return null;

  const colors =
    {
      ok: {
        border: "var(--primary)",
        bg: "rgba(0,200,83,0.08)",
        text: "var(--primary)",
      },
      error: {
        border: "rgba(255,64,129,0.35)",
        bg: "rgba(255,64,129,0.08)",
        text: "#CC0044",
      },
      info: {
        border: "rgba(41,98,255,0.30)",
        bg: "rgba(41,98,255,0.07)",
        text: "#2962FF",
      },
    }[toast.type] ?? {};

  return (
    <div
      style={{
        position: "fixed",
        top: 20, // ← antes: bottom: 28
        right: 20, // ← antes: left: "50%"
        zIndex: 9999,
        animation: "toastIn 0.32s cubic-bezier(.22,1,.36,1) forwards",
        display: "flex",
        alignItems: "flex-end", // burbuja alineada al avatar
        gap: 10,
      }}>
      <style>{`
        @keyframes toastIn {
          from { transform: translateY(-20px) scale(0.95); opacity: 0 }
          to   { transform: translateY(0)      scale(1);    opacity: 1 }
        }
        @keyframes shrinkBar { from{width:100%} to{width:0%} }
      `}</style>

      {/* Burbuja */}
      <div
        style={{
          position: "relative",
          maxWidth: 320,
          padding: "13px 18px",
          borderRadius: "18px 18px 4px 18px", // ← pico abajo-derecha hacia el avatar
          border: `1px solid ${colors.border}`,
          backgroundColor: "var(--ui-surface, #fff)",
          overflow: "hidden",
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 4,
          }}>
          <span style={{ fontSize: 16, color: colors.text }}>
            {ICONS[toast.type]}
          </span>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--card-text)",
            }}>
            {LABELS[toast.type]}: {toast.title ?? toast.msg}
          </p>
          <button
            onClick={onDismiss}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              color: "var(--card-muted)",
              lineHeight: 1,
              marginLeft: "auto",
              paddingLeft: 8,
            }}>
            ✕
          </button>
        </div>

        {toast.title && (
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "var(--card-muted)",
              paddingLeft: 26,
            }}>
            {toast.msg}
          </p>
        )}

        {/* Barra de progreso */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: 3,
            backgroundColor: colors.text,
            borderRadius: 2,
            animation: `shrinkBar ${duration}ms linear forwards`,
          }}
        />
      </div>

      {/* Avatar del agente */}
      <img
        src={resolveAvatar("qwd")}
        alt={`Perfil agente`}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = resolveAvatar("default");
        }}
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    </div>
  );
}

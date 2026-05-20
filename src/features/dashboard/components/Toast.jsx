import { useEffect, useRef } from "react";

const ICONS = { ok: "✓", error: "✗", info: "ℹ" };
const LABELS = { ok: "Listo", error: "Error", info: "Info" };

export default function Toast({ toast, onDismiss, duration = 3000 }) {
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
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        animation: "toastIn 0.32s cubic-bezier(.22,1,.36,1) forwards",
      }}>
      <style>{`
        @keyframes toastIn {
          from { transform: translateX(-50%) translateY(60px) scale(0.95); opacity:0 }
          to   { transform: translateX(-50%) translateY(0)    scale(1);    opacity:1 }
        }
        @keyframes shrinkBar { from{width:100%} to{width:0%} }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "13px 18px",
          borderRadius: 16,
          minWidth: 380,
          maxWidth: 580,
          border: `1px solid ${colors.border}`,
          backgroundColor: "var(--ui-surface, #fff)",
          overflow: "hidden",
          position: "relative",
        }}>
        <span style={{ fontSize: 18, color: colors.text }}>
          {ICONS[toast.type]}
        </span>

        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--card-text)",
            }}>
            {LABELS[toast.type]}: {toast.title ?? toast.msg}
          </p>
          {toast.title && (
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 12,
                color: "var(--card-muted)",
              }}>
              {toast.msg}
            </p>
          )}
        </div>

        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            color: "var(--card-muted)",
            lineHeight: 1,
          }}>
          ✕
        </button>

        {/* barra de progreso */}
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
    </div>
  );
}

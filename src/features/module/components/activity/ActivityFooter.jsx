/**
 * Reutiliza el estilo de acciones del footer.
 * Mantiene botones compactos para no robar altura al hero.
 */
function getFooterButtonClass(disabled) {
  return [
    "inline-flex h-9 min-w-[96px] items-center justify-center rounded-xl px-3 text-sm font-medium",
    "border border-white/15 bg-white/10 text-white transition",
    disabled ? "cursor-not-allowed opacity-40" : "hover:bg-white/15 active:scale-[0.98]",
  ].join(" ");
}

/**
 * Footer shell:
 * - Usa una altura controlada por el frame principal.
 * - Compacta el contenido para liberar mas espacio al hero.
 */
function FooterShell({ children }) {
  return (
    <footer
      className="border-t border-white/10 bg-black/20 backdrop-blur-sm"
      style={{
        minHeight: "var(--activity-footer-height, 64px)",
      }}
    >
      <div className="flex h-full min-h-[var(--activity-footer-height,64px)] items-center px-[var(--activity-shell-gutter)] text-white/80">
        {children}
      </div>
    </footer>
  );
}

export default function ModuleFooter({ model }) {
  if (model?.type === "cta") {
    return (
      <FooterShell>
        <div className="flex w-full items-center justify-center">
          <button
            disabled={!model.center.enabled}
            onClick={model.center.onClick}
            className={getFooterButtonClass(!model.center.enabled)}
          >
            {model.center.label}
          </button>
        </div>
      </FooterShell>
    );
  }

  if (model?.type === "status") {
    return (
      <FooterShell>
        <div className="flex w-full items-center justify-center">
          <span className="truncate text-center text-xs sm:text-sm">
            {model.centerText ?? "Quipu Yachay"}
          </span>
        </div>
      </FooterShell>
    );
  }

  if (model?.type === "locked") {
    return (
      <FooterShell>
        <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 text-sm">
          <button disabled className={getFooterButtonClass(true)}>
            {model.left.label}
          </button>

          <span className="truncate text-center text-xs sm:text-sm">{model.centerText}</span>

          <button disabled className={getFooterButtonClass(true)}>
            {model.right.label}
          </button>
        </div>
      </FooterShell>
    );
  }

  return (
    <FooterShell>
      <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 text-sm">
        <button
          disabled={!model.left.enabled}
          onClick={model.left.onClick}
          className={getFooterButtonClass(!model.left.enabled)}
        >
          {model.left.label}
        </button>

        <span className="truncate text-center text-xs sm:text-sm">
          {model.centerText ?? "Quipu Yachay"}
        </span>

        <button
          disabled={!model.right.enabled}
          onClick={model.right.onClick}
          className={getFooterButtonClass(!model.right.enabled)}
        >
          {model.right.label}
        </button>
      </div>
    </FooterShell>
  );
}

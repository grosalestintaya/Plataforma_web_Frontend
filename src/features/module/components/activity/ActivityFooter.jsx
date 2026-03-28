export default function ModuleFooter({ model, onUiClick }) {
  const wrapClick =
    (handler, enabled = true) =>
    () => {
      if (!enabled) return;
      onUiClick?.();
      handler?.();
    };

  if (model?.type === "cta") {
    return (
      <footer className="h-40 border-t border-black">
        <div className="h-full px-4 flex items-center justify-center text-white/80 text-sm">
          <button
            disabled={!model.center.enabled}
            onClick={wrapClick(model.center.onClick, model.center.enabled)}
            className="h-8 px-4 rounded bg-white/10 disabled:opacity-40">
            {model.center.label}
          </button>
        </div>
      </footer>
    );
  }

  if (model?.type === "locked") {
    return (
      <footer className="h-40 border-t border-black">
        <div className="h-full px-4 flex items-center justify-between text-white/80 text-sm">
          <button disabled className="h-8 px-3 rounded bg-white/10 opacity-40">
            {model.left.label}
          </button>

          <span>{model.centerText}</span>

          <button disabled className="h-8 px-3 rounded bg-white/10 opacity-40">
            {model.right.label}
          </button>
        </div>
      </footer>
    );
  }

  return (
    <footer className="h-40 border-t border-black">
      <div className="h-full px-4 flex items-center justify-between text-white/80 text-sm">
        <button
          disabled={!model.left.enabled}
          onClick={wrapClick(model.left.onClick, model.left.enabled)}
          className="h-8 px-3 rounded bg-white/10 disabled:opacity-40">
          {model.left.label}
        </button>

        <span>{model.centerText ?? "Quipu Yachay"}</span>

        <button
          disabled={!model.right.enabled}
          onClick={wrapClick(model.right.onClick, model.right.enabled)}
          className="h-8 px-3 rounded bg-white/10 disabled:opacity-40">
          {model.right.label}
        </button>
      </div>
    </footer>
  );
}

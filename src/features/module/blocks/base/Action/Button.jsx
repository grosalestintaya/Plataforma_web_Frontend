
const BUTTON_VARIANT_CLASS = {
  simple: "border-white/20 bg-white/10 text-white hover:bg-white/20",
  primary: "border-emerald-400/40 bg-emerald-500/20 text-emerald-50 hover:bg-emerald-500/30",
  secondary: "border-sky-400/35 bg-sky-500/15 text-sky-50 hover:bg-sky-500/25",
  ghost: "border-transparent bg-transparent text-white/90 hover:bg-white/10",
};

export default function Button({
  type = "button",
  variant = "simple",
  label,
  children,
  onClick,
  disabled = false,
  className = "",
}) {
  const content = children ?? label ?? "Continuar";
  const variantClass = BUTTON_VARIANT_CLASS[variant] ?? BUTTON_VARIANT_CLASS.simple;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-medium transition",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantClass,
        className,
      ].join(" ")}
    >
      {content}
    </button>
  );
}

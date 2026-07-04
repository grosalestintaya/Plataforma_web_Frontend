import { isValidElement } from "react";
import { cn } from "@/shared/libs/utils";

const BUTTON_VARIANT_CLASS = {
  simple:
    "border-white/20 bg-white/10 text-white hover:bg-white/20",
  primary:
    "border-emerald-400/40 bg-emerald-500/20 text-emerald-50 hover:bg-emerald-500/30",
  secondary:
    "border-sky-400/35 bg-sky-500/15 text-sky-50 hover:bg-sky-500/25",
  ghost:
    "border-transparent bg-transparent text-white/90 hover:bg-white/10",
};

const BUTTON_SIZE_CLASS = {
  sm: "min-h-9 px-3 py-2 text-xs",
  normal: "min-h-11 px-4 py-2.5 text-sm",
  lg: "min-h-12 px-5 py-3 text-base",
};

export default function Button({
  type = "button",
  variant = "simple",
  size = "normal",
  label,
  children,
  onClick,
  disabled = false,

  /**
   * fullWidth:
   * útil cuando el botón está dentro de grids responsivos.
   */
  fullWidth = false,

  className = "",
}) {
  const content = children ?? label ?? "Continuar";
  const variantClass =
    BUTTON_VARIANT_CLASS[variant] ?? BUTTON_VARIANT_CLASS.simple;
  const sizeClass = BUTTON_SIZE_CLASS[size] ?? BUTTON_SIZE_CLASS.normal;
  const hasComplexContent = isValidElement(content);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "box-border max-w-full cursor-pointer items-center justify-center overflow-hidden",
        "rounded-xl border font-medium transition duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-black/30",
        "hover:-translate-y-0.5 active:translate-y-0",
        "disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60",
        "touch-manipulation select-none",
        hasComplexContent ? "flex w-full min-w-0" : "inline-flex w-auto",
        fullWidth && "w-full min-w-0",
        sizeClass,
        variantClass,
        className,
      )}
    >
      {hasComplexContent ? (
        <div
          className={cn(
            "w-full min-w-0 max-w-full",
            "[&_p]:break-normal [&_p]:[overflow-wrap:normal]",
          )}
        >
          {content}
        </div>
      ) : (
        <span className="min-w-0 truncate text-center leading-tight">
          {content}
        </span>
      )}
    </button>
  );
}

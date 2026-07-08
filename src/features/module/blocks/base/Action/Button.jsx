import { isValidElement } from "react";
import { cn } from "@/shared/libs/utils";

const BUTTON_VARIANT_CLASS = {
  simple:
    "border-white/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] text-white shadow-[0_10px_24px_rgba(18,9,56,0.28),inset_0_1px_0_rgba(255,255,255,0.16)] hover:border-white/40 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0.10))]",
  primary:
    "border-[#ffe07d]/70 bg-[linear-gradient(180deg,#ffd768_0%,#ffc234_52%,#f2a714_100%)] text-[#4b2f00] shadow-[0_14px_28px_rgba(92,52,0,0.28),inset_0_1px_0_rgba(255,249,214,0.72)] hover:border-[#ffedac] hover:brightness-[1.05]",
  secondary:
    "border-cyan-300/55 bg-[linear-gradient(180deg,#4f7fff_0%,#3e6bf0_58%,#3155ca_100%)] text-white shadow-[0_14px_28px_rgba(27,53,135,0.30),inset_0_1px_0_rgba(203,233,255,0.34)] hover:border-cyan-200/75 hover:brightness-[1.06]",
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
        "rounded-xl border font-black transition duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-black/30",
        "hover:-translate-y-0.5 active:translate-y-[1px]",
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

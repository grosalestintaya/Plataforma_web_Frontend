import clsx from "clsx";

export default function MetricPanel({
  title,
  value,
  icon,

  // visual state
  delta = null,
  glow = false,
  pulse = false,

  // theme
  color = "var(--coin-panel-bg)",
  textColor = "var(--coin-panel-text)",

  // extra
  className = "",
  children,
}) {
  return (
    <aside
      className={clsx(
        `
        relative overflow-hidden rounded-2xl
        transition-all duration-300 ease-out

        border border-white/10
        backdrop-blur-md

        shadow-[0_8px_18px_rgba(0,0,0,0.12)]
        `,
        pulse && "scale-[1.02]",
        glow &&
          "shadow-[0_10px_24px_rgba(0,0,0,0.18),0_0_0_2px_rgba(255,255,255,0.08)]",
        className,
      )}
      style={{
        background: `
          linear-gradient(
            180deg,
            color-mix(in srgb, ${color} 88%, white 12%) 0%,
            color-mix(in srgb, ${color} 78%, black 22%) 100%
          )
        `,
        color: textColor,
      }}>
      {/* Ambient Glow */}
      <div
        className="
          pointer-events-none
          absolute inset-0 opacity-20
        "
        style={{
          background: `
            radial-gradient(circle at 20% 18%, rgba(255,255,255,0.24), transparent 34%),
            linear-gradient(
              135deg,
              transparent 0%,
              rgba(255,255,255,0.12) 48%,
              transparent 100%
            )
          `,
        }}
      />

      {/* Top Shine */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/20" />

      {/* Content */}
      <div className="relative flex items-center gap-3 px-4 py-3">
        {/* Icon */}
        <div
          className="
            relative flex h-[120px] w-[120px]
            shrink-0 items-center justify-center
            rounded-2xl
          ">
          <div className="absolute inset-[6px] rounded-xl bg-white/5" />

          <div className="relative z-10">{icon}</div>
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          {/* Title */}
          <p
            className="
              text-[30px]
              uppercase
              tracking-[0.18em]
              opacity-80
            ">
            {title}
          </p>

          {/* Value */}
          <div className="relative mt-1">
            <p
              className="
                text-4xl xl:text-7xl
                font-extrabold
                leading-none
                tabular-nums
              "
              style={{
                color: textColor,
                textShadow: "0 2px 10px rgba(0,0,0,0.20)",
              }}>
              {value}
            </p>

            {/* Delta */}
            {delta !== null && (
              <span
                className="
                  pointer-events-none
                  absolute -top-4 right-0
                  text-xs font-black
                  animate-[metricFloat_900ms_ease-out_forwards]
                "
                style={{
                  color: textColor,
                  textShadow: "0 2px 8px rgba(0,0,0,0.22)",
                }}>
                +{delta}
              </span>
            )}
          </div>

          {/* Optional extra content */}
          {children && <div className="mt-2">{children}</div>}
        </div>
      </div>
    </aside>
  );
}

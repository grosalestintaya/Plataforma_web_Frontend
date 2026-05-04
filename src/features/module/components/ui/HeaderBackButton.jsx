function hexToRgb(hex) {
  const h = String(hex || "#000")
    .replace("#", "")
    .trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.padEnd(6, "0");
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function withAlpha(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

const RING_SHADOW = [
  "0 0 0 1px #c9a227",
  "0 0 0 4px #7a5510",
  "0 0 0 5px #c9a227",
  `inset 0 1px 0 ${withAlpha("#fff8b4", 0.4)}`,
  `0 10px 28px ${withAlpha("#000", 0.4)}`,
].join(", ");

const RING_SHADOW_HOVER = [
  "0 0 0 1px #c9a227",
  "0 0 0 4px #7a5510",
  "0 0 0 6px #e8c840",
  `inset 0 1px 0 ${withAlpha("#fff8b4", 0.4)}`,
  `0 12px 32px ${withAlpha("#000", 0.5)}`,
].join(", ");

export default function HeaderBackButton({
  onClick,
  label = "Volver",
  className = "",
}) {
  return (
    <>
      <button
        onClick={onClick}
        type="button"
        title={label}
        aria-label={label}
        className={`group relative overflow-hidden cursor-pointer focus-visible:outline-none active:scale-[0.97] ${className}`}
        style={{
          height: 52,
          paddingInline: "14px 20px",
          borderRadius: 14,
          border: "1.5px solid #a07820",
          background: "linear-gradient(160deg, #f5e9c8, #e2c96a 60%, #c9a227)",
          boxShadow: RING_SHADOW,
          display: "flex",
          alignItems: "center",
          gap: 12,
          transition: "transform 220ms ease, box-shadow 220ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = RING_SHADOW_HOVER;
          e.currentTarget.style.transform = "scale(1.02) translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = RING_SHADOW;
          e.currentTarget.style.transform = "scale(1)";
        }}>
        {/* Inner frame line */}
        <span
          style={{
            position: "absolute",
            inset: 3,
            border: "0.5px solid rgba(200,160,40,0.35)",
            borderRadius: 10,
            pointerEvents: "none",
          }}
        />

        {/* Top glare */}
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "40%",
            background:
              "linear-gradient(180deg, rgba(255,248,180,0.28), transparent)",
            borderRadius: "14px 14px 0 0",
            pointerEvents: "none",
          }}
        />

        {/* Badge circular con flecha */}
        <span
          className="group-hover:[transform:scale(1.08)_translateX(-2px)]"
          style={{
            position: "relative",
            flexShrink: 0,
            width: 34,
            height: 34,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 30%, #ffe566, #c9a227 55%, #7a5510)",
            border: "2px solid #7a5510",
            boxShadow:
              "0 0 0 1px #e8c840, inset 0 2px 4px rgba(255,240,100,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 220ms ease",
          }}>
          {/* Flecha ← construida con spans, igual al original */}
          <span
            style={{
              position: "relative",
              display: "block",
              width: 14,
              height: 14,
            }}>
            <span
              style={{
                position: "absolute",
                left: 3,
                top: "50%",
                height: 2.2,
                width: 9,
                transform: "translateY(-50%)",
                borderRadius: 9999,
                background: "#3b2200",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                width: 7,
                height: 7,
                transform: "translateY(-50%) rotate(45deg)",
                borderRadius: 1,
                borderBottom: "2.2px solid #3b2200",
                borderLeft: "2.2px solid #3b2200",
              }}
            />
          </span>
        </span>

        {/* Label */}
        <span
          style={{
            position: "relative",
            zIndex: 10,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.15em",
            color: "#1e0e00",
            textShadow:
              "0 2px 0 rgba(200,160,40,0.3), 0 1px 0 rgba(255,240,100,0.5)",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}>
          {label}
        </span>
      </button>
    </>
  );
}

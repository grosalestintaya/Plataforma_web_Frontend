import { cn } from "@/shared/libs/utils";

/**
 * Typography:
 * - Sistema tipográfico centralizado.
 * - No recibe className ni containerClassName desde componentes padres.
 * - Usa principalmente la configuración declarada en el JSON.
 * - Normaliza variantes legacy como body1/body2/subtitle1/etc.
 */

export const TYPOGRAPHY = {
  scale: {
    eyebrow:
      "text-[clamp(0.7rem,0.62rem+0.35cqw,0.95rem)] font-semibold uppercase tracking-[0.12em] leading-[1.3]",

    h1:
      "text-[clamp(1.8rem,1.05rem+3.2cqw,4.2rem)] font-extrabold leading-[1.12]",

    h2:
      "text-[clamp(1.45rem,0.95rem+2.6cqw,3.2rem)] font-extrabold leading-[1.14]",

    h3:
      "text-[clamp(1.15rem,0.9rem+1.6cqw,2.1rem)] font-bold leading-[1.18]",

    body:
      "text-[clamp(0.95rem,0.78rem+0.9cqw,1.45rem)] font-medium leading-[1.42]",

    bodySm:
      "text-[clamp(0.82rem,0.72rem+0.55cqw,1.05rem)] font-medium leading-[1.45]",

    label:
      "text-[clamp(0.86rem,0.74rem+0.6cqw,1.15rem)] font-bold leading-[1.28]",

    helper:
      "text-[clamp(0.76rem,0.68rem+0.42cqw,0.98rem)] font-medium leading-[1.38]",

    caption:
      "text-[clamp(0.66rem,0.6rem+0.3cqw,0.84rem)] font-medium leading-[1.35]",

    cardTitle:
      "text-[clamp(0.9rem,0.75rem+0.95cqw,1.35rem)] font-extrabold leading-[1.15]",

    cardText:
      "text-[clamp(0.72rem,0.64rem+0.55cqw,0.95rem)] font-semibold leading-[1.28]",

    cardBackTitle:
      "text-[clamp(1rem,0.82rem+1cqw,1.45rem)] font-extrabold leading-[1.16]",

    cardBackText:
      "text-[clamp(0.8rem,0.68rem+0.7cqw,1.05rem)] font-medium leading-[1.34]",
  },

  tone: {
    primary: "text-white",
    secondary: "text-white/85",
    muted: "text-white/70",
    soft: "text-white/55",
    accent: "text-emerald-300",
    success: "text-emerald-300",
    danger: "text-rose-300",
    warning: "text-amber-300",
  },

  width: {
    narrow: "max-w-2xl",
    reading: "max-w-3xl",
    wide: "max-w-5xl",
    full: "max-w-none",
  },

  align: {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify",
  },

  clamp: {
    none: "",
    1: "line-clamp-1",
    2: "line-clamp-2",
    3: "line-clamp-3",
    4: "line-clamp-4",
    5: "line-clamp-5",
  },
};

function normalizeVariant(variant) {
  const map = {
    h4: "h3",
    h5: "h3",
    h6: "h3",

    subtitle1: "body",
    subtitle2: "bodySm",

    body1: "body",
    body2: "bodySm",

    button: "label",
    overline: "eyebrow",
  };

  const resolved = map[variant] ?? variant ?? "body";

  return TYPOGRAPHY.scale[resolved] ? resolved : "body";
}

function normalizeTone(tone) {
  const map = {
    color: "secondary",
    textPrimary: "primary",
    textSecondary: "secondary",
    error: "danger",
  };

  const resolved = map[tone] ?? tone ?? "secondary";

  return TYPOGRAPHY.tone[resolved] ? resolved : "secondary";
}

function normalizeAlign(align) {
  return TYPOGRAPHY.align[align] ? align : "left";
}

function normalizeWidth(width) {
  return TYPOGRAPHY.width[width] ? width : "full";
}

function normalizeClamp(clamp) {
  if (clamp === undefined || clamp === null) return "none";
  return TYPOGRAPHY.clamp[clamp] !== undefined ? clamp : "none";
}

function resolveDefaultTag(variant) {
  if (variant === "h1") return "h1";
  if (variant === "h2") return "h2";
  if (variant === "h3") return "h3";
  return "p";
}

function extractText(content, children) {
  if (children !== undefined && children !== null) return children;

  if (typeof content === "string" || typeof content === "number") {
    return content;
  }

  if (Array.isArray(content?.paragraphs)) {
    return content.paragraphs;
  }

  return content?.text ?? "";
}

function resolveOptions({
  content,
  variant,
  tone,
  color,
  align,
  width,
  clamp,
  as,
}) {
  /**
   * Prioridad:
   * 1. JSON/content
   * 2. Props directas
   * 3. Fallback global
   */
  const resolvedVariant = normalizeVariant(content?.variant ?? variant);
  const resolvedTone = normalizeTone(
    content?.tone ?? content?.color ?? tone ?? color,
  );
  const resolvedAlign = normalizeAlign(content?.align ?? align);
  const resolvedWidth = normalizeWidth(content?.width ?? width);
  const resolvedClamp = normalizeClamp(content?.clamp ?? clamp);
  const resolvedAs =
    content?.component ?? content?.as ?? as ?? resolveDefaultTag(resolvedVariant);

  return {
    variant: resolvedVariant,
    tone: resolvedTone,
    align: resolvedAlign,
    width: resolvedWidth,
    clamp: resolvedClamp,
    as: resolvedAs,
  };
}

function getTextClassName({ variant, tone, align, clamp }) {
  return cn(
    TYPOGRAPHY.scale[variant] ?? TYPOGRAPHY.scale.body,
    TYPOGRAPHY.tone[tone] ?? TYPOGRAPHY.tone.secondary,
    TYPOGRAPHY.align[align] ?? TYPOGRAPHY.align.left,
    TYPOGRAPHY.clamp[clamp] ?? "",

    /**
     * Base segura.
     */
    "block w-full min-w-0 max-w-full",

    /**
     * Evita cortes verticales en signos, tildes y letras altas.
     */
    "py-[0.08em]",

    /**
     * Permite cortes de línea naturales.
     */
    "whitespace-normal break-words [overflow-wrap:anywhere]",
  );
}

function getOuterWrapperClassName() {
  return cn(
    /**
     * Siempre ocupa todo el ancho del slot.
     */
    "block w-full min-w-0 max-w-full shrink-0",

    /**
     * Necesario para que cqw mida según el ancho real disponible.
     */
    "[container-type:inline-size]",
  );
}

function getInnerWrapperClassName(width, align) {
  return cn(
    "block w-full min-w-0",
    TYPOGRAPHY.width[width] ?? TYPOGRAPHY.width.full,

    /**
     * Si el bloque tiene max-width, se alinea según el JSON.
     */
    align === "center" && "mx-auto",
    align === "left" && "mr-auto",
    align === "right" && "ml-auto",
  );
}

export default function Typography({
  content,
  children,
  variant,
  tone,
  color,
  align,
  width,
  clamp,
  as,
}) {
  const text = extractText(content, children);

  const options = resolveOptions({
    content,
    variant,
    tone,
    color,
    align,
    width,
    clamp,
    as,
  });

  if (text === undefined || text === null || text === "") return null;

  if (Array.isArray(text)) {
    const parts = text.map((item) => String(item).trim()).filter(Boolean);

    if (parts.length === 0) return null;

    return (
      <div className={getOuterWrapperClassName()}>
        <div
          className={cn(
            getInnerWrapperClassName(options.width, options.align),
            "flex flex-col gap-4",
          )}
        >
          {parts.map((part, index) => (
            <p key={`${part}-${index}`} className={getTextClassName(options)}>
              {part}
            </p>
          ))}
        </div>
      </div>
    );
  }

  const Tag = options.as;

  return (
    <div className={getOuterWrapperClassName()}>
      <div className={getInnerWrapperClassName(options.width, options.align)}>
        <Tag className={getTextClassName(options)}>{text}</Tag>
      </div>
    </div>
  );
}
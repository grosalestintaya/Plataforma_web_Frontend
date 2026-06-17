import { cn } from "@/shared/libs/utils";

/**
 * Typography:
 * - Sistema tipográfico centralizado.
 * - Acepta ajustes finos declarativos desde content cuando el contrato lo permite.
 * - Usa principalmente la configuración declarada en el JSON.
 * - Normaliza variantes legacy como body1/body2/subtitle1/etc.
 */

export const TYPOGRAPHY = {
  scale: {
    eyebrow:
      "text-[clamp(0.76rem,0.68rem+min(0.44cqw,0.76vmin),1.06rem)] font-semibold uppercase tracking-[0.12em] leading-[1.28]",

    h1:
      "text-[clamp(1.72rem,1rem+min(3.1cqw,5.5vmin),4.24rem)] font-extrabold leading-[1.08]",

    h2:
      "text-[clamp(1.36rem,0.88rem+min(2.3cqw,4vmin),3.2rem)] font-extrabold leading-[1.1]",

    h3:
      "text-[clamp(1.12rem,0.82rem+min(1.6cqw,2.6vmin),2.2rem)] font-bold leading-[1.14]",

    body:
      "text-[clamp(0.92rem,0.78rem+min(0.98cqw,1.5vmin),1.42rem)] font-medium leading-[1.38]",

    bodySm:
      "text-[clamp(0.84rem,0.72rem+min(0.76cqw,1.16vmin),1.18rem)] font-medium leading-[1.42]",

    label:
      "text-[clamp(0.88rem,0.76rem+min(0.72cqw,1.04vmin),1.18rem)] font-bold leading-[1.28]",

    helper:
      "text-[clamp(0.8rem,0.7rem+min(0.64cqw,0.94vmin),1.08rem)] font-medium leading-[1.36]",

    caption:
      "text-[clamp(0.72rem,0.64rem+min(0.38cqw,0.62vmin),0.92rem)] font-medium leading-[1.3]",

    cardTitle:
      "text-[clamp(0.96rem,0.8rem+min(1.08cqw,1.5vmin),1.52rem)] font-extrabold leading-[1.14]",

    cardText:
      "text-[clamp(0.78rem,0.68rem+min(0.64cqw,0.94vmin),1.08rem)] font-semibold leading-[1.28]",

    cardBackTitle:
      "text-[clamp(1.04rem,0.84rem+min(1.18cqw,1.62vmin),1.62rem)] font-extrabold leading-[1.14]",

    cardBackText:
      "text-[clamp(0.84rem,0.72rem+min(0.76cqw,1.06vmin),1.14rem)] font-medium leading-[1.34]",
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
    "min-h-0 max-h-full",
  );
}

function getInnerWrapperClassName(width, align) {
  return cn(
    "block w-full min-w-0 min-h-0 max-h-full",
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
  className = "",
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
            "flex min-h-0 flex-col gap-2.5 sm:gap-3",
          )}
        >
          {parts.map((part, index) => (
            <p
              key={`${part}-${index}`}
              className={cn(getTextClassName(options), className)}
            >
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
        <Tag className={cn(getTextClassName(options), className)}>{text}</Tag>
      </div>
    </div>
  );
}

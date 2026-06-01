import { useEffect, useRef, useState } from "react";
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
      "[font-size:calc(clamp(0.68rem,0.6rem+min(0.4cqw,0.7vmin),0.98rem)*var(--qy-type-scale,1))] font-semibold uppercase tracking-[0.12em] leading-[1.28]",

    h1:
      "[font-size:calc(clamp(1.55rem,0.9rem+min(2.9cqw,5.2vmin),4rem)*var(--qy-type-scale,1))] font-extrabold leading-[1.08]",

    h2:
      "[font-size:calc(clamp(1.22rem,0.82rem+min(2.15cqw,3.8vmin),3rem)*var(--qy-type-scale,1))] font-extrabold leading-[1.1]",

    h3:
      "[font-size:calc(clamp(1rem,0.76rem+min(1.45cqw,2.4vmin),2.05rem)*var(--qy-type-scale,1))] font-bold leading-[1.14]",

    body:
      "[font-size:calc(clamp(0.82rem,0.7rem+min(0.85cqw,1.35vmin),1.28rem)*var(--qy-type-scale,1))] font-medium leading-[1.34]",

    bodySm:
      "[font-size:calc(clamp(0.74rem,0.64rem+min(0.62cqw,1.02vmin),1.08rem)*var(--qy-type-scale,1))] font-medium leading-[1.38]",

    label:
      "[font-size:calc(clamp(0.78rem,0.68rem+min(0.6cqw,0.92vmin),1.08rem)*var(--qy-type-scale,1))] font-bold leading-[1.24]",

    helper:
      "[font-size:calc(clamp(0.7rem,0.62rem+min(0.5cqw,0.82vmin),0.98rem)*var(--qy-type-scale,1))] font-medium leading-[1.32]",

    caption:
      "[font-size:calc(clamp(0.62rem,0.56rem+min(0.3cqw,0.56vmin),0.84rem)*var(--qy-type-scale,1))] font-medium leading-[1.28]",

    cardTitle:
      "[font-size:calc(clamp(0.84rem,0.72rem+min(0.95cqw,1.35vmin),1.38rem)*var(--qy-type-scale,1))] font-extrabold leading-[1.12]",

    cardText:
      "[font-size:calc(clamp(0.68rem,0.6rem+min(0.5cqw,0.8vmin),0.98rem)*var(--qy-type-scale,1))] font-semibold leading-[1.22]",

    cardBackTitle:
      "[font-size:calc(clamp(0.94rem,0.76rem+min(1.05cqw,1.5vmin),1.48rem)*var(--qy-type-scale,1))] font-extrabold leading-[1.12]",

    cardBackText:
      "[font-size:calc(clamp(0.74rem,0.64rem+min(0.62cqw,0.94vmin),1.06rem)*var(--qy-type-scale,1))] font-medium leading-[1.28]",
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

const ADAPTIVE_SCALE_CONFIG = {
  body: {
    min: 0.92,
    max: 1.18,
    baseWidth: 920,
    baseHeight: 210,
    extraLineHeight: 34,
  },
  bodySm: {
    min: 0.92,
    max: 1.16,
    baseWidth: 860,
    baseHeight: 190,
    extraLineHeight: 30,
  },
  label: {
    min: 0.94,
    max: 1.1,
    baseWidth: 720,
    baseHeight: 92,
    extraLineHeight: 18,
  },
  helper: {
    min: 0.92,
    max: 1.12,
    baseWidth: 760,
    baseHeight: 96,
    extraLineHeight: 18,
  },
  caption: {
    min: 0.94,
    max: 1.08,
    baseWidth: 680,
    baseHeight: 70,
    extraLineHeight: 14,
  },
  cardText: {
    min: 0.92,
    max: 1.12,
    baseWidth: 340,
    baseHeight: 120,
    extraLineHeight: 18,
  },
  cardBackText: {
    min: 0.92,
    max: 1.14,
    baseWidth: 420,
    baseHeight: 150,
    extraLineHeight: 22,
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

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
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
    className: content?.className ?? "",
    containerClassName: content?.containerClassName ?? "",
  };
}

function getTextClassName({ variant, tone, align, clamp, className }) {
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
    className,
  );
}

function getOuterWrapperClassName(containerClassName) {
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
    containerClassName,
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
}) {
  const text = extractText(content, children);
  const outerRef = useRef(null);
  const [adaptiveScale, setAdaptiveScale] = useState(1);

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
  const paragraphCount = Array.isArray(text) ? text.length : 1;

  useEffect(() => {
    const config = ADAPTIVE_SCALE_CONFIG[options.variant];

    if (!config) {
      setAdaptiveScale(1);
      return undefined;
    }

    const slotElement = outerRef.current?.parentElement;

    if (!slotElement || typeof ResizeObserver === "undefined") {
      setAdaptiveScale(1);
      return undefined;
    }

    function updateScale() {
      const { width, height } = slotElement.getBoundingClientRect();

      if (!width || !height) {
        setAdaptiveScale(1);
        return;
      }

      const widthFactor = width / config.baseWidth;
      const targetHeight =
        config.baseHeight +
        Math.max(0, paragraphCount - 1) * config.extraLineHeight;
      const heightFactor = height / targetHeight;

      const nextScale = clampNumber(
        Number(Math.min(widthFactor, heightFactor).toFixed(3)),
        config.min,
        config.max,
      );

      setAdaptiveScale((previous) =>
        Math.abs(previous - nextScale) < 0.01 ? previous : nextScale,
      );
    }

    updateScale();

    const observer = new ResizeObserver(() => {
      updateScale();
    });

    observer.observe(slotElement);

    return () => {
      observer.disconnect();
    };
  }, [options.variant, paragraphCount]);

  if (Array.isArray(text)) {
    const parts = text.map((item) => String(item).trim()).filter(Boolean);

    if (parts.length === 0) return null;

    return (
      <div
        ref={outerRef}
        className={getOuterWrapperClassName(options.containerClassName)}
        style={{ "--qy-type-scale": adaptiveScale }}
      >
        <div
          className={cn(
            getInnerWrapperClassName(options.width, options.align),
            "flex min-h-0 flex-col gap-2.5 sm:gap-3",
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
    <div
      ref={outerRef}
      className={getOuterWrapperClassName(options.containerClassName)}
      style={{ "--qy-type-scale": adaptiveScale }}
    >
      <div className={getInnerWrapperClassName(options.width, options.align)}>
        <Tag className={getTextClassName(options)}>{text}</Tag>
      </div>
    </div>
  );
}

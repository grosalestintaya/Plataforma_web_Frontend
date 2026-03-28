/**
 * Token map for typography.
 * Keeps scale, color tone, width and alignment in one place.
 */
export const TYPOGRAPHY = {
  scale: {
    eyebrow: "text-xs md:text-sm font-semibold uppercase tracking-[0.12em] leading-5",
    h1: "text-3xl md:text-5xl font-extrabold leading-tight",
    h2: "text-2xl md:text-3xl font-bold leading-snug",
    h3: "text-xl md:text-2xl font-semibold leading-snug",

    body: "text-base md:text-lg font-normal leading-7",
    bodySm: "text-sm md:text-base font-normal leading-6",
    caption: "text-xs md:text-sm font-normal leading-5",
    label: "text-sm font-medium leading-5",
    helper: "text-xs md:text-sm font-normal leading-5",
  },
  tone: {
    primary: "text-white",
    secondary: "text-white/85",
    muted: "text-white/70",
    soft: "text-white/55",
    accent: "text-emerald-300",
    success: "text-emerald-300",
    danger: "text-rose-300",
  },
  width: {
    narrow: "max-w-2xl",
    reading: "max-w-3xl",
    wide: "max-w-4xl",
    full: "max-w-none",
  },
  align: {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  },
};

/**
 * Builds final className from typography tokens.
 */
export function getTypographyClassName({
  variant = "body",
  tone = "secondary",
  width = "reading",
  align = "left",
  className = "",
} = {}) {
  return [
    TYPOGRAPHY.scale[variant] || TYPOGRAPHY.scale.body,
    TYPOGRAPHY.tone[tone] || TYPOGRAPHY.tone.secondary,
    TYPOGRAPHY.width[width] || TYPOGRAPHY.width.reading,
    TYPOGRAPHY.align[align] || TYPOGRAPHY.align.left,
    className,
  ].join(" ");
}

function renderTextTag({
  as = "p",
  variant = "body",
  tone = "secondary",
  width = "reading",
  align = "left",
  className = "",
  children,
}) {
  const Tag = as;
  return (
    <Tag
      className={getTypographyClassName({
        variant,
        tone,
        width,
        align,
        className,
      })}
    >
      {children}
    </Tag>
  );
}

/**
 * Heading primitive based on the token scale.
 */
export function Heading({
  as,
  variant = "h1",
  tone = "primary",
  width = "reading",
  align = "left",
  className = "",
  children,
}) {
  const defaultTag =
    variant === "eyebrow"
      ? "p"
      : variant === "h1"
        ? "h1"
        : variant === "h2"
          ? "h2"
          : "h3";

  return renderTextTag({
    as: as || defaultTag,
    variant,
    tone,
    width,
    align,
    className,
    children,
  });
}

/**
 * Text primitive for body/caption/label/helper variants.
 */
export function Text({
  as = "p",
  variant = "body",
  tone = "secondary",
  width = "reading",
  align = "left",
  className = "",
  children,
}) {
  return renderTextTag({
    as,
    variant,
    tone,
    width,
    align,
    className,
    children,
  });
}

/**
 * Splits text by empty lines and renders semantic paragraphs.
 */
export function TextParagraphs({
  text = "",
  variant = "body",
  tone = "secondary",
  width = "reading",
  align = "left",
  className = "",
}) {
  const parts = String(text)
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {parts.map((part, index) => (
        <p
          key={`${part}-${index}`}
          className={getTypographyClassName({
            variant,
            tone,
            width,
            align,
            className,
          })}
        >
          {part}
        </p>
      ))}
    </div>
  );
}

/**
 * Maps legacy variant names to the current token scale.
 */
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

  return map[variant] ?? variant ?? "body";
}

/**
 * Maps legacy color names to current tone tokens.
 */
function normalizeTone(color) {
  const map = {
    textPrimary: "primary",
    textSecondary: "secondary",
    error: "danger",
  };

  return map[color] ?? color ?? "secondary";
}

function extractText(content, children) {
  if (children !== undefined && children !== null) return children;
  if (typeof content === "string" || typeof content === "number") return content;
  if (Array.isArray(content?.paragraphs)) return content.paragraphs.join("\n\n");
  return content?.text ?? "";
}

/**
 * Main typography block used by templates and compounds.
 */
export default function Typography({
  content,
  children,
  variant = "body",
  color = "secondary",
  align = "left",
  component,
  className = "",
  containerClassName = "",
}) {
  const resolvedVariant = normalizeVariant(content?.variant ?? variant);
  const resolvedTone = normalizeTone(content?.color ?? color);
  const resolvedAlign = content?.align ?? align;
  const text = extractText(content, children);
  const Tag = component ?? content?.component ?? "p";

  if (Array.isArray(content?.paragraphs)) {
    return (
      <div className={containerClassName}>
        <TextParagraphs
          text={content.paragraphs.join("\n\n")}
          variant={resolvedVariant}
          tone={resolvedTone}
          align={resolvedAlign}
          width="full"
          className={className}
        />
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <Tag
        className={getTypographyClassName({
          variant: resolvedVariant,
          tone: resolvedTone,
          align: resolvedAlign,
          width: "full",
          className,
        })}
      >
        {text}
      </Tag>
    </div>
  );
}

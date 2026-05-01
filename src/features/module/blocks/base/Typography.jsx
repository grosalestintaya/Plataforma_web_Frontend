/**
 * Token map for typography.
 * Keeps scale, color tone, width and alignment in one place.
 */
export const TYPOGRAPHY = {
  scale: {
    eyebrow:
      "text-sm md:text-base font-semibold uppercase tracking-[0.12em] leading-5",
    h1: "text-4xl md:text-7xl font-extrabold leading-tight",
    h2: "text-3xl md:text-5xl font-extrabold leading-tight",
    h3: "text-2xl md:text-4xl font-bold leading-snug",

    body: "text-lg md:text-3xl font-medium leading-8",
    bodySm: "text-base md:text-lg font-medium leading-7",
    label: "text-base md:text-lg font-bold leading-6",
    helper: "text-sm md:text-base font-medium leading-6",
    caption: "text-xs md:text-sm font-medium leading-5",
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
    justify: "text-justify",
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
    // La tipografia no debe romper el ancho del slot donde se renderiza.
    "max-w-full break-words [overflow-wrap:anywhere]",
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
      })}>
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
  const resolvedVariant = normalizeVariant(variant);
  const defaultTag =
    resolvedVariant === "eyebrow"
      ? "p"
      : /^h[1-6]$/.test(resolvedVariant)
        ? resolvedVariant
        : "h3";

  return renderTextTag({
    as: as || defaultTag,
    variant: resolvedVariant,
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
  const resolvedVariant = normalizeVariant(variant);

  return renderTextTag({
    as,
    variant: resolvedVariant,
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
    <div className="flex max-w-full flex-col gap-4">
      {parts.map((part, index) => (
        <p
          key={`${part}-${index}`}
          className={getTypographyClassName({
            variant,
            tone,
            width,
            align,
            className,
          })}>
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

  const resolvedVariant = map[variant] ?? variant ?? "body";
  return TYPOGRAPHY.scale[resolvedVariant] ? resolvedVariant : "body";
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
  if (typeof content === "string" || typeof content === "number")
    return content;
  if (Array.isArray(content?.paragraphs))
    return content.paragraphs.join("\n\n");
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
  containerClassName = "font-bold",
}) {
  const resolvedVariant = normalizeVariant(content?.variant ?? variant);
  const resolvedTone = normalizeTone(content?.color ?? color);
  const resolvedAlign = content?.align ?? align;
  const text = extractText(content, children);
  const Tag = component ?? content?.component ?? "p";

  if (Array.isArray(content?.paragraphs)) {
    return (
      <TextParagraphs
        text={content.paragraphs.join("\n\n")}
        variant={resolvedVariant}
        tone={resolvedTone}
        align={resolvedAlign}
        width="full"
        className={className}
      />
    );
  }

  return (
    <Tag
      className={getTypographyClassName({
        variant: resolvedVariant,
        tone: resolvedTone,
        align: resolvedAlign,
        width: "full",
        className,
      })}>
      {text}
    </Tag>
  );
}

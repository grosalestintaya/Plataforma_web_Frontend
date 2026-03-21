import { cn } from "@/shared/libs/utils";

const TAG_BY_VARIANT = {
  display: "h1",
  hero: "h2",
  title: "h2",
  section: "h3",
  cardTitle: "h4",
  lead: "p",
  body: "p",
  supporting: "p",
  label: "span",
  caption: "span",
  eyebrow: "span",
  badge: "span",
};

const CLASSNAME_BY_VARIANT = {
  display:
    "text-center text-white font-black tracking-tight text-4xl md:text-6xl leading-none",
  hero:
    "text-center text-white font-extrabold tracking-tight text-2xl md:text-4xl leading-tight",
  title:
    "text-center text-white font-extrabold tracking-tight text-xl md:text-2xl leading-tight",
  section:
    "text-center text-white font-bold tracking-tight text-lg md:text-xl leading-snug",
  cardTitle:
    "text-center text-white font-bold tracking-tight text-base md:text-lg leading-snug",
  lead:
    "text-center text-white/90 font-semibold text-base md:text-lg leading-relaxed",
  body:
    "text-center text-white/95 font-semibold text-sm md:text-base leading-relaxed whitespace-pre-line py-4",
  supporting:
    "text-center text-white/75 font-medium text-sm md:text-base leading-relaxed whitespace-pre-line",
  label:
    "text-center text-white/90 font-semibold text-xs md:text-sm leading-snug",
  caption:
    "text-center text-white/70 font-medium text-xs md:text-sm leading-relaxed whitespace-pre-line",
  eyebrow:
    "text-center text-white/60 font-semibold uppercase tracking-[0.18em] text-[11px] md:text-xs",
  badge:
    "inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white",
};

const CLASSNAME_BY_TONE = {
  primary: "text-white",
  secondary: "text-white/88",
  muted: "text-white/65",
  accent: "text-amber-300",
  success: "text-emerald-300",
};

const CLASSNAME_BY_ALIGN = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function isTypographyObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function resolveContent(children, content) {
  if (content !== undefined) return content;
  return children;
}

function getTextParts(resolvedContent) {
  if (typeof resolvedContent === "string" || typeof resolvedContent === "number") {
    return { text: String(resolvedContent), paragraphs: null };
  }

  if (Array.isArray(resolvedContent)) {
    const paragraphs = resolvedContent
      .map((item) => (typeof item === "string" ? item : item?.text))
      .filter(Boolean);
    return { text: paragraphs.join("\n\n"), paragraphs };
  }

  if (isTypographyObject(resolvedContent)) {
    const paragraphs = Array.isArray(resolvedContent.paragraphs)
      ? resolvedContent.paragraphs
          .map((item) => (typeof item === "string" ? item : item?.text))
          .filter(Boolean)
      : null;

    const text =
      typeof resolvedContent.text === "string"
        ? resolvedContent.text
        : paragraphs?.join("\n\n") ?? "";

    return { text, paragraphs };
  }

  return { text: "", paragraphs: null };
}

export default function Typografia({
  as,
  variant,
  tone,
  align,
  content,
  children,
  className = "",
  containerClassName = "",
}) {
  const resolvedContent = resolveContent(children, content);
  const contentVariant = isTypographyObject(resolvedContent)
    ? resolvedContent.variant
    : undefined;
  const contentTone = isTypographyObject(resolvedContent)
    ? resolvedContent.tone
    : undefined;
  const contentAlign = isTypographyObject(resolvedContent)
    ? resolvedContent.align
    : undefined;
  const contentAs = isTypographyObject(resolvedContent) ? resolvedContent.as : undefined;
  const contentClassName = isTypographyObject(resolvedContent)
    ? resolvedContent.className
    : "";
  const contentContainerClassName = isTypographyObject(resolvedContent)
    ? resolvedContent.containerClassName
    : "";

  const finalVariant = variant ?? contentVariant ?? "body";
  const finalTone = tone ?? contentTone;
  const finalAlign = align ?? contentAlign ?? "center";
  const Component = as ?? contentAs ?? TAG_BY_VARIANT[finalVariant] ?? "p";
  const { text } = getTextParts(resolvedContent);

  return (
    <div className={cn(contentContainerClassName, containerClassName)}>
      <Component
        className={cn(
          CLASSNAME_BY_VARIANT[finalVariant] ?? CLASSNAME_BY_VARIANT.body,
          CLASSNAME_BY_TONE[finalTone],
          CLASSNAME_BY_ALIGN[finalAlign],
          contentClassName,
          className,
        )}
      >
        {text}
      </Component>
    </div>
  );
}

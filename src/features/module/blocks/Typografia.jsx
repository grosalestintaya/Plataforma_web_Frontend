import { cn } from "@/shared/libs/utils";

// Cada variant define la jerarquia visual principal del texto.
const CLASSNAME_BY_VARIANT = {
  h1: "text-white text-4xl font-black leading-none tracking-tight md:text-6xl",
  h2: "text-white text-3xl font-extrabold leading-tight tracking-tight md:text-5xl",
  h3: "text-white text-2xl font-extrabold leading-tight tracking-tight md:text-4xl",
  h4: "text-white text-xl font-bold leading-tight tracking-tight md:text-3xl",
  h5: "text-white text-lg font-bold leading-snug md:text-2xl",
  h6: "text-white text-base font-bold leading-snug md:text-xl",
  subtitle1: "text-white/90 text-base font-semibold leading-relaxed md:text-lg",
  subtitle2: "text-white/85 text-sm font-semibold leading-relaxed md:text-base",
  body1: "text-white/95 text-sm font-medium leading-relaxed md:text-base",
  body2: "text-white/80 text-sm font-medium leading-relaxed",
  button:
    "inline-flex items-center justify-center text-xs font-semibold uppercase tracking-[0.08em] md:text-sm",
  caption: "text-white/70 text-xs font-medium leading-relaxed md:text-sm",
  overline:
    "text-white/60 text-[11px] font-semibold uppercase tracking-[0.18em] md:text-xs",
};

// Cada variant tiene un elemento HTML por defecto.
const COMPONENT_BY_VARIANT = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  subtitle1: "p",
  subtitle2: "p",
  body1: "p",
  body2: "p",
  button: "span",
  caption: "span",
  overline: "span",
};

// `color` solo ajusta el tono final del texto.
const CLASSNAME_BY_COLOR = {
  inherit: "",
  initial: "",
  primary: "text-white",
  secondary: "text-white/85",
  textPrimary: "text-white",
  textSecondary: "text-white/70",
  muted: "text-white/65",
  accent: "text-amber-300",
  success: "text-emerald-300",
  error: "text-rose-300",
};

const CLASSNAME_BY_ALIGN = {
  inherit: "",
  left: "text-left",
  center: "text-center",
  right: "text-right",
  justify: "text-justify",
};

function isTypographyObject(value) {
  // Detecta si el contenido trae metadata tipografica.
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function resolveContent(children, content) {
  // `content` tiene prioridad para mantener una API declarativa.
  return content !== undefined ? content : children;
}

function getTextContent(resolvedContent) {
  // Soporta strings, arrays de parrafos y objetos de contenido.
  if (typeof resolvedContent === "string" || typeof resolvedContent === "number") {
    return String(resolvedContent);
  }

  if (Array.isArray(resolvedContent)) {
    return resolvedContent
      .map((item) => (typeof item === "string" ? item : item?.text))
      .filter(Boolean)
      .join("\n\n");
  }

  if (isTypographyObject(resolvedContent)) {
    if (typeof resolvedContent.text === "string" || typeof resolvedContent.text === "number") {
      return String(resolvedContent.text);
    }

    if (Array.isArray(resolvedContent.paragraphs)) {
      return resolvedContent.paragraphs
        .map((item) => (typeof item === "string" ? item : item?.text))
        .filter(Boolean)
        .join("\n\n");
    }
  }

  return "";
}

export default function Typografia({
  variant,
  component,
  align,
  color,
  gutterBottom = false,
  noWrap = false,
  paragraph = false,
  content,
  children,
  className = "",
  containerClassName = "",
}) {
  // Resuelve el contenido sin importar si vino por prop o por children.
  const resolvedContent = resolveContent(children, content);

  // Permite que el objeto de contenido siga controlando la tipografia.
  const contentVariant = isTypographyObject(resolvedContent)
    ? resolvedContent.variant
    : undefined;
  const contentColor = isTypographyObject(resolvedContent)
    ? resolvedContent.color
    : undefined;
  const contentAlign = isTypographyObject(resolvedContent)
    ? resolvedContent.align
    : undefined;
  const contentComponent = isTypographyObject(resolvedContent)
    ? resolvedContent.component
    : undefined;
  const contentClassName = isTypographyObject(resolvedContent)
    ? resolvedContent.className
    : "";
  const contentContainerClassName = isTypographyObject(resolvedContent)
    ? resolvedContent.containerClassName
    : "";

  // El contenido puede declarar su propia variante sin pelear con defaults del componente.
  const finalVariant = contentVariant ?? variant ?? "body1";
  const finalColor = color ?? contentColor;
  const finalAlign = contentAlign ?? align ?? "inherit";
  const Component =
    contentComponent ??
    component ??
    (paragraph ? "p" : COMPONENT_BY_VARIANT[finalVariant] ?? "p");

  const text = getTextContent(resolvedContent);

  return (
    <div className={cn(contentContainerClassName, containerClassName)}>
      <Component
        className={cn(
          CLASSNAME_BY_VARIANT[finalVariant] ?? CLASSNAME_BY_VARIANT.body1,
          CLASSNAME_BY_COLOR[finalColor],
          CLASSNAME_BY_ALIGN[finalAlign],
          gutterBottom ? "mb-4" : "",
          noWrap ? "truncate whitespace-nowrap" : "whitespace-pre-line",
          contentClassName,
          className,
        )}
      >
        {text}
      </Component>
    </div>
  );
}

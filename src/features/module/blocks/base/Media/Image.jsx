import activityImage001 from "@/assets/activity/image001.png";
import { cn } from "@/shared/libs/utils";

const MEDIA_VARIANT_TO_RATIO = {
  square: "1 / 1",
  vertical: "2 / 3",
  horizontal: "3 / 2",
};

const MEDIA_VALUE_TO_VARIANT = {
  square: "square",
  "1:1": "square",
  "1 / 1": "square",
  vertical: "vertical",
  "2:3": "vertical",
  "2 / 3": "vertical",
  horizontal: "horizontal",
  "3:2": "horizontal",
  "3 / 2": "horizontal",
};

/**
 * Normaliza una variante visual de media a un valor canonico.
 * Soporta alias por nombre (`horizontal`) y por ratio (`3:2`).
 */
export function normalizeMediaVariant(value) {
  if (!value) return null;

  const normalized = String(value).trim().toLowerCase();
  return MEDIA_VALUE_TO_VARIANT[normalized] ?? null;
}

/**
 * Lee la variante declarada desde un valor simple o desde el objeto media.
 */
export function getMediaVariant(value) {
  if (!value) return null;

  if (typeof value === "object") {
    return normalizeMediaVariant(
      value.variant ?? value.orientation ?? value.layout ?? value.ratio,
    );
  }

  return normalizeMediaVariant(value);
}

/**
 * Devuelve el aspect-ratio CSS listo para aplicarse en el render.
 */
export function getMediaAspectRatio(value) {
  const variant = getMediaVariant(value);
  return variant ? MEDIA_VARIANT_TO_RATIO[variant] : null;
}

/**
 * Image:
 * - Renderiza una imagen simple del sistema.
 * - Si no existe `src`, usa una imagen base para evitar huecos visuales.
 * - Siempre respeta el espacio que el bloque padre ya le asigno.
 */
export default function Image({
  src,
  alt = "Imagen",
  className = "",
  imgClassName = "",
  placeholderLabel = "Imagen",
  variant = null,
  ratio = null,
  fitToContent = false,
  style,
}) {
  const urlBase = "../../../../src/assets/activity/";
  const resolvedSrc = urlBase + src || activityImage001;
  const resolvedAlt = alt || placeholderLabel || "Imagen";
  const aspectRatio = getMediaAspectRatio(variant ?? ratio);
  const aspectStyle = !fitToContent && aspectRatio ? { aspectRatio } : null;
  const resolvedStyle =
    aspectStyle || style
      ? { ...(aspectStyle ?? {}), ...(style ?? {}) }
      : undefined;

  return (
    <div
      className={cn(
        fitToContent
          ? "inline-flex w-fit max-w-full items-center justify-center overflow-hidden"
          : "flex w-full items-center justify-center overflow-hidden",
        className,
      )}
      style={resolvedStyle}>
      <img
        src={resolvedSrc}
        alt={resolvedAlt}
        className={cn(
          // La imagen se adapta solo al espacio disponible del contenedor.
          // Nunca define por si sola el tamano del layout.
          fitToContent
            ? "block h-auto max-h-[var(--card-media-max-height,min(340px,calc(var(--hero-height,100vh)*0.36)))] w-auto max-w-full object-contain"
            : aspectRatio
              ? "h-full w-full max-h-full max-w-full object-contain"
              : "h-auto max-w-full object-contain",
          imgClassName,
        )}
      />
    </div>
  );
}

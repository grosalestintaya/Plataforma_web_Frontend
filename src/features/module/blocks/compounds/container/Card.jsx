import Typography from "../../base/Typography";
import Image from "../../base/Media/Image";
import ZoomableFrame from "../../base/Media/ZoomableFrame";
import { cn } from "@/shared/libs/utils";

function normalizeContent(content, fallbackVariant) {
  if (!content) return null;

  if (typeof content === "object") {
    return {
      ...content,
      variant: content.variant ?? fallbackVariant,
      align: content.align ?? "center",
    };
  }

  return {
    text: content,
    variant: fallbackVariant,
    align: "center",
  };
}

function getCardMedia(media) {
  const src = media?.src ?? media?.img;

  if (!src) return null;

  return {
    src,
    alt: media?.alt ?? "Imagen",
  };
}

function getZoomLabel(title, media) {
  const text =
    title?.text ??
    (typeof title === "string" ? title : null) ??
    media?.alt ??
    "tarjeta";

  return `Ampliar ${text}`;
}

function CardShell({
  title,
  text,
  media,
  className = "",
  mediaClassName = "",
  contentClassName = "",
  titleClassName = "",
  textClassName = "",
  zoomView = false,
}) {
  const resolvedMedia = getCardMedia(media);
  const resolvedTitle = normalizeContent(title, "label");
  const resolvedText = normalizeContent(text, "bodySm");

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-2xl",
        "border border-white/15 bg-transparent",

        /**
         * La Card mide su contenido.
         * No se estira sola al alto del contenedor.
         */
        "h-fit w-full max-h-full max-w-full",

        zoomView ? "p-2" : "p-1.5",

        className,
      )}
    >
      {resolvedMedia ? (
        <div
          className={cn(
            /**
             * La imagen define la proporción visual de la Card.
             * El ancho de la Card viene del wrapper externo.
             */
            "flex w-full min-w-0 shrink-0 items-center justify-center overflow-hidden rounded-xl",
            "aspect-[3/2]",

            /**
             * En zoom, limita el alto de imagen para que entren título y texto.
             */
            zoomView && "max-h-[58vh]",

            mediaClassName,
          )}
        >
          <Image
            src={resolvedMedia.src}
            alt={resolvedMedia.alt}
            className="h-full w-full"
            imageClassName="h-full w-full object-contain"
          />
        </div>
      ) : null}

      {(resolvedTitle || resolvedText) ? (
        <div
          className={cn(
            "flex w-full min-w-0 shrink-0 flex-col items-center text-center",
            zoomView ? "gap-1 pt-1" : "gap-0.5 pt-1",
            contentClassName,
          )}
        >
          {resolvedTitle ? (
            <div
              className={cn(
                "flex w-full min-w-0 items-center justify-center px-2 py-0.5 text-center",
                titleClassName,
              )}
            >
              <Typography
                content={resolvedTitle}
                variant={resolvedTitle.variant}
                align="center"
                className={cn(
                  "block w-full max-w-full text-center font-bold",
                  "break-words [overflow-wrap:anywhere]",
                  "line-clamp-2 text-[clamp(1rem,2.6vw,1.8rem)] leading-tight",
                  zoomView && "text-[clamp(1rem,2vw,1.5rem)]",
                  resolvedTitle.className,
                )}
              />
            </div>
          ) : null}

          {resolvedText ? (
            <div
              className={cn(
                "flex w-full min-w-0 items-center justify-center px-2 py-0.5 text-center",
                textClassName,
              )}
            >
              <Typography
                content={resolvedText}
                variant={resolvedText.variant}
                align="center"
                className={cn(
                  "block w-full max-w-full text-center font-semibold",
                  "break-words [overflow-wrap:anywhere]",
                  "line-clamp-2 text-[clamp(0.75rem,1.5vw,1rem)] leading-snug",
                  zoomView && "text-[clamp(0.75rem,1.2vw,0.95rem)]",
                  resolvedText.className,
                )}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default function Card({
  title,
  text,
  media,
  className = "",
  mediaClassName = "",
  contentClassName = "",
  titleClassName = "",
  textClassName = "",
  zoomable = false,
}) {
  const cardShell = (
    <CardShell
      title={title}
      text={text}
      media={media}
      className={className}
      mediaClassName={mediaClassName}
      contentClassName={contentClassName}
      titleClassName={titleClassName}
      textClassName={textClassName}
    />
  );

  if (!zoomable) return cardShell;

  return (
    <ZoomableFrame
      enabled
      label={getZoomLabel(title, media)}
      triggerClassName="inline-flex h-fit max-h-full w-full max-w-full items-center justify-center"
      modalClassName="flex max-h-[90vh] max-w-[90vw] items-center justify-center overflow-hidden rounded-2xl"
      modalChildren={
        <CardShell
          title={title}
          text={text}
          media={media}
          zoomView
          className="w-[min(90vw,44rem)] bg-black/35 shadow-2xl backdrop-blur-sm"
          mediaClassName={mediaClassName}
          contentClassName={contentClassName}
          titleClassName={titleClassName}
          textClassName={textClassName}
        />
      }
    >
      {cardShell}
    </ZoomableFrame>
  );
}
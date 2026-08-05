import { useRef, useState } from "react";
import CardBase from "../../container/CardBase";
import { cn } from "@/shared/libs/utils";

const FLIP_SURFACE_BY_COLOR = {
  smoke: "border-white/18 bg-neutral-700/20",
  red: "border-[var(--color-lila-200)]/55 bg-[var(--color-lila-400)]",
  gold: "border-[var(--color-gold-100)]/55 bg-[var(--color-gold-400)]",
  blue: "border-[var(--color-blue-100)]/55 bg-[var(--color-blue-400)]",
  green: "border-[var(--color-green-100)]/55 bg-green-600",
  orange: "border-[var(--color-orange-100)]/55 bg-[var(--color-orange-400)]",
  pink: "border-[var(--color-lila-100)]/55 bg-[var(--color-lila-300)]",
  purple: "border-[var(--color-purple-100)]/55 bg-[var(--color-purple-300)]",
};

function resolveSurfaceClass(color) {
  const surfaceColor = String(color ?? "smoke")
    .trim()
    .toLowerCase();

  return FLIP_SURFACE_BY_COLOR[surfaceColor];
}

function getBackCard(interaction) {
  const backCard = interaction?.backCard ?? interaction?.back ?? null;

  if (!backCard) {
    return {
      title: {
        text: "Sin contenido",
        variant: "label",
        align: "center",
      },
      text: null,
    };
  }

  if (typeof backCard === "string") {
    return {
      title: {
        text: backCard,
        variant: "label",
        align: "center",
      },
      text: null,
    };
  }

  return {
    title: backCard?.title ?? null,
    text: backCard?.text ?? null,
    className: backCard?.className,
    contentClassName: backCard?.contentClassName,
    titleClassName: backCard?.titleClassName,
    textClassName: backCard?.textClassName,
    color: backCard?.color ?? null,
  };
}

function getFlipFrameWidthClass(media, size = "normal") {
  const variant = media?.variant ?? media?.ratio ?? "horizontal";

  if (size === "modal") {
    if (variant === "vertical") return "w-[min(100%,22rem)]";
    if (variant === "square") return "w-[min(100%,34rem)]";

    return "w-[min(100%,48rem)]";
  }

  if (!media?.src && !media?.img) {
    return "w-[min(100%,18rem)]";
  }

  if (variant === "vertical") {
    return "w-[min(100%,13rem)]";
  }

  if (variant === "square") {
    return "w-[min(100%,17rem)]";
  }

  return "w-[min(100%,24rem)]";
}

export default function FlipCard({
  title,
  text,
  media,
  interaction,
  selected = false,
  variant = "default",
  size = "normal",
  onComplete,
  interactionOverlay,
  interactionClassName,
  overlay: contentOverlay,
}) {
  const completedRef = useRef(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const backCard = getBackCard(interaction);
  const frontSurfaceClass = resolveSurfaceClass(
    interaction?.frontColor ?? interaction?.color,
  );
  const backSurfaceClass = resolveSurfaceClass(
    interaction?.backColor ?? backCard?.color,
  );

  function completeOnce() {
    if (completedRef.current) return;

    completedRef.current = true;
    onComplete?.();
  }

  function handleFlip() {
    setIsFlipped((current) => !current);
    completeOnce();
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-visible">
      <div
        className={cn(
          "relative h-full min-h-0 max-w-full min-w-0",
          getFlipFrameWidthClass(media, size),
          "[perspective:1000px]",
          interactionClassName,
        )}
      >
        <div
          className={cn(
            "relative grid h-full min-h-0 w-full min-w-0 transition-transform duration-500",
            "[transform-style:preserve-3d]",
            isFlipped && "[transform:rotateY(180deg)]",
          )}
        >
          <div
            className={cn(
              "col-start-1 row-start-1 h-full min-h-0 w-full min-w-0",
              "[backface-visibility:hidden]",
            )}
          >
            <CardBase
              title={title}
              text={text}
              media={media}
              variant={variant}
              selected={selected}
              size={size}
              overlay={
                <>
                  {contentOverlay}
                  {interactionOverlay}
                </>
              }
              className={cn("h-full w-full", frontSurfaceClass)}
            />
          </div>

          <div
            className={cn(
              "col-start-1 row-start-1 h-full min-h-0 w-full min-w-0",
              "[backface-visibility:hidden] [transform:rotateY(180deg)]",
            )}
          >
            <CardBase
              title={backCard.title}
              text={backCard.text}
              media={null}
              variant="ghost"
              selected={selected}
              size={size}
              isBackFace
              className={cn(
                "h-full w-full",
                backSurfaceClass,
                backCard.className,
              )}
              contentClassName={cn(
                "h-full min-h-0 justify-center gap-3 px-4 py-3",
                backCard.contentClassName,
              )}
              titleClassName={cn("font-black", backCard.titleClassName)}
              textClassName={backCard.textClassName}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleFlip}
          aria-label={
            isFlipped ? "Ver frente de la tarjeta" : "Ver reverso de la tarjeta"
          }
          className={cn(
            "absolute inset-0 z-10 rounded-2xl bg-transparent",
            "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
          )}
        />
      </div>
    </div>
  );
}

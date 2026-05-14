import { useRef, useState } from "react";
import CardBase from "../../container/CardBase";
import { cn } from "@/shared/libs/utils";

const BACK_TONE_CLASS = {
  income:
    "border-emerald-300/40 bg-emerald-500/25 text-emerald-50 shadow-[0_0_24px_rgba(16,185,129,0.18)]",
  expense:
    "border-rose-300/40 bg-rose-500/25 text-rose-50 shadow-[0_0_24px_rgba(244,63,94,0.18)]",
  default: "border-white/15 bg-black/30 text-white",
};

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
    color: backCard?.color,
  };
}

function getBackTone(backCard) {
  const title = backCard?.title;
  const explicitColor = title?.color ?? backCard?.color;

  const titleText = String(
    title?.text ?? (typeof title === "string" ? title : ""),
  )
    .trim()
    .toLowerCase();

  if (explicitColor === "success" || titleText.includes("ingreso")) {
    return "income";
  }

  if (
    explicitColor === "danger" ||
    explicitColor === "error" ||
    titleText.includes("gasto")
  ) {
    return "expense";
  }

  return "default";
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
}) {
  const completedRef = useRef(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const backCard = getBackCard(interaction);
  const backTone = getBackTone(backCard);

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
              className="h-full w-full"
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
                BACK_TONE_CLASS[backTone],
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

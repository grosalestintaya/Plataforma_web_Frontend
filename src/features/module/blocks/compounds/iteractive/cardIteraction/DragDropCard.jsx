import CardBase from "../../container/CardBase";
import { cn } from "@/shared/libs/utils";

function getTitleText(title) {
  if (!title) return "objeto";
  if (typeof title === "string" || typeof title === "number")
    return String(title);
  return title?.text ?? "objeto";
}

export default function DragDropCard({
  title,
  text,
  media,
  selected = false,
  variant = "ghost",
  size = "normal",
  interaction,
  onComplete,
  interactionOverlay,
  interactionClassName,
  overlay: contentOverlay,
  className,
  contentClassName,
  titleClassName,
  ...cardProps
}) {
  const itemId = interaction?.itemId;
  const compact = Boolean(interaction?.compact);
  const draggable = interaction?.draggable !== false;

  function handleClick(event) {
    interaction?.onClick?.(event, itemId);
    onComplete?.();
  }

  function handleDragStart(event) {
    if (!itemId || !draggable) return;

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", itemId);

    interaction?.onDragStart?.(event, itemId);
    onComplete?.();
  }

  function handleDragEnd(event) {
    interaction?.onDragEnd?.(event, itemId);
  }

  const overlay = (
    <>
      {contentOverlay}
      {interactionOverlay}
      <button
        type="button"
        draggable={draggable}
        onClick={handleClick}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        aria-label={`Mover ${getTitleText(title)}`}
        className={cn(
          "absolute inset-0 z-10 rounded-2xl bg-transparent",
          draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        )}
      />
    </>
  );

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden p-0.5">
      <CardBase
        title={title}
        text={text}
        media={media}
        selected={selected}
        variant={variant}
        size={size}
        interactive
        overlay={overlay}
        className={cn(
          "h-full w-full max-w-none rounded-xl p-1 shadow-none",
          "border-white/15 bg-white/5",
          compact && "p-0.5",
          selected && "border-yellow-300 bg-yellow-300/15 text-yellow-50",
          interactionClassName,
          className,
        )}
        contentClassName={cn(
          "px-1 py-1",
          compact && "px-0.5 py-0.5",
          contentClassName,
        )}
        titleClassName={cn(
          "text-white",
          compact ? "text-[11px] leading-[1.05]" : "text-xs leading-[1.05]",
          titleClassName,
        )}
        {...cardProps}
      />
    </div>
  );
}

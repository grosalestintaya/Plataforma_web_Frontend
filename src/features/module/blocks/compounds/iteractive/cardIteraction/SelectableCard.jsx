import { useRef } from "react";
import CardBase from "../../container/CardBase";
import { cn } from "@/shared/libs/utils";

export default function SelectableCard({
  title,
  text,
  media,
  interaction,
  selected = false,
  variant = "default",
  size = "normal",
  onSelect,
  onComplete,
  overlay: contentOverlay,
  interactionOverlay,
  interactionClassName,
  ariaLabel = "Seleccionar tarjeta",
  className = "",
  contentClassName = "",
  titleClassName = "",
  textClassName = "",
}) {
  const completedRef = useRef(false);

  function completeOnce() {
    if (completedRef.current) return;

    completedRef.current = true;
    onComplete?.();
  }

  function handleSelect(event) {
    onSelect?.(event);
    completeOnce();
  }

  const overlay = (
    <>
      {contentOverlay}
      {interactionOverlay}
      <button
        type="button"
        onClick={handleSelect}
        aria-label={ariaLabel}
        aria-pressed={selected}
        className={cn(
          "absolute inset-0 z-20 rounded-[inherit] bg-transparent",
          "cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-gold-100)]/85 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20",
        )}
      />
    </>
  );

  return (
    <CardBase
      title={title}
      text={text}
      media={media}
      variant={variant}
      selected={selected}
      size={size}
      interactive
      overlay={overlay}
      contentClassName={contentClassName}
      titleClassName={titleClassName}
      textClassName={textClassName}
      className={cn(
        interactionClassName,
        interaction?.className,
        className,
        selected && ["border-4 border-[var(--color-gold-200)]"],
      )}
    />
  );
}

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
}) {
  const completedRef = useRef(false);

  function completeOnce() {
    if (completedRef.current) return;

    completedRef.current = true;
    onComplete?.();
  }

  function handleSelect() {
    onSelect?.();
    completeOnce();
  }

  const overlay = (
    <button
      type="button"
      onClick={handleSelect}
      aria-label="Seleccionar tarjeta"
      aria-pressed={selected}
      className={cn(
        "absolute inset-0 z-10 rounded-2xl bg-transparent",
        "cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-gold-100)]/85 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20",
      )}
    />
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
      className={cn(
        interaction?.className,
        selected && [
          "border-4 border-[var(--color-gold-200)]",
        ],
      )}
    />
  );
}
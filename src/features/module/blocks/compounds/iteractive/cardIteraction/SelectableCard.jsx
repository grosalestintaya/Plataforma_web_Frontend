import { useRef } from "react";
import CardBase from "../../container/CardBase";
import { cn } from "@/shared/libs/utils";

export default function SelectableCard({
  title,
  text,
  media,
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
      variant={selected ? "solid" : variant}
      selected={selected}
      size={size}
      interactive
      overlay={overlay}
      className={cn(
        selected && [
          "border-4 border-[var(--color-gold-200)]",
          "bg-gradient-to-br from-[var(--color-gold-100)]/30 via-[var(--color-gold-200)]/18 to-white/10",
        ],
      )}
    />
  );
}

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
        "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300/80",
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
          "border-yellow-300/90",
          "ring-2 ring-yellow-300/90",
          "bg-yellow-300/10",
        ],
      )}
    />
  );
}

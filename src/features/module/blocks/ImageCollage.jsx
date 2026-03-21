import Image from "./Image";
import Typografia from "./Typografia";
import { cn } from "@/shared/libs/utils";

export default function ImageCollage({ items = [], className, itemClassName }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-flow-col sm:auto-cols-fr",
        className,
      )}
    >
      {items.slice(0, items.length).map((it, idx) => (
        <div
          key={idx}
          className={cn("flex min-w-5 flex-col items-center", itemClassName)}
        >
          <Image src={it.src} alt={it.alt ?? it.label ?? "Ejemplo"} />
          {it.label && (
            <Typografia className="mt-2" content={it.label} />
          )}
        </div>
      ))}
    </div>
  );
}

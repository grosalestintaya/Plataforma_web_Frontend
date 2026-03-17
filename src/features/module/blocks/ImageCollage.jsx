import  Image  from "./Image";
import { cn } from "@/shared/libs/utils";

export default function ImageCollage({ items = [], className, itemClassName, }) {
  return (
    <div className={cn("grid sm:grid-flow-col grid-cols-2 auto-cols-fr gap-3 ", className)}>
    {/* <div className={`grid grid-cols-2 sm:grid-cols-${items.length} gap-3 justify-center`}> */}
      {items.slice(0,items.length ).map((it, idx) => (
        <div key={idx} className={cn("flex flex-col items-center min-w-5", itemClassName)}>
          <Image src={it.src} alt={it.alt ?? it.label ?? "Ejemplo"} />
          {it.label && <span className="mt-2 text-white/90 text-xs font-semibold">{it.label}</span>}
        </div>
      ))}
    </div>
  );
}

    // <div
    //   className={cn(
    //     "w-full h-full max-w-[95vw] grid gap-4 p-4 sm:p-6 md:p-8 overflow-hidden content-center",
    //     "[grid-template-columns:var(--cols)] [grid-template-rows:var(--rows)] [grid-template-areas:var(--areas)]",
    //     layout.md?.cols ? "md:[grid-template-columns:var(--cols-md)]" : "",
    //     layout.md?.rows ? "md:[grid-template-rows:var(--rows-md)]" : "",
    //     mdAreas ? "md:[grid-template-areas:var(--areas-md)]" : "",
    //     className
    //   )}
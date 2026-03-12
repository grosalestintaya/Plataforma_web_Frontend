import Image from "./Image";
import { cn } from "@/shared/libs/utils";

function CompareItem({ item }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Image src={item?.img?.src} alt={item?.img?.alt ?? item?.label ?? "item"} />

      {item?.label && (
        <div className="text-white/90 text-xs font-semibold text-center break-words">
          {item.label}
        </div>
      )}

      {item?.note && (
        <div className="text-white/85 text-xs text-center break-words max-w-[260px]">
          {item.note}
        </div>
      )}

      {item?.result && (
        <div className="mt-1 px-3 py-1 rounded-sm bg-black/20 border border-white/20 text-white text-xs font-semibold">
          {item.result}
        </div>
      )}
    </div>
  );
}

export default function Compare2Cards({ items = [], className }) {
  const left = items?.[0];
  const right = items?.[1];

  return (
    <div className={cn("w-full flex items-center justify-center", className)}>
      <div className="w-full max-w-[820px] grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompareItem item={left} />
        <CompareItem item={right} />
      </div>
    </div>
  );
}